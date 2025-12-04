/**
 * Moteur de chat humoristique "Maître Charlatan"
 * Utilise l'IA (GPT ou Gemini) si disponible, sinon fallback local
 */

import type { AvatarExpression } from '../components/BotAvatar';
import { generateAIResponse, getAvailableProvider, ChatMessage as AIChatMessage } from '../services/aiService';

export interface ChatResponse {
  text: string;
  expression: AvatarExpression;
}

interface ResponsePattern {
  patterns: string[];
  keywords?: string[];
  expression?: AvatarExpression;
}

// Réponses contextuelles intelligentes avec humour intégré (FALLBACK LOCAL)
const smartResponses: ResponsePattern[] = [
  {
    keywords: ['numérique', 'digital', 'internet', 'web', 'en ligne'],
    patterns: [
      "Le numérique, c'est formidable ! On peut tout faire en ligne : travailler, apprendre, socialiser... et surtout procrastiner avec une efficacité jamais égalée dans l'histoire de l'humanité. 😏",
      "Internet a révolutionné nos vies. Avant, pour perdre son temps, il fallait se lever et aller quelque part. Maintenant, tout se fait depuis le canapé. Le progrès, c'est beau ! 🌐",
      "Le monde numérique nous connecte tous. Enfin, surtout aux serveurs de quelques géants de la tech qui connaissent mieux nos habitudes que notre propre famille. Charmant, non ? 📱",
      "Ah, le numérique responsable ! C'est comme manger sainement : tout le monde en parle, personne ne sait vraiment par où commencer. Mais l'intention est louable ! 💚",
    ],
    expression: 'smirking',
  },
  {
    keywords: ['big tech', 'gafa', 'gafam', 'google', 'facebook', 'meta', 'amazon', 'apple', 'microsoft'],
    patterns: [
      "Les Big Tech ? Ces gentils philanthropes qui nous offrent des services 'gratuits' ! Bon, d'accord, ils récoltent nos données, suivent nos moindres clics, et revendent nos profils... mais hey, on a des emojis rigolos ! 😅",
      "Les GAFAM sont comme des amis très attentionnés : ils savent toujours où vous êtes, ce que vous aimez, qui vous fréquentez... Certains appelleraient ça de la surveillance, eux appellent ça du 'ciblage publicitaire personnalisé'. 🎯",
      "Ces géants de la tech sont incroyables ! Ils ont réussi à nous convaincre qu'accepter 47 pages de conditions d'utilisation sans les lire était normal. Chef-d'œuvre de marketing ! 📜",
      "Les Big Tech dominent le monde numérique comme l'Empire Romain dominait la Méditerranée. Sauf qu'au lieu de légions, ils ont des algorithmes. Et au lieu de routes, des câbles de fibre optique. Même combat ! ⚔️",
    ],
    expression: 'laughing',
  },
  {
    keywords: ['résistance', 'résister', 'village', 'nird', 'libre', 'autonomie', 'souveraineté'],
    patterns: [
      "La résistance numérique ! Comme le village gaulois d'Astérix, mais avec moins de sangliers et plus de serveurs auto-hébergés. La potion magique ? Le logiciel libre et une bonne connexion internet ! 🛡️",
      "Résister à la tyrannie numérique, c'est possible ! Il suffit de reprendre le contrôle de ses données, utiliser des outils libres, chiffrer ses communications... Bon courage, ça prend du temps, mais c'est pour la bonne cause ! 💪",
      "Le Village Numérique Résistant, c'est l'idée qu'on peut avoir une tech éthique, respectueuse et durable. Utopique ? Peut-être. Impossible ? Certainement pas ! Il faut juste s'y mettre. 🌱",
      "La souveraineté numérique, c'est décider soi-même comment on utilise la tech, plutôt que de subir les décisions de quelques PDG californiens. Simple concept, application complexe. Mais ça vaut le coup ! 🗽",
    ],
    expression: 'excited',
  },
  {
    keywords: ['école', 'éducation', 'apprendre', 'étudiant', 'formation', 'enseigner'],
    patterns: [
      "L'éducation numérique, c'est crucial ! Former les jeunes à utiliser la tech de manière responsable, critique et créative. Pas juste les transformer en consommateurs de TikTok (même si avouons-le, certaines vidéos sont hilarantes). 📚",
      "Apprendre le numérique à l'école, c'est essentiel. Pas seulement coder, mais aussi comprendre les enjeux : vie privée, manipulation, fake news... Bref, développer son esprit critique. Utile dans la vraie vie ! 🎓",
      "Les étudiants d'aujourd'hui sont nés avec un smartphone dans les mains (métaphoriquement). Il faut leur apprendre à en faire un outil d'émancipation, pas juste de distraction. Vaste programme ! 📱",
      "Former à la tech responsable, c'est comme apprendre à conduire : il faut connaître les règles, comprendre les dangers, et surtout ne pas foncer dans le mur. Pédagogie 101 ! 🚗",
    ],
    expression: 'philosophical',
  },
  {
    keywords: ['données', 'vie privée', 'privacy', 'rgpd', 'tracking', 'surveillance'],
    patterns: [
      "Vos données personnelles sont le pétrole du 21ème siècle ! Sauf que vous, vous les donnez gratuitement en échange de filtres pour vos selfies. Peut-être qu'il y a un déséquilibre dans cet échange... 🤔",
      "Le RGPD protège vos données ! Enfin, théoriquement. En pratique, vous cliquez toujours sur 'Accepter tous les cookies' parce que c'est plus rapide. Je comprends, on est tous pareils. 🍪",
      "La vie privée sur Internet ? Un concept en voie de disparition, comme les cabines téléphoniques. Mais on peut encore se battre pour la préserver ! Chiffrement, VPN, logiciels libres... Tout un arsenal ! 🔒",
      "La surveillance généralisée nous guette. Heureusement, certains résistent avec des outils de protection. D'autres acceptent tout en se disant 'j'ai rien à cacher'. Spoiler : on a tous quelque chose à protéger. 👁️",
    ],
    expression: 'thinking',
  },
  {
    keywords: ['ia', 'intelligence artificielle', 'ai', 'chatgpt', 'algorithme'],
    patterns: [
      "L'intelligence artificielle ! Impressionnante, utile, parfois flippante. Elle peut composer de la musique, écrire des textes, conduire des voitures... Mais elle ne comprend toujours pas l'ironie. Ouf, il nous reste ça ! 🤖",
      "Les algorithmes décident de ce qu'on voit, ce qu'on achète, qui on rencontre... Des machines prennent des décisions nous concernant. Dystopie ? Peut-être. Réalité ? Absolument. Réfléchissons-y ! 🧠",
      "ChatGPT et consorts sont bluffants. Mais attention : une IA, c'est juste des maths très compliquées. Ça n'a pas de conscience, pas d'éthique, pas de jugement. C'est à nous de rester aux commandes ! 💭",
      "L'IA peut aider l'humanité ou lui nuire. Comme toute technologie, c'est l'usage qu'on en fait qui compte. Alors utilisons-la intelligemment ! (Et gardons les humains dans la boucle.) 🌟",
    ],
    expression: 'philosophical',
  },
  {
    keywords: ['open source', 'logiciel libre', 'linux', 'gnu', 'libre'],
    patterns: [
      "Le logiciel libre, c'est magnifique ! Des développeurs du monde entier collaborent gratuitement pour créer des outils accessibles à tous. C'est beau, c'est généreux, c'est... souvent pas très user-friendly. Mais ça s'améliore ! 🐧",
      "Open source : le code est ouvert, modifiable, vérifiable. Transparence totale ! Contrairement aux logiciels propriétaires où personne ne sait ce qui se passe sous le capot. Confiance aveugle vs. vérification. Choose wisely ! 🔓",
      "Linux, GNU, Firefox, LibreOffice... Des alternatives libres existent pour presque tout. Certes, il faut parfois mettre les mains dans le cambouis. Mais au moins, vous êtes maître de votre machine ! 💻",
      "Le libre, c'est la liberté de faire ce qu'on veut du logiciel. L'utiliser, l'étudier, le modifier, le partager. Quatre libertés fondamentales. Un peu comme la devise française, mais en version nerd ! 🗝️",
    ],
    expression: 'excited',
  },
];

