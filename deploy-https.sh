#!/bin/bash
# Déploiement avec invalidation CloudFront pour HTTPS

set -e

# Variables (à modifier selon votre configuration)
BUCKET_NAME="chatbruti"
DISTRIBUTION_ID="" # Remplacez par l'ID de votre distribution CloudFront
REGION="eu-west-1"

echo "🚀 Déploiement avec HTTPS (CloudFront)"
echo "======================================"

# 1. Build
echo "🏗️  Construction de l'application..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Échec de la construction."
  exit 1
fi

echo "✅ Application construite."

# 2. Déployer sur S3
echo "☁️  Synchronisation vers S3..."
aws s3 sync dist/ s3://${BUCKET_NAME} --delete --region ${REGION}

if [ $? -ne 0 ]; then
  echo "❌ Échec de la synchronisation S3."
  exit 1
fi

echo "✅ Fichiers déployés sur S3."

# 3. Invalider le cache CloudFront (si DISTRIBUTION_ID est défini)
if [ -n "${DISTRIBUTION_ID}" ] && [ "${DISTRIBUTION_ID}" != "" ]; then
  echo "⚡ Invalidation du cache CloudFront..."
  aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"
  
  if [ $? -ne 0 ]; then
    echo "⚠️  Avertissement : Échec de l'invalidation CloudFront."
  else
    echo "✅ Cache CloudFront invalidé. Les changements seront visibles sous peu."
  fi
else
  echo "⏭️  Invalidation CloudFront ignorée : DISTRIBUTION_ID non configuré."
  echo "💡 Pour activer l'invalidation, modifiez DISTRIBUTION_ID dans ce script."
fi

echo "🎉 Déploiement terminé !"
echo ""
echo "🌐 Votre site est accessible en HTTPS via CloudFront !"

