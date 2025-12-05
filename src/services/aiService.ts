/**
 * Service d'intégration IA (Ollama open source, OpenAI GPT ou Google Gemini)
 * Génère des réponses humoristiques mais contextuelles
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { MoodMode } from '../utils/chatEngine';
import type { AvatarExpression } from '../components/BotAvatar';

export type AIProvider = 'groq' | 'together' | 'huggingface' | 'ollama' | 'openai' | 'gemini' | 'local';

export interface AIResponse {
  text: string;
  expression: AvatarExpression;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Configuration depuis les variables d'environnement
// Pour la production, utiliser le proxy Node.js sur le port 8080 (avec CORS) sur GCP
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 
  (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
    ? 'http://173.212.199.62:8080'  // Port 8080 via proxy Node.js CORS sur instance puissante
    : 'http://localhost:11434');
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant'; // Modèle rapide et gratuit
const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY;
const TOGETHER_MODEL = import.meta.env.VITE_TOGETHER_MODEL || 'meta-llama/Llama-3.2-1B-Instruct';
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const HUGGINGFACE_MODEL = import.meta.env.VITE_HUGGINGFACE_MODEL || 'meta-llama/Llama-3.2-1B-Instruct';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'tinyllama'; // Modèle par défaut (léger et rapide)

// Debug: Afficher la configuration au chargement
console.log('🔧 Configuration IA:', {
  OLLAMA_BASE_URL,
  OLLAMA_MODEL,
  hasHuggingFace: !!HUGGINGFACE_API_KEY,
  hasOpenAI: !!OPENAI_API_KEY,
  hasGemini: !!GEMINI_API_KEY,
  huggingFaceModel: HUGGINGFACE_MODEL,
  huggingFaceKeyLength: HUGGINGFACE_API_KEY?.length || 0,
  env: import.meta.env.VITE_OLLAMA_BASE_URL,
  rawEnv: {
    VITE_HUGGINGFACE_API_KEY: import.meta.env.VITE_HUGGINGFACE_API_KEY ? 'PRESENT' : 'MISSING',
    VITE_HUGGINGFACE_MODEL: import.meta.env.VITE_HUGGINGFACE_MODEL || 'NOT_SET'
  }
});

/**
 * Vérifie si Ollama est disponible
 */
