# 🧙‍♂️ Chat-rlatan - Village Numérique Résistant

> **Nuit de l'Info 2025** - Défi Viveris  
> _Débattre sérieusement avec quelqu'un de totalement à côté de la plaque_

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff.svg)

---

## 📖 Description

**Chat-rlatan** est un chatbot humoristique et volontairement inutile créé pour la Nuit de l'Info 2025. 

Dans le cadre du défi "Village Numérique Résistant" (NIRD), ce projet illustre avec humour et dérision les enjeux de la souveraineté numérique, du logiciel libre et de la résistance face aux Big Tech.

**Maître Charlatan**, notre expert autoproclamé en tout (et surtout en rien), est un philosophe du dimanche qui :
- ✨ Détourne vos questions avec maestria
- 🎭 Submerge vos interrogations de pseudo-sagesse de comptoir
- 🤹 Répond généralement à côté de la plaque
- 💫 Possède 3 modes d'humeur : Philosophe, Poète raté, et Coach low-cost

**⚠️ Attention** : Ce chatbot ne sert à rien de concret, mais incarne "l'esprit de résistance numérique totalement décalée".

---

## 🎯 Objectifs du projet

- Créer une application Web **100% statique** (pas de backend nécessaire)
- Intégrer un chatbot humoristique avec logique côté client uniquement
- Sensibiliser au Village Numérique Résistant avec humour et créativité
- Déployer facilement sur AWS (ou autre plateforme statique)
- Code simple, clair et maintenable

---

## 🛠️ Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| **React** | 18.2 | Framework UI |
| **TypeScript** | 5.3 | Typage statique |
| **Vite** | 5.0 | Build tool & dev server |
| **Tailwind CSS** | 3.4 | Styling & design system |
| **OpenAI API** | 4.20 | Intégration GPT (optionnel) |
| **Google Gemini** | 0.2 | Intégration Gemini (optionnel) |

### 🤖 Intégration IA (Optionnelle)

Le chatbot peut utiliser plusieurs options d'IA pour générer des réponses intelligentes et humoristiques :

1. **🦙 Ollama (Recommandé - 100% Gratuit & Open Source)**
   - Fonctionne localement sur votre machine
   - Aucun coût, aucune limite
   - Privacy totale (données restent locales)
   - 📖 **Voir [SETUP_OLLAMA.md](SETUP_OLLAMA.md) pour l'installation**

2. **OpenAI GPT** (Payant - pay-as-you-go)
   - Qualité excellente mais coûte de l'argent
   - 📖 **Voir [SETUP_IA.md](SETUP_IA.md) pour la configuration**

3. **Google Gemini** (Gratuit avec quota)
   - Bonne alternative gratuite
   - 📖 **Voir [SETUP_IA.md](SETUP_IA.md) pour la configuration**

4. **Système local** (Fallback)
   - Fonctionne sans IA mais moins intelligent

💡 **Recommandation** : Utilisez Ollama pour une IA gratuite et open source !

---

## 📁 Structure du projet

```
chat-rlatan-nuit-info-2025/
├── public/                  # Assets statiques
├── src/
│   ├── components/
│   │   ├── ChatCharlatan.tsx    # Composant principal du chatbot
│   │   ├── ChatMessage.tsx      # Affichage des messages
│   │   ├── Header.tsx           # En-tête de l'application
│   │   ├── Footer.tsx           # Pied de page
│   │   └── Layout.tsx           # Layout principal
│   ├── utils/
│   │   └── chatEngine.ts        # Moteur de génération de réponses
│   ├── App.tsx                  # Composant racine
│   ├── main.tsx                 # Point d'entrée
│   └── index.css                # Styles globaux
├── index.html                   # Template HTML
├── package.json                 # Dépendances
├── vite.config.ts              # Configuration Vite
├── tsconfig.json               # Configuration TypeScript
├── tailwind.config.cjs         # Configuration Tailwind
├── postcss.config.cjs          # Configuration PostCSS
├── LICENSE                     # Licence MIT
└── README.md                   # Ce fichier
```

---

## 🚀 Installation et lancement en local

### Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x (ou yarn/pnpm)

### Étapes

1. **Cloner le repository** (ou télécharger le code)

```bash
git clone https://github.com/nom-equipe/nuit-info-2025-chat-rlatan.git
cd nuit-info-2025-chat-rlatan
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Lancer le serveur de développement**

```bash
npm run dev
```

4. **Ouvrir dans le navigateur**

Le projet sera accessible sur `http://localhost:5173`