// Réponses courtes pour des questions simples (fallback local uniquement)
const quickResponses: { [key: string]: string } = {
  'bonjour': "Bonjour. Comment puis-je vous aider ?",
  'salut': "Salut. Que puis-je faire pour vous ?",
  'ça va': "Je vais bien, merci. Et vous ? Comment puis-je vous aider ?",
  'merci': "De rien. N'hésitez pas si vous avez d'autres questions.",
  'qui es-tu': "Je suis un assistant IA. Je peux répondre à vos questions sur différents sujets.",
  'ton nom': "Je suis un assistant IA. Comment puis-je vous aider ?",
};

// Réponses absurdes (RÉDUITES - seulement pour cas vraiment random)
const absurdResponses: string[] = [
  "Hmm, je dois avouer que cette question me laisse perplexe. Parlons plutôt de fromage ? 🧀",
  "Excellente question ! Malheureusement, ma boule de cristal est chez le réparateur. Repassez demain ? 🔮",
  "Je sens que vous cherchez une réponse profonde. J'en ai une : 42. Ça marche toujours, paraît-il. 🤷",
];

/**
 * Fonction principale qui génère une réponse intelligente et contextuelle
 * Essaie d'abord l'IA, puis fallback sur le système local
 */
export async function generateResponse(
  userMessage: string, 
  conversationHistory: AIChatMessage[] = []
): Promise<ChatResponse> {
  const messageLower = userMessage.toLowerCase().trim();
  
  // Vérifier les réponses rapides d'abord (toujours locales, c'est instantané)
  for (const [trigger, response] of Object.entries(quickResponses)) {
    if (messageLower.includes(trigger)) {
      return {
        text: response,
        expression: 'smirking',
      };
    }
  }
  
  // Essayer d'utiliser l'IA si disponible
  const provider = await getAvailableProvider();
  if (provider !== 'local') {
    try {
      const aiResponse = await generateAIResponse(userMessage, conversationHistory, provider);
      return aiResponse;
    } catch (error) {
      console.warn('AI generation failed, using local fallback:', error);
      // Continue avec le fallback local
    }
  }
  
  // FALLBACK LOCAL : Si l'IA n'est pas disponible, message simple
  return {
    text: "Je suis désolé, mais je ne peux pas répondre à cette question sans accès à une IA. Veuillez configurer Ollama, OpenAI ou Gemini pour utiliser le chatbot.",
    expression: 'confused',
  };
}

