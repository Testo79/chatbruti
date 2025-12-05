# ⚡ Configuration HTTPS Rapide

## 🚀 Étapes rapides (15 minutes)

### 1. Créer la distribution CloudFront

1. **AWS Console > CloudFront > Create distribution**
2. **Origin** : Sélectionner votre bucket S3 (`chatbruti.s3.amazonaws.com`)
3. **Origin access** : Create control setting → Sign requests
4. **Viewer protocol policy** : **"Redirect HTTP to HTTPS"** ⭐
5. **SSL certificate** : Default CloudFront certificate (gratuit)
6. **Default root object** : `index.html`
7. **Create distribution**

### 2. Mettre à jour la bucket policy

CloudFront vous donnera une policy. Copiez-la dans :
- **S3 > chatbruti > Permissions > Bucket policy**

### 3. Configurer les erreurs

**CloudFront > Error pages > Create custom error response** :
- **403** → `/index.html` → `200`
- **404** → `/index.html` → `200`

### 4. Attendre (15-20 minutes)

Le statut passera de "In Progress" à "Deployed".

### 5. Accéder en HTTPS

Votre URL HTTPS sera :
```
https://d1234567890abc.cloudfront.net
```

## 🔄 Script de déploiement avec invalidation

Créer un fichier `deploy-https.sh` :

```bash
#!/bin/bash
DISTRIBUTION_ID="VOTRE_DISTRIBUTION_ID"

# Build
npm run build

# Deploy
aws s3 sync dist/ s3://chatbruti --delete

# Invalider le cache
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

## ✅ C'est tout !

Votre site sera accessible en HTTPS ! 🔒

