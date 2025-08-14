# SakaDeco Group - Site Web Complet

Site web professionnel pour SAKADECO Group avec 6 pôles d'activité : décoration d'événements, personnalisation de produits, location de matériel, organisation d'événements, décoration intérieure et coordination business.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ 
- PostgreSQL (automatiquement configuré sur Replit)

### Installation et Lancement

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer la base de données
npm run db:push

# 3. Lancer le projet
npm run dev
```

Le site sera accessible sur `http://localhost:5000` (ou sur votre URL Replit).

## 🏗️ Architecture du Projet

### Structure des Dossiers
```
├── client/src/           # Frontend React + TypeScript
│   ├── components/       # Composants réutilisables
│   ├── pages/           # Pages de l'application
│   ├── hooks/           # Hooks React personnalisés
│   └── lib/             # Utilitaires et configuration
├── server/              # Backend Express + TypeScript
│   ├── routes.ts        # Routes API
│   ├── storage.ts       # Interface de stockage
│   └── db.ts           # Configuration base de données
├── shared/              # Types et schémas partagés
│   └── schema.ts        # Schémas Drizzle ORM
└── package.json         # Configuration du projet
```

### Technologies Utilisées
- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Express.js, TypeScript
- **Base de données**: PostgreSQL avec Drizzle ORM
- **Authentification**: Replit Auth
- **Build**: Vite
- **Styling**: Tailwind CSS avec thème personnalisé

## 🎨 Fonctionnalités

### 6 Pôles d'Activité
1. **SKD Shop** - Ballons, fleurs & accessoires
2. **SKD Créa** - Personnalisation & papeterie  
3. **SKD Rent** - Location de matériel festif
4. **SKD Events** - Décoration d'événements
5. **SKD Home** - Décoration intérieure & Home organizing
6. **SKD & Co** - Organisation d'événements

### Composants Modernes
- **Newsletter** - Inscription à la newsletter
- **Avis Clients** - Témoignages et évaluations
- **Galerie** - Showcase des réalisations
- **Personnalisation** - Configurateur de produits
- **Réservation** - Système de location
- **Contact** - Formulaires de devis

## 📊 Base de Données

### Tables Principales
- `users` - Utilisateurs et profils
- `products` - Catalogue produits
- `orders` - Commandes et suivi
- `rentals` - Locations de matériel
- `quotes` - Devis personnalisés
- `reviews` - Avis clients
- `newsletter_subscriptions` - Abonnements newsletter
- `gallery_items` - Portfolio d'images

### Migration
```bash
# Appliquer les changements de schéma
npm run db:push

# Génerer les types TypeScript
npm run db:generate
```

## 🛠️ Scripts Disponibles

```bash
# Développement
npm run dev          # Lance le serveur de développement

# Base de données
npm run db:push      # Applique les changements de schéma
npm run db:generate  # Génère les types TypeScript
npm run db:studio    # Interface admin Drizzle Studio

# Build
npm run build        # Build de production
npm start           # Lance la version de production
```

## 🎯 API Endpoints

### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détail d'un produit
- `POST /api/products` - Créer un produit (admin)

### Commandes
- `GET /api/orders` - Historique des commandes
- `POST /api/orders` - Créer une commande

### Location
- `GET /api/rentals/availability` - Vérifier disponibilité
- `POST /api/rentals` - Créer une réservation

### Newsletter
- `POST /api/newsletter/subscribe` - S'abonner à la newsletter
- `GET /api/newsletter` - Liste des abonnés (admin)

### Avis
- `GET /api/reviews` - Avis publiés
- `POST /api/reviews` - Soumettre un avis

### Galerie
- `GET /api/gallery` - Images de la galerie
- `POST /api/gallery` - Ajouter une image (admin)

## 🔧 Configuration

### Variables d'Environnement
```bash
# Base de données (automatique sur Replit)
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=...
PGUSER=...
PGPASSWORD=...
PGDATABASE=...

# Environnement
NODE_ENV=development
```

### Thème et Couleurs
Le projet utilise un système de couleurs personnalisé pour chaque pôle :
- **Gold** (`#D4AF37`) - Couleur principale
- **SKD Shop** (`#F8BBD9`) - Rose pâle
- **SKD Créa** (`#E1BEE7`) - Violet pâle
- **SKD Rent** (`#B8E6D2`) - Vert menthe
- **SKD Events** (`#FFF2B3`) - Jaune pâle
- **SKD Home** (`#FCDAB7`) - Orange pâle
- **SKD Co** (`#AED9F5`) - Bleu pâle

## 🚀 Déploiement sur Replit

1. Fork ou importer le projet sur Replit
2. Les variables d'environnement seront automatiquement configurées
3. Cliquer sur "Run" pour lancer le projet
4. La base de données PostgreSQL sera automatiquement provisionnée

## 📱 Responsive Design

Le site est entièrement responsive et optimisé pour :
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🎨 Personnalisation

### Ajouter un Nouveau Service
1. Modifier `client/src/pages/Home.tsx` - Ajouter dans le tableau `services`
2. Créer la page dans `client/src/pages/`
3. Ajouter la route dans `client/src/App.tsx`
4. Définir les couleurs dans `client/src/index.css`

### Modifier le Thème
Les couleurs sont définies dans `client/src/index.css` avec les variables CSS custom properties.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👤 Contact

**Pajusly** - Fondatrice SakaDeco Group
- 📞 06 88 00 39 28
- 📍 Bordeaux Métropole
- ✉️ Contact via le formulaire du site

---

## 🔄 Changelog

### Version 2.0 - Janvier 2025
- ✅ Design moderne inspiré de M&Paillettes
- ✅ Nouveaux composants : Newsletter, Avis, Galerie
- ✅ Interface améliorée avec animations
- ✅ Système de base de données complet
- ✅ API REST complète
- ✅ Responsive design optimisé

### Version 1.0 - Décembre 2024
- ✅ Site initial avec 6 pôles d'activité
- ✅ Système d'authentification
- ✅ Catalogue produits
- ✅ Système de commandes
- ✅ Interface d'administration