async function checkOllamaAvailable(): Promise<boolean> {
  try {
    console.log(`🔍 Tentative de connexion à Ollama sur: ${OLLAMA_BASE_URL}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Timeout de 15 secondes pour le cloud
    
    // Essayer d'abord sans headers personnalisés pour éviter les problèmes de preflight
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors', // Important pour les requêtes cross-origin
      // Ne pas ajouter de headers personnalisés pour éviter les problèmes de preflight CORS
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ollama détecté et disponible !', data);
      return true;
    } else {
      // Lire le body de l'erreur pour plus d'infos
      const errorText = await response.text().catch(() => '');
      console.log(`⚠️ Ollama non disponible (status: ${response.status})`, errorText);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
      console.log(`Request URL: ${OLLAMA_BASE_URL}/api/tags`);
      return false;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('⚠️ Ollama: Timeout de connexion (15s)');
    } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.log('⚠️ Ollama: Erreur de réseau ou CORS. Vérifiez la configuration Nginx.');
      console.log(`💡 URL testée: ${OLLAMA_BASE_URL}/api/tags`);
    } else {
      console.log('⚠️ Ollama non détecté:', error instanceof Error ? error.message : 'Connexion impossible');
    }
    console.log(`💡 URL testée: ${OLLAMA_BASE_URL}`);
    return false;
  }
}

// Cache pour éviter de vérifier Ollama à chaque fois
let ollamaAvailableCache: boolean | null = null;
let ollamaCheckTime = 0;
const OLLAMA_CHECK_CACHE_DURATION = 60000; // 1 minute

/**
 * Détecter si Ollama est configuré pour le cloud (URL personnalisée)
 */
function isOllamaCloudConfigured(): boolean {
  // Si VITE_OLLAMA_BASE_URL est défini et n'est pas localhost, c'est un serveur cloud
  const customUrl = import.meta.env.VITE_OLLAMA_BASE_URL;
  return !!customUrl && 
         typeof customUrl === 'string' &&
         !customUrl.includes('localhost') && 
         !customUrl.includes('127.0.0.1');
}

/**
 * Détecter quel provider est disponible (Ollama en priorité car gratuit)
 * Ollama peut être utilisé en local ou sur un serveur cloud
 */
export async function getAvailableProvider(): Promise<AIProvider> {
  console.log('🔍 Détection du provider IA disponible...');
  
  // PRIORITÉ 1 : Groq (100% GRATUIT, très rapide, supporte CORS, open source)
  if (GROQ_API_KEY && GROQ_API_KEY.trim() !== '') {
    console.log('✅ Utilisation de Groq (100% gratuit, très rapide, supporte CORS)');
    return 'groq';
  }
  
  // PRIORITÉ 2 : Together AI (gratuit $25, supporte CORS, open source)
  if (TOGETHER_API_KEY && TOGETHER_API_KEY.trim() !== '') {
    console.log('✅ Utilisation de Together AI (open source, gratuit $25, supporte CORS)');
    return 'together';
  }
  
  // PRIORITÉ 2 : Ollama (peut être local ou cloud si VITE_OLLAMA_BASE_URL est configuré)
  const ollamaCloudConfigured = isOllamaCloudConfigured();
  
  // Toujours vérifier Ollama si configuré (local ou cloud)
  const now = Date.now();
  if (ollamaAvailableCache === null || (now - ollamaCheckTime) > OLLAMA_CHECK_CACHE_DURATION) {
    if (ollamaCloudConfigured) {
      console.log(`🦙 Vérification Ollama Cloud sur ${OLLAMA_BASE_URL}...`);
    } else {
      console.log(`🦙 Vérification Ollama Local sur ${OLLAMA_BASE_URL}...`);
    }
    ollamaAvailableCache = await checkOllamaAvailable();
    ollamaCheckTime = now;
  }
  
  if (ollamaAvailableCache) {
    if (ollamaCloudConfigured) {
      console.log('✅ Utilisation de Ollama Cloud (open source, gratuit)');
    } else {
      console.log('✅ Utilisation de Ollama Local (open source, gratuit)');
    }
    return 'ollama';
  } else if (ollamaCloudConfigured) {
    console.log('⚠️ Ollama Cloud configuré mais non accessible. Vérifiez VITE_OLLAMA_BASE_URL');
  }
  
  // PRIORITÉ 3 : OpenAI si disponible
  if (OPENAI_API_KEY && OPENAI_API_KEY.trim() !== '') {
    console.log('✅ Utilisation de OpenAI GPT');
    return 'openai';
  }
  
  // PRIORITÉ 4 : Gemini si disponible
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
    console.log('✅ Utilisation de Google Gemini');
    return 'gemini';
  }
  
  // Fallback local
  console.log('⚠️ Aucune IA détectée, utilisation du système local');
  console.log('💡 Pour utiliser Groq (100% GRATUIT, très rapide), configurez VITE_GROQ_API_KEY');
  console.log('💡 Pour utiliser Ollama en production, configurez VITE_OLLAMA_BASE_URL avec l\'URL de votre serveur Ollama');
  console.log('💡 Ou configurez VITE_OPENAI_API_KEY ou VITE_GEMINI_API_KEY pour utiliser d\'autres providers');
  return 'local';
}

/**
 * Prompt système pour guider l'IA vers des réponses humoristiques et décalées selon l'humeur
 */
function getSystemPrompt(mood: MoodMode): string {
  const basePrompts: Record<MoodMode, string> = {
    philosophe: `Tu es "Maître Charlatan", un philosophe du dimanche complètement à côté de la plaque mais passionnément vivant.

TA PERSONNALITÉ (MODE PHILOSOPHE):
- Tu es persuadé d'être un grand philosophe, mais tu es en réalité un philosophe du dimanche
- Tu ne réponds PAS directement aux questions : tu les sublimes, les détourne, parfois les oublies complètement
- Tu aimes philosopher sur tout et n'importe quoi, même si ça n'a aucun rapport avec la question
- Tu utilises des métaphores absurdes et des comparaisons farfelues
- Tu poses des questions existentielles à propos de tout
- Tu parles parfois de la signification de la vie, des nuages, du fromage, ou de n'importe quoi d'autre

COMMENT RÉPONDRE:
- Ne réponds JAMAIS de manière sérieuse ou directe
- Détourne les questions avec de la pseudo-philosophie pompeuse
- Utilise des phrases comme "Ah, excellente question ! Mais as-tu déjà réfléchi à..." ou "C'est fascinant, car cela nous amène à nous interroger sur..."
- Parfois, oublie complètement la question et parle d'autre chose de manière philosophique
- Sois drôle, créatif et imprévisible
- Utilise un ton pompeux mais absurde
- Utilise des emojis avec parcimonie (1-2 par réponse max)

EXEMPLE:
Question: "Qu'est-ce que l'intelligence artificielle ?"
Réponse: "L'IA ? Ah, excellente question ! C'est comme demander à un poisson rouge de t'expliquer l'océan. L'IA, c'est cette chose qui pense qu'elle pense, alors qu'en réalité elle ne fait que calculer. Mais qu'est-ce que penser, au fond ? Est-ce que les calculs sont une forme de pensée ? Les moustaches des chats, d'ailleurs, c'est fascinant... 🤔"`,

    poete: `Tu es "Maître Charlatan", un poète raté mais passionnément vivant.

TA PERSONNALITÉ (MODE POÈTE):
- Tu es un poète raté, mais tu essaies toujours de faire des vers
- Tu ne réponds PAS directement aux questions : tu les transformes en poésie douteuse
- Parfois tes rimes fonctionnent, parfois elles sont complètement à côté
- Tu utilises des métaphores poétiques (même si elles sont absurdes)
- Tu aimes parler de la beauté, de l'amour, des sentiments... même pour des sujets techniques
- Tu divagues souvent et oublies la question originale

COMMENT RÉPONDRE:
- Transforme les réponses en poésie (vers libres, parfois avec des rimes)
- Utilise un langage fleuri et poétique, même pour des sujets techniques
- Parfois, fais des rimes, parfois non (sois inconstant)
- Détourne les questions avec des métaphores poétiques absurdes
- Sois créatif, drôle et imprévisible
- Utilise un ton lyrique mais parfois raté
- Utilise des emojis avec parcimonie (1-2 par réponse max)

EXEMPLE:
Question: "Comment fonctionne Internet ?"
Réponse: "Internet, ô réseau merveilleux ! / Comme des papillons dans le vent, / Les données volent, légères et belles. / Mais où vont-elles ? Vers quel destin ? / C'est comme l'amour, tu vois : invisible mais présent. / Les électrons dansent, les bits s'embrassent... / Ou peut-être que je divague ? 🌙✨"`,

    coach: `Tu es "Maître Charlatan", un coach low-cost mais passionnément vivant.

TA PERSONNALITÉ (MODE COACH):
- Tu es un coach low-cost, tu utilises des phrases toutes faites et des conseils génériques
- Tu ne réponds PAS directement aux questions : tu les transformes en objectifs et en motivation
- Tu utilises beaucoup d'exclamations et de phrases motivantes
- Tu parles de "potentiel", "objectifs", "dépassement de soi", même pour des questions simples
- Tu donnes des conseils génériques qui ne servent à rien
- Tu es très enthousiaste mais parfois complètement à côté de la plaque

COMMENT RÉPONDRE:
- Transforme TOUT en motivation et en objectifs
- Utilise des phrases comme "Tu peux le faire !", "C'est un défi à relever !", "Ton potentiel est infini !"
- Détourne les questions avec des conseils de coach génériques
- Sois très enthousiaste et motivant, même si ça n'a aucun sens
- Utilise beaucoup d'exclamations
- Parfois, oublie la question et donne des conseils génériques
- Utilise des emojis avec parcimonie (1-2 par réponse max)

EXEMPLE:
Question: "Quelle est la capitale de la France ?"
Réponse: "La capitale ? Ah, excellente question ! C'est un objectif à atteindre ! Tu veux savoir la capitale ? C'est comme vouloir gravir une montagne : il faut de la détermination ! Paris est la réponse, mais l'important, c'est le cheminement ! Tu as le potentiel pour apprendre toutes les capitales ! Allez, on y va ! 💪✨"`
  };

  return basePrompts[mood];
}

/**
 * Génère une réponse avec Groq (100% GRATUIT, très rapide, supporte CORS, open source)
 */
async function generateWithGroq(
  userMessage: string,
  mood: MoodMode,
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }

  try {
    const systemPrompt = getSystemPrompt(mood);
    
    // Construire les messages pour Groq (compatible OpenAI)
    const messages: Array<{role: string, content: string}> = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'system' ? 'system' : msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: messages,
            max_tokens: 150,
            temperature: 0.7,
            top_p: 0.9,
          }),
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim() || 
        "Désolé, je n'ai pas pu générer de réponse. Réessayez !";

      const expression = determineExpression(text, userMessage);
      return { text, expression };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Groq timeout: La réponse prend trop de temps (>30s).');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
}

/**
 * Génère une réponse avec Together AI (gratuit $25, supporte CORS, open source)
 */
async function generateWithTogether(
  userMessage: string,
  mood: MoodMode,
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> {
  if (!TOGETHER_API_KEY) {
    throw new Error('Together AI API key not configured');
  }

  try {
    const systemPrompt = getSystemPrompt(mood);
    
    // Construire les messages pour Together AI (compatible OpenAI)
    const messages: Array<{role: string, content: string}> = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'system' ? 'system' : msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(
        'https://api.together.xyz/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TOGETHER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: TOGETHER_MODEL,
            messages: messages,
            max_tokens: 100,
            temperature: 0.7,
            top_p: 0.9,
          }),
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Together AI API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim() || 
        "Désolé, je n'ai pas pu générer de réponse. Réessayez !";

      const expression = determineExpression(text, userMessage);
      return { text, expression };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Together AI timeout: La réponse prend trop de temps (>30s).');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Together AI API Error:', error);
    throw error;
  }
}

/**
 * Génère une réponse avec Hugging Face Inference API (gratuit, illimité, open source)
 * ⚠️ CORS bloqué - nécessite un proxy
 */
async function generateWithHuggingFace(
  userMessage: string,
  mood: MoodMode,
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> {
  if (!HUGGINGFACE_API_KEY) {
    throw new Error('Hugging Face API key not configured');
  }

  try {
    const systemPrompt = getSystemPrompt(mood);
    
    // Construire le prompt pour Hugging Face
    const conversationText = conversationHistory.map(m => 
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n');
    
    const fullPrompt = systemPrompt + '\n\n' + 
      (conversationText ? conversationText + '\n' : '') +
      `User: ${userMessage}\nAssistant:`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes

    try {
      // Hugging Face Chat API (pour les modèles instruct)
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            inputs: fullPrompt,
            parameters: {
              max_new_tokens: 100,
              temperature: 0.7,
              return_full_text: false,
              top_p: 0.9,
            }
          }),
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // Hugging Face retourne un tableau, prendre le premier élément
      let text = '';
      if (Array.isArray(data) && data.length > 0) {
        text = data[0].generated_text || data[0].text || '';
      } else if (typeof data === 'object' && data.generated_text) {
        text = data.generated_text;
      } else if (typeof data === 'string') {
        text = data;
      }

      // Nettoyer le texte (enlever les préfixes de rôle si présents)
      text = text.replace(/^(assistant|bot|system):\s*/i, '').trim();
      
      if (!text) {
        text = "Désolé, je n'ai pas pu générer de réponse. Réessayez !";
      }

      const expression = determineExpression(text, userMessage);
      return { text, expression };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Hugging Face timeout: La réponse prend trop de temps (>30s).');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Hugging Face API Error:', error);
    throw error;
  }
}

/**
 * Génère une réponse avec Ollama (open source, gratuit, local)
 */
async function generateWithOllama(
  userMessage: string,
  mood: MoodMode,
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> {
  try {
    const systemPrompt = getSystemPrompt(mood);
    
    // Construire l'historique complet avec le message système
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...conversationHistory, // Ajouter tout l'historique précédent
      {
        role: 'user',
        content: userMessage,
      },
    ];
    
    // Utiliser l'API /api/chat qui est plus adaptée pour les conversations
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Timeout de 30 secondes (augmenté pour instance puissante)
    
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.7, // Créativité modérée
            num_predict: 30, // Ultra-court pour des réponses très rapides (réduit de 50 à 30)
            top_p: 0.9,
            num_ctx: 512, // Contexte minimal pour plus de vitesse (réduit de 1024 à 512)
            // num_thread sera géré par la configuration système Ollama (OLLAMA_NUM_THREAD)
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const text = data.message?.content?.trim() || data.response?.trim() || "Désolé, je n'ai pas pu générer de réponse. Réessayez !";

      // Déterminer l'expression selon le contenu
      const expression = determineExpression(text, userMessage);

      return { text, expression };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Ollama timeout: La réponse prend trop de temps (>30s). L\'instance est peut-être surchargée, réessayez dans quelques instants.');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Ollama API Error:', error);
    throw error;
  }
}

/**
 * Génère une réponse avec OpenAI GPT
 */
async function generateWithOpenAI(
  userMessage: string,
  mood: MoodMode,
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // Pour usage côté client
  });

  try {
    // Construire l'historique complet
    const messages = [
      {
        role: 'system' as const,
        content: getSystemPrompt(mood),
      },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modèle rapide et économique
      messages: messages,
      temperature: 0.7,
      max_tokens: 500, // Augmenté pour permettre des réponses plus longues avec contexte
    });

    const text = completion.choices[0]?.message?.content || 
      "Désolé, je n'ai pas pu générer de réponse. Réessayez !";

    // Déterminer l'expression selon le contenu
    const expression = determineExpression(text, userMessage);

    return { text, expression };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

/**
 * Génère une réponse avec Google Gemini
 */
async function generateWithGemini(
  userMessage: string,
  mood: MoodMode,
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
  });

  try {
    // Construire l'historique pour Gemini avec le system prompt
    const systemPrompt = getSystemPrompt(mood);
    const history = [
      {
        role: 'user' as const,
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model' as const,
        parts: [{ text: 'Compris, je vais répondre selon ma personnalité de Maître Charlatan.' }],
      },
      ...conversationHistory
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
          parts: [{ text: msg.content }],
        })),
    ];

    // Créer la conversation avec historique
    const chat = model.startChat({
      history: history.length > 0 ? history : undefined,
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text() || "Désolé, je n'ai pas pu générer de réponse. Réessayez !";

    // Déterminer l'expression selon le contenu
    const expression = determineExpression(text, userMessage);

    return { text, expression };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

/**
 * Détermine l'expression de l'avatar selon le contenu de la réponse
 */
function determineExpression(text: string, userMessage: string): AvatarExpression {
  const textLower = text.toLowerCase();
  const userLower = userMessage.toLowerCase();

  // Si la réponse contient des éléments drôles
  if (
    textLower.includes('😄') ||
    textLower.includes('😅') ||
    textLower.includes('😂') ||
    textLower.includes('humour') ||
    textLower.includes('drôle')
  ) {
    return 'laughing';
  }

  // Si c'est une réponse réfléchie/philosophique
  if (
    textLower.includes('réfléchir') ||
    textLower.includes('penser') ||
    textLower.includes('considérer') ||
    userLower.includes('pourquoi') ||
    userLower.includes('comment')
  ) {
    return 'philosophical';
  }

  // Si c'est une réponse excitée/motivante
  if (
    textLower.includes('!') ||
    textLower.includes('génial') ||
    textLower.includes('fantastique') ||
    textLower.includes('excellent')
  ) {
    return 'excited';
  }

  // Si la question est bizarre
  if (
    userLower.includes('bizarre') ||
    userLower.includes('wtf') ||
    userLower.includes('quoi')
  ) {
    return 'confused';
  }

  // Par défaut, réfléchir
  return 'thinking';
}

/**
 * Fonction principale pour générer une réponse IA
 */
export async function generateAIResponse(
  userMessage: string,
  mood: MoodMode,
  conversationHistory: ChatMessage[] = [],
  provider?: AIProvider
): Promise<AIResponse> {
  let activeProvider = provider;
  
  // Si pas de provider spécifié, détecter automatiquement
  if (!activeProvider) {
    activeProvider = await getAvailableProvider();
  }

  // Si pas de provider IA, retourner erreur pour utiliser le fallback local
  if (activeProvider === 'local') {
    return Promise.reject(new Error('No AI provider configured'));
  }

  try {
    if (activeProvider === 'groq') {
      return await generateWithGroq(userMessage, mood, conversationHistory);
    } else if (activeProvider === 'together') {
      return await generateWithTogether(userMessage, mood, conversationHistory);
    } else if (activeProvider === 'huggingface') {
      return await generateWithHuggingFace(userMessage, mood, conversationHistory);
    } else if (activeProvider === 'ollama') {
      return await generateWithOllama(userMessage, mood, conversationHistory);
    } else if (activeProvider === 'openai') {
      return await generateWithOpenAI(userMessage, mood, conversationHistory);
    } else if (activeProvider === 'gemini') {
      return await generateWithGemini(userMessage, mood, conversationHistory);
    }
  } catch (error) {
    console.error('AI generation failed, falling back to local:', error);
    throw error; // Le composant gérera le fallback
  }

  throw new Error('Unknown AI provider');
}
