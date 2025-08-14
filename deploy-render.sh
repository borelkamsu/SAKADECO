#!/bin/bash

echo "🚀 Préparation du déploiement Render..."

# Vérifier que git est configuré
if ! git config --get user.name > /dev/null 2>&1; then
    echo "❌ Git n'est pas configuré. Veuillez configurer git :"
    echo "   git config --global user.name 'Votre Nom'"
    echo "   git config --global user.email 'votre@email.com'"
    exit 1
fi

# Vérifier que le repository est connecté à GitHub
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Aucun remote GitHub trouvé. Veuillez :"
    echo "   1. Créer un repository sur GitHub"
    echo "   2. Exécuter : git remote add origin https://github.com/votre-username/votre-repo.git"
    exit 1
fi

# Commiter les changements
echo "📝 Ajout des fichiers de configuration Render..."
git add render.yaml .dockerignore RENDER_DEPLOYMENT.md
git commit -m "✨ Ajout configuration Render pour déploiement"

# Pousser vers GitHub
echo "📤 Poussage vers GitHub..."
git push origin main

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "🎯 Prochaines étapes :"
echo "   1. Aller sur https://render.com"
echo "   2. Créer un compte (gratuit)"
echo "   3. Cliquer sur 'New +' → 'Web Service'"
echo "   4. Connecter votre GitHub et sélectionner ce repository"
echo "   5. Configurer :"
echo "      - Name: sakadeco-api"
echo "      - Environment: Node"
echo "      - Build Command: npm install && npm run build"
echo "      - Start Command: npm start"
echo "   6. Ajouter les variables d'environnement :"
echo "      - NODE_ENV=production"
echo "      - DATABASE_URL=votre_url_mongodb"
echo "      - SESSION_SECRET=votre_secret"
echo "      - PORT=10000"
echo ""
echo "🌐 Votre API sera accessible sur : https://sakadeco-api.onrender.com"
