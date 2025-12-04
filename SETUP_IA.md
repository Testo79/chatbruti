# 🤖 Configuration de l'IA pour Chat-rlatan

Ce guide vous explique comment configurer l'intégration IA (OpenAI GPT ou Google Gemini) pour que le chatbot réponde de manière intelligente et humoristique.

> 💡 **Recommandation** : Pour une solution **100% gratuite et open source**, utilisez plutôt **[Ollama](SETUP_OLLAMA.md)** ! C'est la meilleure option pour éviter les coûts.

## 🎯 Pourquoi utiliser l'IA ?

Avec l'IA activée, Maître Charlatan peut :
- ✅ Répondre à **n'importe quelle question** de manière contextuelle
- ✅ Intégrer l'humour **naturellement** dans ses réponses
- ✅ Adapter son style selon le mode (Philosophe, Poète, Coach)
- ✅ Être **pertinent** tout en restant drôle

Sans clé API, le chatbot utilise un système local (moins intelligent mais fonctionnel).

---

## 🔑 Option 1 : OpenAI (GPT-4o-mini)

### Étape 1 : Obtenir une clé API

1. Allez sur [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Créez un compte ou connectez-vous
3. Cliquez sur **"Create new secret key"**
4. Copiez la clé (elle commence par `sk-...`)
5. ⚠️ **Important** : La clé ne s'affichera qu'une seule fois, sauvegardez-la !

### Étape 2 : Configurer dans le projet

1. Créez un fichier `.env` à la racine du projet (à côté de `package.json`)
2. Ajoutez cette ligne :

```env
VITE_OPENAI_API_KEY=sk-votre-cle-ici
```

3. Redémarrez le serveur de développement :

```cmd
npm run dev
```

### 💰 Coûts

- **GPT-4o-mini** : ~$0.15 par million de tokens d'entrée, ~$0.60 par million de tokens de sortie
- Pour un chatbot, c'est très économique (quelques centimes par session)
- Vous avez un crédit gratuit de $5 au départ

---

## 🔑 Option 2 : Google Gemini (Gratuit jusqu'à un quota)

### Étape 1 : Obtenir une clé API

1. Allez sur [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Cliquez sur **"Create API Key"**
4. Copiez la clé générée

### Étape 2 : Configurer dans le projet

1. Créez un fichier `.env` à la racine du projet
2. Ajoutez cette ligne :

```env
VITE_GEMINI_API_KEY=votre-cle-gemini-ici
```

3. Redémarrez le serveur de développement :

```cmd
npm run dev
```

### 💰 Coûts

- **Gratuit** jusqu'à 15 requêtes par minute
- Parfait pour le développement et les petits projets
- Modèle utilisé : `gemini-1.5-flash` (rapide et gratuit)

---

## ⚙️ Configuration

### Priorité des providers

Le système utilise automatiquement le premier provider disponible dans cet ordre :
1. **OpenAI** (si `VITE_OPENAI_API_KEY` est défini)
2. **Gemini** (si `VITE_GEMINI_API_KEY` est défini)
3. **Local** (fallback si aucune clé n'est configurée)

### Fichier .env

Créez un fichier `.env` à la racine :

```env
# Choisissez UNE des deux options :

# Option 1: OpenAI
VITE_OPENAI_API_KEY=sk-votre-cle-openai-ici

# Option 2: Gemini
VITE_GEMINI_API_KEY=votre-cle-gemini-ici
```

⚠️ **Important** : 
- Le fichier `.env` est ignoré par Git (sécurité)
- Ne partagez JAMAIS vos clés API publiquement
- Ne commitez pas le fichier `.env` dans Git

---

## 🧪 Tester la configuration

1. **Installez les dépendances** (si pas déjà fait) :

```cmd
npm install
```

2. **Créez votre fichier `.env`** avec votre clé API

3. **Lancez le serveur** :

```cmd
npm run dev
```

4. **Ouvrez le chatbot** et posez une question

5. **Vérifiez le message de bienvenue** :
   - Si vous voyez "(Mode IA GPT activé ✨)" → OpenAI fonctionne ✅
   - Si vous voyez "(Mode IA Gemini activé ✨)" → Gemini fonctionne ✅
   - Si vous voyez "(Mode local)" → Aucune clé configurée ⚠️

---

## 🐛 Dépannage

### "No AI provider configured"

- Vérifiez que votre fichier `.env` existe bien à la racine
- Vérifiez que la variable commence par `VITE_`
- Redémarrez le serveur après avoir créé/modifié `.env`

### "OpenAI API Error" ou "Gemini API Error"

- Vérifiez que votre clé API est correcte
- Vérifiez que vous avez des crédits/quota disponibles
- Vérifiez votre connexion internet

### Le chatbot ne répond pas

- Ouvrez la console du navigateur (F12) pour voir les erreurs
- Vérifiez que les dépendances sont installées : `npm install`
- Vérifiez que le serveur est bien redémarré après avoir ajouté `.env`

---

## 🔒 Sécurité

### ⚠️ IMPORTANT : Clés API côté client

Les clés API sont exposées côté client (dans le navigateur) car c'est une application 100% frontend.

**Risques** :
- N'importe qui peut voir votre clé dans le code source du navigateur
- Quelqu'un pourrait utiliser votre clé et consommer vos crédits

**Solutions pour la production** :
1. **Limitez les quotas** sur votre compte API
2. **Utilisez des clés avec restrictions** (domaines autorisés, quotas)
3. **Créez un backend proxy** (recommandé pour production) qui cache la clé

Pour un projet de démonstration comme la Nuit de l'Info, c'est acceptable, mais soyez vigilant !

---

## 📊 Comparaison des providers

| Critère | OpenAI GPT-4o-mini | Google Gemini |
|---------|-------------------|---------------|
| **Coût** | Payant (~$0.15/1M tokens) | Gratuit (quota limité) |
| **Qualité** | Excellente | Très bonne |
| **Vitesse** | Rapide | Très rapide |
| **Idéal pour** | Production | Développement/Démo |

---

## ✅ Checklist

- [ ] J'ai créé un compte OpenAI OU Google
- [ ] J'ai généré une clé API
- [ ] J'ai créé le fichier `.env` à la racine
- [ ] J'ai ajouté ma clé dans `.env` avec le préfixe `VITE_`
- [ ] J'ai redémarré le serveur (`npm run dev`)
- [ ] Le message de bienvenue indique "Mode IA activé"
- [ ] Je peux poser des questions et obtenir des réponses intelligentes

---

**C'est tout ! Votre chatbot est maintenant super intelligent ! 🧠✨**

