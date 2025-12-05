# 🔒 Configuration HTTPS avec CloudFront

## 🎯 Objectif

Transformer votre site HTTP en HTTPS pour une connexion sécurisée.

## 📋 Prérequis

- Un bucket S3 déjà configuré et déployé
- Un nom de domaine (optionnel mais recommandé)

## 🚀 Méthode 1 : CloudFront avec certificat SSL automatique (RECOMMANDÉ)

### Étape 1 : Créer une distribution CloudFront

1. **Aller dans AWS Console > CloudFront**
2. **Cliquer sur "Create distribution"**
3. **Origin settings** :
   - **Origin domain** : Sélectionner votre bucket S3 (ex: `chatbruti.s3.amazonaws.com`)
   - **Origin access** : Choisir "Origin access control settings (recommended)"
   - **Cliquer sur "Create control setting"** :
     - Name: `s3-chatbruti-oac`
     - Signing behavior: `Sign requests`
     - Origin type: `S3`
     - Cliquer sur "Create"
   - **Origin access control** : Sélectionner celui que vous venez de créer
   - **Origin name** : Laisser par défaut
4. **Default cache behavior** :
   - **Viewer protocol policy** : **"Redirect HTTP to HTTPS"** ⭐ (IMPORTANT)
   - **Allowed HTTP methods** : GET, HEAD, OPTIONS
   - **Cache policy** : CachingOptimized
5. **Settings** :
   - **Price class** : Use all edge locations (ou choisir selon votre région)
   - **Alternate domain names (CNAMEs)** : Laisser vide pour l'instant
   - **SSL certificate** : **"Default CloudFront certificate"** (gratuit)
   - **Default root object** : `index.html`
6. **Cliquer sur "Create distribution"**

### Étape 2 : Mettre à jour la bucket policy

CloudFront vous donnera une policy à ajouter à votre bucket S3 :

1. **Copier la policy** affichée par CloudFront
2. **Aller dans S3 > Votre bucket > Permissions > Bucket policy**
3. **Remplacer** la policy actuelle par celle fournie par CloudFront
4. **Sauvegarder**

### Étape 3 : Configurer les erreurs personnalisées

Pour que le routing client-side fonctionne :

1. **Dans votre distribution CloudFront > Error pages**
2. **Create custom error response** :
   - **HTTP error code** : `403`
   - **Response page path** : `/index.html`
   - **HTTP response code** : `200`
   - **Error caching minimum TTL** : `10`
3. **Créer une autre erreur** :
   - **HTTP error code** : `404`
   - **Response page path** : `/index.html`
   - **HTTP response code** : `200`
   - **Error caching minimum TTL** : `10`

### Étape 4 : Attendre le déploiement

CloudFront prend **15-20 minutes** pour déployer. Vous verrez le statut passer de "In Progress" à "Deployed".

### Étape 5 : Accéder à votre site HTTPS

Une fois déployé, votre site sera accessible via :
```
https://d1234567890abc.cloudfront.net
```

**C'est votre URL HTTPS !** 🔒

---

## 🌐 Méthode 2 : CloudFront avec nom de domaine personnalisé

Si vous avez un nom de domaine (ex: `chatbruti.com`) :

### Étape 1 : Obtenir un certificat SSL

1. **Aller dans AWS Certificate Manager (ACM)**
2. **Request a certificate**
3. **Domain names** :
   - **Fully qualified domain name** : `chatbruti.com`
   - **Subject alternative names** : `*.chatbruti.com` (optionnel, pour les sous-domaines)
4. **Validation method** : DNS validation (recommandé)
5. **Request**
6. **Valider le certificat** :
   - Ajouter les enregistrements DNS fournis par AWS dans votre registrar
   - Attendre la validation (quelques minutes)

### Étape 2 : Configurer CloudFront avec votre domaine

1. **Dans votre distribution CloudFront > General**
2. **Edit**
3. **Alternate domain names (CNAMEs)** :
   - Ajouter : `chatbruti.com` et `www.chatbruti.com`
4. **SSL certificate** :
   - Sélectionner votre certificat depuis ACM
   - ⚠️ **IMPORTANT** : Le certificat doit être dans la région **us-east-1** (N. Virginia) pour CloudFront
5. **Sauvegarder**

### Étape 3 : Configurer DNS

Dans votre registrar (ex: GoDaddy, Namecheap) :

1. **Créer un enregistrement CNAME** :
   - **Name** : `chatbruti.com` (ou `@`)
   - **Value** : `d1234567890abc.cloudfront.net` (votre distribution CloudFront)
   - **TTL** : 3600

2. **Pour www** (optionnel) :
   - **Name** : `www`
   - **Value** : `d1234567890abc.cloudfront.net`
   - **TTL** : 3600

### Étape 4 : Attendre la propagation DNS

La propagation DNS prend **15 minutes à 48 heures**. Votre site sera alors accessible sur :
```
https://chatbruti.com
```

---

## 🔄 Mise à jour du site

Quand vous faites des modifications :

1. **Build** : `npm run build`
2. **Déployer sur S3** : `aws s3 sync dist/ s3://chatbruti --delete`
3. **Invalider le cache CloudFront** :
   ```bash
   aws cloudfront create-invalidation --distribution-id VOTRE_DISTRIBUTION_ID --paths "/*"
   ```

Ou depuis la console AWS :
- CloudFront > Votre distribution > Invalidations > Create invalidation
- Paths: `/*`

---

## ✅ Vérification

1. **Accéder à votre site** via l'URL CloudFront
2. **Vérifier le cadenas** 🔒 dans la barre d'adresse
3. **Tester** : Le site devrait rediriger automatiquement HTTP → HTTPS

---

## 💰 Coûts

- **CloudFront** : Gratuit pour les 1 TB de transfert/mois
- **Certificat SSL** : Gratuit via AWS Certificate Manager
- **HTTPS** : Gratuit

---

## 🎉 C'est tout !

Votre site est maintenant accessible en **HTTPS** ! 🔒