---

## 📦 Build pour production

Pour générer les fichiers statiques prêts à être déployés :

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`. Ce dossier contient tout ce qui est nécessaire pour l'hébergement statique.

Pour prévisualiser le build en local :

```bash
npm run preview
```

---

## ☁️ Déploiement sur AWS (S3 + CloudFront)

### Méthode 1 : Déploiement simple sur S3

#### Étape 1 : Créer un bucket S3

1. Connectez-vous à la **Console AWS**
2. Allez dans **S3** → **Create bucket**
3. Nommez votre bucket (ex: `chat-rlatan-nuit-info-2025`)
4. Région : choisissez la région la plus proche (ex: `eu-west-3` pour Paris)
5. **Décochez** "Block all public access" (pour un site public)
6. Confirmez et créez le bucket

#### Étape 2 : Configurer le bucket en Static Website Hosting

1. Sélectionnez votre bucket
2. Allez dans l'onglet **Properties**
3. Scrollez jusqu'à **Static website hosting** → **Edit**
4. Activez "Enable"
5. Index document : `index.html`
6. Error document : `index.html` (pour le routing client-side)
7. Sauvegardez

#### Étape 3 : Configurer les permissions

Dans l'onglet **Permissions** → **Bucket Policy**, ajoutez cette policy :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::chat-rlatan-nuit-info-2025/*"
    }
  ]
}
```

**Remplacez** `chat-rlatan-nuit-info-2025` par le nom de votre bucket.

#### Étape 4 : Uploader les fichiers

1. Buildez votre projet localement :
   ```bash
   npm run build
   ```

2. Allez dans l'onglet **Objects** de votre bucket

3. Cliquez sur **Upload**

4. Glissez-déposez **tout le contenu** du dossier `dist/` (pas le dossier lui-même)

5. Cliquez sur **Upload**

#### Étape 5 : Accéder à votre site

1. Retournez dans **Properties** → **Static website hosting**
2. Vous verrez une URL du type :  
   `http://chat-rlatan-nuit-info-2025.s3-website.eu-west-3.amazonaws.com`

Votre site est maintenant en ligne ! 🎉

---

### Méthode 2 : Déploiement avec CloudFront (recommandé pour la production)

CloudFront est un CDN qui améliore les performances et permet d'utiliser HTTPS.

#### Étape 1 : Créer une distribution CloudFront

1. Allez dans **CloudFront** → **Create distribution**
2. **Origin domain** : sélectionnez votre bucket S3
3. **Origin access** : choisissez "Origin access control settings (recommended)"
4. Créez un nouveau OAC si nécessaire
5. **Viewer protocol policy** : "Redirect HTTP to HTTPS"
6. **Default root object** : `index.html`
7. Créez la distribution

#### Étape 2 : Mettre à jour la bucket policy

CloudFront vous proposera une policy à ajouter à votre bucket S3 pour autoriser l'accès. Copiez-la et ajoutez-la dans **S3** → **Permissions** → **Bucket Policy**.

#### Étape 3 : Configurer les erreurs personnalisées

Dans votre distribution CloudFront :

1. Allez dans l'onglet **Error pages**
2. Créez une erreur personnalisée :
   - HTTP error code : `403` et `404`
   - Response page path : `/index.html`
   - HTTP response code : `200`

Cela permet au routing client-side de fonctionner correctement.

#### Étape 4 : Accéder à votre site

Après quelques minutes de déploiement, votre site sera accessible via l'URL CloudFront :

```
https://d1234567890abc.cloudfront.net
```

Vous pouvez configurer un nom de domaine personnalisé si vous le souhaitez.

---

### Mise à jour du site déployé

Quand vous faites des modifications :

1. Rebuildez localement : `npm run build`
2. Uploadez le nouveau contenu de `dist/` dans votre bucket S3
3. Si vous utilisez CloudFront, invalidez le cache :
   - Allez dans votre distribution → **Invalidations** → **Create invalidation**
   - Path : `/*`
   - Cela force CloudFront à récupérer les nouveaux fichiers

---

## 🌐 Autres plateformes de déploiement

Le projet étant 100% statique, il peut être déployé sur d'autres plateformes facilement :

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Vercel

```bash
npm run build
vercel --prod
```

### GitHub Pages

Configurez le dossier `dist/` comme source dans les paramètres du repository.

---

## 🎨 Fonctionnalités

### Chatbot "Maître Charlatan"