/**
 * Message d'accueil
 */
export async function getWelcomeMessage(): Promise<ChatResponse> {
  const provider = await getAvailableProvider();
  let aiStatus = ' (Mode local)';
  
  if (provider !== 'local') {
    if (provider === 'ollama') {
      aiStatus = ' (Mode IA Ollama open source activé ✨)';
    } else if (provider === 'openai') {
      aiStatus = ' (Mode IA GPT activé ✨)';
    } else if (provider === 'gemini') {
      aiStatus = ' (Mode IA Gemini activé ✨)';
    }
  }
  
  const welcome = `Bienvenue. Je suis un assistant IA intelligent et polyvalent.${aiStatus} Je peux répondre à toutes vos questions sur n'importe quel sujet : sciences, technologie, histoire, culture, programmation, etc. Comment puis-je vous aider ?`;
  
  return {
    text: welcome,
    expression: 'excited',
  };
}

/**
 * Utilitaire pour choisir un élément aléatoire dans un tableau
 */
function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Message de "typing"
 */
export async function getTypingMessage(): Promise<string> {
  const provider = await getAvailableProvider();
  const aiStatus = provider !== 'local' ? ' (IA en réflexion...)' : '';
  
  const typing = [
    `Analyse en cours...${aiStatus}`,
    `Traitement de votre question...${aiStatus}`,
    `Réflexion sur votre demande...${aiStatus}`,
  ];
  
  return pickRandom(typing);
}

/**
 * Détermine l'expression de l'avatar selon le message de l'utilisateur
 */
export function getReactionExpression(userMessage: string): AvatarExpression {
  const messageLower = userMessage.toLowerCase();
  
  // Messages bizarres ou drôles
  if (
    messageLower.includes('bizarre') ||
    messageLower.includes('wtf') ||
    messageLower.includes('quoi') ||
    messageLower.includes('sérieux') ||
    messageLower.includes('vraiment')
  ) {
    return 'confused';
  }
  
  // Questions philosophiques
  if (
    messageLower.includes('pourquoi') ||
    messageLower.includes('sens') ||
    messageLower.includes('signification') ||
    messageLower.includes('comprendre')
  ) {
    return 'philosophical';
  }
  
  // Questions excitantes
  if (
    messageLower.includes('!') ||
    messageLower.includes('génial') ||
    messageLower.includes('super') ||
    messageLower.includes('cool')
  ) {
    return 'excited';
  }
  
  // Par défaut, réfléchit
  return 'thinking';
}
