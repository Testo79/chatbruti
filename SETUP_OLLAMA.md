# 🦙 Configuration Ollama - IA Open Source Gratuite

Ollama est une solution **100% gratuite et open source** pour exécuter des modèles d'IA localement sur votre machine. C'est la meilleure option pour éviter les coûts des APIs payantes !

## 🎯 Pourquoi Ollama ?

✅ **100% Gratuit** - Aucun coût, aucune limite  
✅ **Open Source** - Transparence totale  
✅ **Local** - Vos données restent sur votre machine (privacy)  
✅ **Performant** - Fonctionne même sans internet  
✅ **Plusieurs modèles** - Llama, Mistral, Phi, etc.

---

## 📥 Installation d'Ollama

### Windows

1. Téléchargez Ollama depuis : https://ollama.com/download
2. Installez le fichier `.exe` téléchargé
3. Ollama démarrera automatiquement en arrière-plan

### macOS

```bash
brew install ollama
```

Ou téléchargez depuis : https://ollama.com/download

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

---

## 🚀 Première utilisation

### 1. Télécharger un modèle

Ollama a besoin d'un modèle pour fonctionner. Voici les meilleurs modèles recommandés :

**Option 1 : Llama 3.2 (Recommandé - ~2GB)**
```bash
ollama pull llama3.2
```

**Option 2 : Mistral (Plus petit - ~4GB)**
```bash
ollama pull mistral
```

**Option 3 : Phi-3 (Très léger - ~2GB)**
```bash
ollama pull phi3
```

**Option 4 : Llama 3.1 (Plus performant - ~4.7GB)**
```bash
ollama pull llama3.1
```

💡 **Conseil** : Commencez par `llama3.2` - c'est un bon équilibre entre qualité et taille.

### 2. Vérifier que Ollama fonctionne

```bash
ollama list
```

Vous devriez voir votre modèle dans la liste.

### 3. Tester Ollama

```bash
ollama run llama3.2 "Bonjour, comment ça va ?"
```

Si ça fonctionne, Ollama est prêt ! 🎉

---

## ⚙️ Configuration dans le projet

### Option 1 : Configuration par défaut (Recommandé)

Si Ollama tourne sur `http://localhost:11434` (par défaut), **aucune configuration n'est nécessaire** ! Le chatbot détectera automatiquement Ollama.

### Option 2 : Configuration personnalisée

Si Ollama tourne sur un autre port ou une autre machine, créez un fichier `.env` :

```env
# URL de votre instance Ollama
VITE_OLLAMA_BASE_URL=http://localhost:11434

# Modèle à utiliser (par défaut: llama3.2)
VITE_OLLAMA_MODEL=llama3.2
```

---

## 🧪 Tester l'intégration

1. **Assurez-vous qu'Ollama tourne** :
   ```bash
   ollama serve
   ```
   (Normalement, Ollama démarre automatiquement)

2. **Lancez le chatbot** :
   ```bash
   npm run dev
   ```

3. **Vérifiez le message de bienvenue** :
   - Si vous voyez "(Mode IA Ollama open source activé ✨)" → Ça fonctionne ! ✅
   - Si vous voyez "(Mode local)" → Ollama n'est pas détecté ⚠️

4. **Posez une question** et vérifiez que la réponse vient bien d'Ollama !

---

## 🔧 Dépannage

### Ollama n'est pas détecté

1. **Vérifiez qu'Ollama tourne** :
   ```bash
   ollama list
   ```
   Si ça ne fonctionne pas, lancez :
   ```bash
   ollama serve
   ```

2. **Vérifiez l'URL** :
   - Par défaut : `http://localhost:11434`
   - Testez dans votre navigateur : http://localhost:11434/api/tags
   - Vous devriez voir une liste de modèles en JSON

3. **Vérifiez les CORS** :
   - Ollama devrait accepter les requêtes depuis le navigateur
   - Si vous avez des erreurs CORS, vérifiez la configuration d'Ollama

### Le modèle n'existe pas

Si vous obtenez une erreur "model not found" :

1. **Listez les modèles disponibles** :
   ```bash
   ollama list
   ```

2. **Téléchargez le modèle manquant** :
   ```bash
   ollama pull llama3.2
   ```

3. **Mettez à jour le `.env`** si vous utilisez un autre modèle :
   ```env
   VITE_OLLAMA_MODEL=votre-modele
   ```

### Performance lente

- Utilisez un modèle plus petit (phi3, llama3.2 au lieu de llama3.1)
- Assurez-vous d'avoir assez de RAM (minimum 8GB recommandé)
- Fermez les autres applications gourmandes

---

## 📊 Comparaison des modèles

| Modèle | Taille | Qualité | Vitesse | RAM requise |
|--------|--------|---------|---------|-------------|
| **llama3.2** | ~2GB | ⭐⭐⭐⭐ | ⚡⚡⚡ | 4GB+ |
| **mistral** | ~4GB | ⭐⭐⭐⭐⭐ | ⚡⚡ | 8GB+ |
| **phi3** | ~2GB | ⭐⭐⭐ | ⚡⚡⚡⚡ | 4GB+ |
| **llama3.1** | ~4.7GB | ⭐⭐⭐⭐⭐ | ⚡⚡ | 8GB+ |

💡 **Recommandation** : Commencez par `llama3.2` pour un bon équilibre.

---

## 🎯 Avantages vs APIs payantes

| Critère | Ollama | OpenAI | Gemini |
|---------|--------|--------|--------|
| **Coût** | ✅ Gratuit | ❌ Payant | ⚠️ Gratuit (quota) |
| **Privacy** | ✅ 100% local | ❌ Données envoyées | ❌ Données envoyées |
| **Internet** | ✅ Pas besoin | ❌ Requis | ❌ Requis |
| **Limite** | ✅ Aucune | ❌ Quota/coût | ⚠️ Quota |
| **Open Source** | ✅ Oui | ❌ Non | ❌ Non |

---

## 🚀 Pour aller plus loin

### Utiliser Ollama sur un serveur distant

Si vous voulez utiliser Ollama sur une autre machine :

1. Configurez Ollama pour accepter les connexions distantes
2. Mettez à jour `.env` :
   ```env
   VITE_OLLAMA_BASE_URL=http://votre-serveur:11434
   ```

### Changer de modèle dynamiquement

Vous pouvez changer de modèle en modifiant `VITE_OLLAMA_MODEL` dans `.env` et en redémarrant le serveur.

---

## ✅ Checklist

- [ ] Ollama est installé
- [ ] Un modèle est téléchargé (`ollama pull llama3.2`)
- [ ] Ollama tourne (`ollama list` fonctionne)
- [ ] Le chatbot détecte Ollama (message "(Mode IA Ollama activé)")
- [ ] Les réponses sont générées par Ollama

---

**C'est tout ! Vous avez maintenant une IA 100% gratuite et open source ! 🎉**

Pour plus d'informations sur Ollama : https://ollama.com

