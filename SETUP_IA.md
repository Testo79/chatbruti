# 🤖 Configuration de l'IA pour Chat-rlatan

Ce guide vous explique comment configurer l'intégration IA pour que le chatbot réponde de manière intelligente et humoristique.

## 🎯 Pourquoi utiliser l'IA ?

Avec l'IA activée, Maître Charlatan peut :
- ✅ Répondre à **n'importe quelle question** de manière contextuelle
- ✅ Intégrer l'humour **naturellement** dans ses réponses
- ✅ Adapter son style selon le mode (Philosophe, Poète, Coach)
- ✅ Être **pertinent** tout en restant drôle

Sans clé API, le chatbot utilise un système local (moins intelligent mais fonctionnel).

---

## ⚡ Option 1 : Groq (RECOMMANDÉ - 100% GRATUIT)

### Pourquoi Groq ?

- ✅ **100% GRATUIT** (pas de limite de crédits, juste rate limit raisonnable)
- ✅ **TRÈS RAPIDE** (2-3 secondes, infrastructure optimisée)
- ✅ **Supporte CORS** (pas de problème de blocage)
- ✅ **Modèles efficaces** (Llama, Mixtral)

### Étape 1 : Obtenir une clé API

1. Aller sur [https://console.groq.com](https://console.groq.com)
2. Créer un compte (gratuit, **pas besoin de carte de crédit**)
3. Aller dans **API Keys**
4. Cliquer sur **Create API Key**
5. **Copier la clé** (commence par `gsk_...`)

### Étape 2 : Configurer

1. Créer un fichier `.env.production` à la racine du projet :
```env
VITE_GROQ_API_KEY=gsk_votre_cle_ici
VITE_GROQ_MODEL=llama-3.1-8b-instant
```

2. Build et déployer :
```bash
npm run build
```

### Modèles disponibles

- `llama-3.1-8b-instant` - **RECOMMANDÉ** (rapide et efficace)
- `llama-3.1-70b-versatile` - Plus puissant
- `mixtral-8x7b-32768` - Très puissant

### Performance

- **Temps de réponse** : 2-3 secondes
- **Gratuit** : 100% gratuit
- **Rate limit** : 30 requêtes/minute

---

## 🔑 Option 2 : OpenAI (GPT-4o-mini)

### Étape 1 : Obtenir une clé API

1. Allez sur [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Créez un compte ou connectez-vous
3. Cliquez sur **"Create new secret key"**
4. Copiez la clé (elle commence par `sk-...`)

### Étape 2 : Configurer

Créez un fichier `.env.production` :
```env
VITE_OPENAI_API_KEY=sk-votre-cle-ici
```

### 💰 Coûts

- **GPT-4o-mini** : ~$0.15 par million de tokens d'entrée
- Vous avez un crédit gratuit de $5 au départ

---

## 🔑 Option 3 : Google Gemini (Gratuit jusqu'à un quota)

### Étape 1 : Obtenir une clé API

1. Allez sur [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Cliquez sur **"Create API Key"**
4. Copiez la clé générée

### Étape 2 : Configurer

Créez un fichier `.env.production` :
```env
VITE_GEMINI_API_KEY=votre-cle-gemini-ici
```

### 💰 Coûts

- **Gratuit** jusqu'à 15 requêtes par minute
- Modèle utilisé : `gemini-1.5-flash` (rapide et gratuit)

---

## ⚙️ Priorité des providers

Le système utilise automatiquement le premier provider disponible dans cet ordre :

1. **Groq** (si `VITE_GROQ_API_KEY` est défini) ⭐ - 100% gratuit
2. **Ollama** (si disponible localement ou via `VITE_OLLAMA_BASE_URL`)
3. **OpenAI** (si `VITE_OPENAI_API_KEY` est défini)
4. **Gemini** (si `VITE_GEMINI_API_KEY` est défini)
5. **Local** (fallback si aucune clé n'est configurée)

---

## 🧪 Tester la configuration

1. **Créez votre fichier `.env.production`** avec votre clé API
2. **Build l'application** : `npm run build`
3. **Ouvrez le chatbot** et posez une question
4. **Vérifiez la console** : vous devriez voir le provider utilisé

---

## 🔒 Sécurité

⚠️ **IMPORTANT** : Les clés API sont exposées côté client (dans le navigateur).

**Pour la production** :
- Limitez les quotas sur votre compte API
- Utilisez des clés avec restrictions
- Créez un backend proxy (recommandé pour production)

---

## 📊 Comparaison des providers

| Critère | Groq | OpenAI | Gemini | Ollama |
|---------|------|--------|--------|--------|
| **Coût** | 100% gratuit | Payant | Gratuit (quota) | Gratuit |
| **Vitesse** | ⚡⚡⚡⚡ | ⚡⚡⚡ | ⚡⚡⚡ | ⚡⚡ |
| **CORS** | ✅ Oui | ✅ Oui | ✅ Oui | ⚠️ Nécessite proxy |
| **Idéal pour** | Production | Production | Démo | Local |

---

**C'est tout ! Votre chatbot est maintenant super intelligent ! 🧠✨**
