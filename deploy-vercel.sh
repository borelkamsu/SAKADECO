#!/bin/bash

echo "🚀 Déploiement SakaDeco Group sur Vercel"
echo "========================================"

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "Installez-le avec: npm i -g vercel"
    exit 1
fi

# Vérifier que nous sommes connectés à Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Vous n'êtes pas connecté à Vercel"
    echo "Connectez-vous avec: vercel login"
    exit 1
fi

echo "✅ Vercel CLI configuré"

# Build du projet
echo "📦 Build du projet..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build"
    exit 1
fi

echo "✅ Build réussi"

# Déploiement
echo "🚀 Déploiement sur Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Déploiement réussi !"
    echo "🌐 Votre site est maintenant en ligne"
else
    echo "❌ Erreur lors du déploiement"
    exit 1
fi

