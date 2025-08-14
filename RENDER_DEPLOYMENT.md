# Déploiement sur Render

## Étapes pour déployer sur Render

### 1. Préparer le projet
- Le projet est déjà configuré pour Render
- Le fichier `render.yaml` est présent
- Le script `npm start` est configuré

### 2. Déployer sur Render

1. **Aller sur [render.com](https://render.com)**
2. **Créer un compte** (gratuit)
3. **Cliquer sur "New +"** → "Web Service"
4. **Connecter votre GitHub** et sélectionner ce repository
5. **Configurer le service :**
   - **Name:** `sakadeco-api`
   - **Environment:** `Node`
   - **Region:** `Frankfurt (EU Central)` (plus proche de la France)
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

### 3. Variables d'environnement

Dans les paramètres du service, ajouter :

```
NODE_ENV=production
DATABASE_URL=mongodb+srv://votre_username:votre_password@cluster0.254tgqb.mongodb.net/SDK?retryWrites=true&w=majority&appName=Cluster0
SESSION_SECRET=votre_session_secret_ici
PORT=10000
```

### 4. Déployer le frontend sur Vercel

Le frontend peut rester sur Vercel, mais il faut modifier l'URL de l'API :

1. Dans `client/src/lib/queryClient.ts`, changer l'URL de l'API
2. Remplacer `http://localhost:5000` par l'URL Render (ex: `https://sakadeco-api.onrender.com`)

### 5. Avantages de Render

✅ **Plus simple** que Vercel pour les serveurs  
✅ **Support Node.js natif**  
✅ **Variables d'environnement** faciles à configurer  
✅ **Logs en temps réel**  
✅ **Redémarrage automatique** en cas d'erreur  
✅ **HTTPS automatique**  

### 6. URL finale

Votre API sera accessible sur : `https://sakadeco-api.onrender.com`

## Test rapide

Une fois déployé, testez :
- `https://sakadeco-api.onrender.com/api/health`
- `https://sakadeco-api.onrender.com/api/products`
- `https://sakadeco-api.onrender.com/api/simple`