- **3 modes d'humeur** :
  - 🧠 **Philosophe du dimanche** : Sagesse de comptoir et citations inventées
  - ✨ **Poète raté** : Métaphores bancales et vers approximatifs
  - 💪 **Coach de vie low-cost** : Motivation douteuse et énergie cosmique

- **Génération de réponses** :
  - **Avec IA** (GPT/Gemini) : Réponses intelligentes et contextuelles avec humour intégré
  - **Sans IA** : Détection de mots-clés (numérique, Big Tech, NIRD, etc.) avec réponses pré-écrites
  - L'humour est toujours présent, mais plus naturel et contextuel avec l'IA

- **Interface conviviale** :
  - Bulles de messages différenciées (utilisateur/bot)
  - Avatars stylisés
  - Effet "typing" pendant la génération
  - Envoi par touche Entrée
  - Design responsive (mobile-friendly)

### Contenu éducatif

- Présentation du Village Numérique Résistant
- Sensibilisation à la souveraineté numérique
- Approche ludique et décalée

---

## 🧪 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement (port 5173) |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualise le build localement |

---

## 🧑‍💻 Développement

### Personnalisation du chatbot

Le fichier `src/utils/chatEngine.ts` contient toute la logique de génération des réponses :

- **Ajouter des réponses** : modifiez les tableaux `absurdResponses`, `nirdResponses`, etc.
- **Ajouter des mots-clés** : ajoutez des patterns dans `nirdResponses`
- **Modifier les modes** : éditez `moodIntros` et `getTypingMessage`

### Personnalisation des styles

Le projet utilise **Tailwind CSS** avec des couleurs personnalisées :

```js
// tailwind.config.cjs
colors: {
  'nird-dark': '#1a1a2e',
  'nird-purple': '#6a4c93',
  'nird-blue': '#0f4c75',
  'nird-light': '#16213e',
}
```

Modifiez ces couleurs selon vos préférences.

---

## 🚀 Déploiement sur AWS

Le projet peut être déployé sur AWS S3 + CloudFront pour un hébergement statique économique.

### Déploiement rapide

1. **Installer AWS CLI** (si pas déjà fait) :
   ```bash
   # Windows
   winget install Amazon.AWSCLI
   
   # Configurer
   aws configure
   ```

2. **Créer le bucket S3** :
   ```bash
   aws s3 mb s3://chat-rlatan --region eu-west-1
   aws s3 website s3://chat-rlatan --index-document index.html --error-document index.html
   ```

3. **Appliquer la politique publique** :
   ```bash
   aws s3api put-bucket-policy --bucket chat-rlatan --policy file://bucket-policy.json
   ```

4. **Déployer** :
   ```bash
   # Option 1: Script PowerShell (Windows)
   .\deploy.ps1 chat-rlatan
   
   # Option 2: Script Bash (Linux/Mac)
   ./deploy.sh chat-rlatan
   
   # Option 3: Manuel
   npm run build
   aws s3 sync dist/ s3://chat-rlatan --delete
   ```

📖 **Guide complet** : Voir [DEPLOY_AWS.md](DEPLOY_AWS.md) pour les instructions détaillées, y compris la configuration CloudFront.

---

## 📜 Licence

Ce projet est sous licence **MIT**.

Vous êtes libre de :
- ✅ Utiliser ce code pour un usage personnel ou commercial
- ✅ Modifier et distribuer
- ✅ Contribuer et améliorer

Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Crédits

Projet réalisé dans le cadre de la **Nuit de l'Info 2025** pour le défi **Viveris - Village Numérique Résistant**.

**Équipe** : [Nom de votre équipe]  
**École** : [Nom de votre école]  
**Année** : 2025

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

- Ouvrir des issues pour signaler des bugs
- Proposer des améliorations
- Ajouter de nouvelles réponses humoristiques au chatbot
- Améliorer le design

---

## 📞 Contact

Pour toute question ou suggestion :

- 📧 Email : [votre-email@example.com]
- 🐙 GitHub : [https://github.com/nom-equipe/nuit-info-2025-chat-rlatan](https://github.com/nom-equipe/nuit-info-2025-chat-rlatan)

---

## 🎉 Remerciements

Merci à :
- L'organisation de la **Nuit de l'Info**
- **Viveris** pour le défi inspirant
- Tous les participants et bénévoles

---

**Fait avec ❤️, ☕ et beaucoup d'humour pour la Nuit de l'Info 2025**

🧙‍♂️ _"La vraie sagesse, c'est de savoir qu'on ne sait rien. Mais moi, je ne sais même pas ça."_ — Maître Charlatan


