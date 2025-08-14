# 🚀 Résolution Rapide - Problème MongoDB sur Vercel

## ✅ Diagnostic
- ✅ MongoDB Atlas fonctionne (testé localement)
- ✅ Base de données contient 5 produits
- ❌ Variable `DATABASE_URL` manquante sur Vercel

## 🔧 Solution Immédiate

### 1. Ajouter la variable d'environnement sur Vercel

1. **Allez sur [vercel.com](https://vercel.com)**
2. **Connectez-vous et sélectionnez votre projet**
3. **Cliquez sur "Settings" → "Environment Variables"**
4. **Ajoutez cette variable :**

```
Name: DATABASE_URL
Value: mongodb+srv://lama:lama@cluster0.254tgqb.mongodb.net/SDK?retryWrites=true&w=majority&appName=Cluster0
Environment: Production, Preview, Development
```

5. **Cliquez sur "Save"**

### 2. Redéployer

- Vercel redéploiera automatiquement
- Ou allez dans "Deployments" et cliquez "Redeploy"

### 3. Vérifier

- Testez votre site : `https://votre-projet.vercel.app`
- Vérifiez l'endpoint de santé : `https://votre-projet.vercel.app/api/health`
- Vérifiez les produits : `https://votre-projet.vercel.app/api/products`

## 🧪 Tests Locaux (Optionnel)

```bash
# Tester la connexion DB
npm run test-db

# Voir les produits
curl http://localhost:5000/api/products

# Vérifier la santé
curl http://localhost:5000/api/health
```

## 📊 Résultats Attendus

Après configuration :

- ✅ `/api/health` retourne `{"status":"ok","database":"connected"}`
- ✅ `/api/products` retourne 5 produits
- ✅ Page Shop affiche les produits
- ✅ Page Events affiche les produits d'événements
- ✅ Page Rent affiche les produits de location

## 🆘 Si ça ne marche toujours pas

1. **Vérifiez les logs Vercel** : Functions → Votre API → Logs
2. **Vérifiez les variables d'environnement** : Settings → Environment Variables
3. **Testez l'URL MongoDB** avec MongoDB Compass
4. **Vérifiez les permissions MongoDB Atlas** (IP 0.0.0.0/0)

## 📞 Support

Si le problème persiste, vérifiez :
- Les logs Vercel pour les erreurs spécifiques
- La configuration MongoDB Atlas (Network Access)
- Les permissions de l'utilisateur MongoDB
