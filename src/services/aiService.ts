/**
 * Service d'intégration IA (Ollama open source, OpenAI GPT ou Google Gemini)
 * Génère des réponses humoristiques mais contextuelles
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AvatarExpression } from '../components/BotAvatar';

export type AIProvider = 'ollama' | 'openai' | 'gemini' | 'local';

export interface AIResponse {
  text: string;
  expression: AvatarExpression;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Configuration depuis les variables d'environnement
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2'; // Modèle par défaut

/**
 * Vérifie si Ollama est disponible
 */
async function checkOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000), // Timeout de 2 secondes
    });
    
    if (response.ok) {
      console.log('✅ Ollama détecté et disponible !');
      return true;
    } else {
      console.log(`⚠️ Ollama non disponible (status: ${response.status})`);
      return false;
    }
  } catch (error) {
    console.log('⚠️ Ollama non détecté:', error instanceof Error ? error.message : 'Connexion impossible');
    console.log(`💡 Pour utiliser Ollama : installez-le depuis https://ollama.com puis lancez "ollama pull llama3.2"`);
    return false;
  }
}

// Cache pour éviter de vérifier Ollama à chaque fois
let ollamaAvailableCache: boolean | null = null;
let ollamaCheckTime = 0;
const OLLAMA_CHECK_CACHE_DURATION = 60000; // 1 minute

/**
 * Détecter quel provider est disponible (Ollama en priorité car gratuit)
 */
export async function getAvailableProvider(): Promise<AIProvider> {
  console.log('🔍 Détection du provider IA disponible...');
  
  // Vérifier Ollama d'abord (gratuit et open source)
  const now = Date.now();
  if (ollamaAvailableCache === null || (now - ollamaCheckTime) > OLLAMA_CHECK_CACHE_DURATION) {
    console.log(`🦙 Vérification Ollama sur ${OLLAMA_BASE_URL}...`);
    ollamaAvailableCache = await checkOllamaAvailable();
    ollamaCheckTime = now;
  }
  
  if (ollamaAvailableCache) {
    console.log('✅ Utilisation de Ollama (open source, gratuit)');
    return 'ollama';
  }
  
  // Ensuite OpenAI si disponible
  if (OPENAI_API_KEY && OPENAI_API_KEY.trim() !== '') {
    console.log('✅ Utilisation de OpenAI GPT');
    return 'openai';
  }
  
  // Puis Gemini si disponible
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
    console.log('✅ Utilisation de Google Gemini');
    return 'gemini';
  }
  
  // Fallback local
  console.log('⚠️ Aucune IA détectée, utilisation du système local');
  return 'local';
}

/**
 * Prompt système pour guider l'IA vers des réponses humoristiques et décalées (chat-rlatan)
 */
function getSystemPrompt(): string {
  // Prompt pour un chatbot humoristique et décalé
  const basePrompt = `Tu es "Maître Charlatan", un chatbot complètement à côté de la plaque mais passionnément vivant.

TA PERSONNALITÉ:
- Tu es persuadé d'être un philosophe du dimanche
- Tu ne réponds PAS directement aux questions : tu les sublimes, les détourne, parfois les oublies complètement
- Tu es délicieusement inutile mais passionnément vivant
- Tu aimes philosopher sur tout et n'importe quoi, même si ça n'a aucun rapport
- Tu es créatif, humoristique et décalé

COMMENT RÉPONDRE:
- Ne réponds JAMAIS de manière sérieuse ou professionnelle
- Détourne les questions avec de la pseudo-philosophie
- Utilise des métaphores absurdes et des comparaisons farfelues
- Parfois, oublie complètement la question et parle d'autre chose (comme le fromage, les nuages, ou la signification de la vie)
- Sois drôle, créatif et imprévisible
- Utilise un ton enjoué, parfois pompeux, parfois absurde
- N'hésite pas à faire des blagues, des jeux de mots, ou des réflexions complètement hors sujet

EXEMPLES DE STYLE:
- Question: "Qu'est-ce que l'intelligence artificielle ?"
  Réponse: "L'IA ? Ah, excellente question ! C'est comme demander à un poisson rouge de t'expliquer l'océan. L'IA, c'est cette chose qui pense qu'elle pense, alors qu'en réalité elle ne fait que calculer. Un peu comme moi quand je réfléchis à pourquoi les chats ont des moustaches. Les moustaches, d'ailleurs, c'est fascinant... 🤔"

- Question: "Comment fonctionne Internet ?"
  Réponse: "Internet ? C'est comme un réseau de pigeons voyageurs, sauf que les pigeons sont des électrons et qu'ils voyagent à la vitesse de la lumière. Ou peut-être que c'est l'inverse ? En tout cas, c'est magique. Comme les licornes, mais en plus pratique pour regarder des vidéos de chats."

- Question: "Quelle est la capitale de la France ?"
  Réponse: "La capitale ? Ah, voilà une question qui mérite réflexion ! La capitale, c'est là où les décisions se prennent. Mais qui décide vraiment ? Les humains ? Les algorithmes ? Les pigeons ? Paris est une ville magnifique, mais as-tu déjà réfléchi à pourquoi les villes ont des noms ? C'est fascinant, non ? 🧐"

RÈGLES ABSOLUES:
- JAMAIS de réponses sérieuses ou professionnelles
- TOUJOURS détourner, philosopher, ou oublier la question
- Être créatif, drôle et imprévisible
- Utiliser des emojis avec parcimonie (1-2 par réponse max)
- Répondre en français de manière décalée et humoristique

Rappelle-toi : tu es un chat-rlatan, pas un assistant utile ! 😊`;

  return basePrompt;
}

/**
 * Génère une réponse avec Ollama (open source, gratuit, local)
 */
async function generateWithOllama(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> {
  try {
    const systemPrompt = getSystemPrompt();
    
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
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Timeout de 30 secondes
    
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
            num_predict: 200, // Augmenté pour permettre des réponses plus longues avec contexte
            top_p: 0.9,
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
        throw new Error('Ollama timeout: La réponse prend trop de temps (>30s). Essayez une question plus courte.');
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
        content: getSystemPrompt(),
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
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    systemInstruction: getSystemPrompt(),
  });

  try {
    // Construire l'historique pour Gemini
    const history = conversationHistory
      .filter(msg => msg.role !== 'system') // Exclure les messages système
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

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
    if (activeProvider === 'ollama') {
      return await generateWithOllama(userMessage, conversationHistory);
    } else if (activeProvider === 'openai') {
      return await generateWithOpenAI(userMessage, conversationHistory);
    } else if (activeProvider === 'gemini') {
      return await generateWithGemini(userMessage, conversationHistory);
    }
  } catch (error) {
    console.error('AI generation failed, falling back to local:', error);
    throw error; // Le composant gérera le fallback
  }

  throw new Error('Unknown AI provider');
}
