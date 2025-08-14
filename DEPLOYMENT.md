# Guide de Déploiement sur Vercel

## Prérequis

1. Compte Vercel (gratuit)
2. Compte MongoDB Atlas (gratuit)
3. Git (pour versionner le code)

## Étapes de Déploiement

### 1. Préparer le projet

```bash
# Installer les dépendances
npm install

# Créer les produits de test
npm run seed
```

### 2. Configurer les Variables d'Environnement

Dans votre dashboard Vercel, ajoutez ces variables d'environnement :

```
DATABASE_URL=mongodb+srv://lama:lama@cluster0.254tgqb.mongodb.net/SDK?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
SESSION_SECRET=votre-secret-session-super-securise
```

### 3. Déployer sur Vercel

#### Option A : Via l'interface Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Configurez les variables d'environnement
5. Cliquez sur "Deploy"

#### Option B : Via CLI Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel

# Pour la production
vercel --prod
```

### 4. Configuration Spécifique

Le projet utilise une architecture hybride :
- **Frontend** : React + Vite (build statique)
- **Backend** : Express.js (API routes)
- **Base de données** : MongoDB Atlas

### 5. Vérification du Déploiement

Après le déploiement, vérifiez :
- ✅ Le site est accessible
- ✅ Les API fonctionnent (`/api/products`)
- ✅ Les produits s'affichent dans SKD Shop
- ✅ Le header responsive fonctionne

## Structure du Projet pour Vercel

```
├── client/           # Frontend React
│   ├── src/
│   ├── package.json  # Dependencies frontend
│   └── vite.config.ts
├── server/           # Backend Express
│   ├── index.ts      # Point d'entrée API
│   ├── models.ts     # Modèles MongoDB
│   └── routes.ts     # Routes API
├── shared/           # Types partagés
├── vercel.json       # Configuration Vercel
└── package.json      # Dependencies globales
```

## Variables d'Environnement Requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `NODE_ENV` | Environnement | `production` |
| `SESSION_SECRET` | Secret pour les sessions | `votre-secret-super-securise` |

## Dépannage

### Problème : API ne fonctionne pas
- Vérifiez que `DATABASE_URL` est correct
- Vérifiez les logs Vercel dans le dashboard

### Problème : Build échoue
- Vérifiez que toutes les dépendances sont installées
- Vérifiez la syntaxe TypeScript

### Problème : Variables d'environnement
- Redéployez après avoir ajouté les variables
- Vérifiez que les variables sont bien définies

## Support

Pour toute question sur le déploiement, consultez :
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation MongoDB Atlas](https://docs.atlas.mongodb.com/)

