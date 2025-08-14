# Configuration Vercel pour MongoDB Atlas

## Problème identifié
Votre application ne peut pas se connecter à MongoDB Atlas sur Vercel car la variable d'environnement `DATABASE_URL` n'est pas configurée.

## Solution

### 1. Configurer les variables d'environnement sur Vercel

1. **Connectez-vous à votre dashboard Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous à votre compte

2. **Accédez à votre projet**
   - Cliquez sur votre projet "HelloWeb"

3. **Allez dans les paramètres**
   - Cliquez sur l'onglet "Settings"
   - Puis "Environment Variables"

4. **Ajoutez la variable DATABASE_URL**
   - Cliquez sur "Add New"
   - **Name**: `DATABASE_URL`
   - **Value**: `mongodb+srv://lama:lama@cluster0.254tgqb.mongodb.net/SDK?retryWrites=true&w=majority&appName=Cluster0`
   - **Environment**: Sélectionnez "Production" et "Preview"
   - Cliquez sur "Save"

### 2. Redéployer l'application

Après avoir ajouté la variable d'environnement :

1. **Redéployez automatiquement**
   - Vercel redéploiera automatiquement votre application
   - Ou allez dans l'onglet "Deployments" et cliquez sur "Redeploy"

2. **Vérifiez les logs**
   - Allez dans l'onglet "Functions" 
   - Cliquez sur votre fonction API
   - Vérifiez les logs pour voir si la connexion MongoDB fonctionne

### 3. Tester la connexion

Vous pouvez tester la connexion en exécutant :

```bash
# Localement
npm run test-db

# Ou directement
npx tsx server/test-db-connection.ts
```

### 4. Vérifier que les données existent

Si la connexion fonctionne mais qu'il n'y a pas de produits, exécutez :

```bash
npx tsx server/seedProducts.ts
```

## Variables d'environnement nécessaires

| Variable | Valeur | Description |
|----------|--------|-------------|
| `DATABASE_URL` | `mongodb+srv://lama:lama@cluster0.254tgqb.mongodb.net/SDK?retryWrites=true&w=majority&appName=Cluster0` | URL de connexion MongoDB Atlas |
| `NODE_ENV` | `production` | Environnement de production |

## Dépannage

### Si la connexion échoue toujours :

1. **Vérifiez les logs Vercel**
   - Allez dans Functions > Votre API > Logs
   - Cherchez les erreurs de connexion MongoDB

2. **Testez la connexion MongoDB**
   - Utilisez MongoDB Compass ou mongo shell
   - Vérifiez que l'URL de connexion est correcte

3. **Vérifiez les permissions MongoDB Atlas**
   - Assurez-vous que l'IP de Vercel est autorisée
   - Ou configurez l'accès depuis n'importe où (0.0.0.0/0)

### Si les produits n'apparaissent pas :

1. **Vérifiez que la base de données contient des données**
2. **Exécutez le script de seed**
3. **Vérifiez les logs de l'API `/api/products`**

## Commandes utiles

```bash
# Tester la connexion DB
npx tsx server/test-db-connection.ts

# Ajouter des produits de test
npx tsx server/seedProducts.ts

# Voir les logs en temps réel
vercel logs --follow
```
