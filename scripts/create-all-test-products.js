import mongoose from 'mongoose';
import { Product } from '../server/models/Product.js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration de la base de données
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/sakadeco';

// Images de test (URLs d'images gratuites)
const TEST_IMAGES = {
  // Images pour les produits de vente
  balloons: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
  ],
  flowers: [
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400&h=400&fit=crop'
  ],
  candles: [
    'https://images.unsplash.com/photo-1603006905004-6f2c0c0c0c0c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1603006905004-6f2c0c0c0c0c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1603006905004-6f2c0c0c0c0c?w=400&h=400&fit=crop'
  ],
  tableware: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop'
  ],
  // Images pour les produits de location
  tables: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop'
  ],
  chairs: [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'
  ],
  lighting: [
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop'
  ],
  decor: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop'
  ]
};

// Produits destinés à la vente
const saleProducts = [
  {
    name: "Ballons de décoration premium",
    description: "Ballons de haute qualité pour vos événements. Disponibles en différentes tailles et couleurs pour personnaliser votre décoration selon vos besoins.",
    price: 24.99,
    category: "shop",
    subcategory: "décoration",
    mainImageUrl: TEST_IMAGES.balloons[0],
    additionalImages: TEST_IMAGES.balloons.slice(1),
    isCustomizable: true,
    isForSale: true,
    isForRent: false,
    stockQuantity: 50,
          customizationOptions: {
        taille: {
          type: 'dropdown',
          label: 'Taille du ballon',
          required: true,
          options: ['Petit (20cm)', 'Moyen (30cm)', 'Grand (40cm)', 'Extra Large (50cm)']
        },
        couleur: {
          type: 'dropdown',
          label: 'Couleur',
          required: true,
          options: ['Rouge', 'Bleu', 'Vert', 'Jaune', 'Rose', 'Violet', 'Orange', 'Blanc', 'Or', 'Argent']
        },
        quantite: {
          type: 'dropdown',
          label: 'Quantité',
          required: true,
          options: ['1', '5', '10', '15', '20', '25', '30']
        },
        message: {
          type: 'textarea',
          label: 'Message personnalisé (optionnel)',
          required: false,
          placeholder: 'Votre message personnalisé...',
          maxLength: 100
        },
        nameEngraving: {
          type: 'name_engraving',
          label: 'Gravure de nom',
          required: false,
          engravingType: 'text',
          engravingPosition: 'front',
          engravingStyle: 'simple'
        }
      }
  },
  {
    name: "Bouquet de fleurs artificielles",
    description: "Magnifique bouquet de fleurs artificielles de haute qualité. Parfait pour une décoration durable et élégante.",
    price: 89.99,
    category: "shop",
    subcategory: "fleurs",
    mainImageUrl: TEST_IMAGES.flowers[0],
    additionalImages: TEST_IMAGES.flowers.slice(1),
    isCustomizable: true,
    isForSale: true,
    isForRent: false,
    stockQuantity: 25,
    customizationOptions: {
      style: {
        type: 'dropdown',
        label: 'Style de bouquet',
        required: true,
        options: ['Romantique', 'Moderne', 'Rustique', 'Élégant', 'Coloré', 'Pastel']
      },
      couleurs: {
        type: 'dropdown',
        label: 'Combinaison de couleurs',
        required: true,
        options: ['Roses et blancs', 'Rouges et roses', 'Jaunes et oranges', 'Violets et blancs', 'Multicolore', 'Blancs uniquement']
      },
      taille: {
        type: 'dropdown',
        label: 'Taille du bouquet',
        required: true,
        options: ['Petit (30cm)', 'Moyen (45cm)', 'Grand (60cm)', 'Extra Large (80cm)']
      },
      vase: {
        type: 'checkbox',
        label: 'Inclure un vase assorti',
        required: false,
        options: ['Oui, inclure un vase (+15€)']
      }
    }
  },
  {
    name: "Bougies décoratives parfumées",
    description: "Bougies décoratives parfumées pour créer une ambiance chaleureuse et romantique. Parfaites pour les dîners aux chandelles.",
    price: 34.99,
    category: "shop",
    subcategory: "éclairage",
    mainImageUrl: TEST_IMAGES.candles[0],
    additionalImages: TEST_IMAGES.candles.slice(1),
    isCustomizable: true,
    isForSale: true,
    isForRent: false,
    stockQuantity: 40,
    customizationOptions: {
      parfum: {
        type: 'dropdown',
        label: 'Parfum',
        required: true,
        options: ['Vanille', 'Lavande', 'Rose', 'Citron', 'Cannelle', 'Jasmin', 'Sans parfum']
      },
      couleur: {
        type: 'dropdown',
        label: 'Couleur de la bougie',
        required: true,
        options: ['Blanc', 'Crème', 'Rose', 'Bleu', 'Vert', 'Violet', 'Rouge', 'Or']
      },
      taille: {
        type: 'dropdown',
        label: 'Taille',
        required: true,
        options: ['Petite (4h)', 'Moyenne (8h)', 'Grande (12h)', 'Extra Large (24h)']
      },
      quantite: {
        type: 'dropdown',
        label: 'Nombre de bougies',
        required: true,
        options: ['1', '2', '3', '4', '6', '8', '12']
      }
    }
  },
  {
    name: "Service de vaisselle élégant",
    description: "Service de vaisselle élégant et raffiné pour vos événements spéciaux. Design moderne et durable.",
    price: 149.99,
    category: "shop",
    subcategory: "vaisselle",
    mainImageUrl: TEST_IMAGES.tableware[0],
    additionalImages: TEST_IMAGES.tableware.slice(1),
    isCustomizable: true,
    isForSale: true,
    isForRent: false,
    stockQuantity: 15,
    customizationOptions: {
      style: {
        type: 'dropdown',
        label: 'Style de vaisselle',
        required: true,
        options: ['Moderne', 'Classique', 'Rustique', 'Minimaliste', 'Luxe', 'Vintage']
      },
      couleur: {
        type: 'dropdown',
        label: 'Couleur',
        required: true,
        options: ['Blanc', 'Crème', 'Noir', 'Gris', 'Bleu', 'Rose', 'Vert', 'Doré']
      },
      pieces: {
        type: 'dropdown',
        label: 'Nombre de pièces',
        required: true,
        options: ['4 personnes', '6 personnes', '8 personnes', '12 personnes', '16 personnes']
      },
      type: {
        type: 'dropdown',
        label: 'Type de service',
        required: true,
        options: ['Assiettes plates uniquement', 'Service complet (assiettes + couverts)', 'Service premium (assiettes + couverts + verres)']
      }
    }
  }
];

// Produits destinés à la location
const rentalProducts = [
  {
    name: "Tables de réception élégantes",
    description: "Tables de réception de haute qualité pour vos événements. Disponibles en différentes tailles et finitions pour s'adapter à tous vos besoins.",
    price: 0,
    category: "rent",
    subcategory: "mobilier",
    mainImageUrl: TEST_IMAGES.tables[0],
    additionalImages: TEST_IMAGES.tables.slice(1),
    isCustomizable: true,
    isForSale: false,
    isForRent: true,
    stockQuantity: 20,
    dailyRentalPrice: 45.00,
    customizationOptions: {
      taille: {
        type: 'dropdown',
        label: 'Taille de la table',
        required: true,
        options: ['Ronde 120cm (8-10 personnes)', 'Ronde 150cm (10-12 personnes)', 'Rectangulaire 180x75cm (6-8 personnes)', 'Rectangulaire 240x75cm (8-10 personnes)']
      },
      style: {
        type: 'dropdown',
        label: 'Style de table',
        required: true,
        options: ['Moderne', 'Classique', 'Rustique', 'Luxe', 'Minimaliste']
      },
      couleur: {
        type: 'dropdown',
        label: 'Couleur',
        required: true,
        options: ['Blanc', 'Crème', 'Noir', 'Bois naturel', 'Chêne', 'Noyer']
      },
      quantite: {
        type: 'dropdown',
        label: 'Nombre de tables',
        required: true,
        options: ['1', '2', '3', '4', '5', '6', '8', '10']
      },
      nappes: {
        type: 'checkbox',
        label: 'Inclure des nappes assorties',
        required: false,
        options: ['Oui, inclure des nappes (+5€/table/jour)']
      }
    }
  },
  {
    name: "Chaises de réception confortables",
    description: "Chaises de réception élégantes et confortables. Parfaites pour vos mariages, événements d'entreprise et réceptions.",
    price: 0,
    category: "rent",
    subcategory: "mobilier",
    mainImageUrl: TEST_IMAGES.chairs[0],
    additionalImages: TEST_IMAGES.chairs.slice(1),
    isCustomizable: true,
    isForSale: false,
    isForRent: true,
    stockQuantity: 100,
    dailyRentalPrice: 8.50,
    customizationOptions: {
      style: {
        type: 'dropdown',
        label: 'Style de chaise',
        required: true,
        options: ['Chiavari classique', 'Chiavari moderne', 'Chiavari luxe', 'Chiavari rustique', 'Chiavari minimaliste']
      },
      couleur: {
        type: 'dropdown',
        label: 'Couleur',
        required: true,
        options: ['Blanc', 'Crème', 'Noir', 'Or', 'Argent', 'Bois naturel', 'Chêne', 'Noyer']
      },
      quantite: {
        type: 'dropdown',
        label: 'Nombre de chaises',
        required: true,
        options: ['10', '20', '30', '40', '50', '60', '80', '100', '120', '150']
      },
      coussins: {
        type: 'checkbox',
        label: 'Inclure des coussins assortis',
        required: false,
        options: ['Oui, inclure des coussins (+2€/chaise/jour)']
      },
      livraison: {
        type: 'checkbox',
        label: 'Service de livraison et installation',
        required: false,
        options: ['Oui, service complet (+50€)']
      }
    }
  },
  {
    name: "Éclairage d'ambiance professionnel",
    description: "Système d'éclairage d'ambiance professionnel pour créer l'atmosphère parfaite lors de vos événements.",
    price: 0,
    category: "rent",
    subcategory: "éclairage",
    mainImageUrl: TEST_IMAGES.lighting[0],
    additionalImages: TEST_IMAGES.lighting.slice(1),
    isCustomizable: true,
    isForSale: false,
    isForRent: true,
    stockQuantity: 15,
    dailyRentalPrice: 120.00,
    customizationOptions: {
      type: {
        type: 'dropdown',
        label: 'Type d\'éclairage',
        required: true,
        options: ['Éclairage LED RGB', 'Éclairage à spots', 'Éclairage d\'ambiance', 'Éclairage de scène', 'Éclairage complet (LED + spots)']
      },
      couleurs: {
        type: 'dropdown',
        label: 'Couleurs disponibles',
        required: true,
        options: ['Blanc chaud', 'Blanc froid', 'RGB multicolore', 'Or', 'Rose', 'Bleu', 'Vert', 'Personnalisé']
      },
      puissance: {
        type: 'dropdown',
        label: 'Puissance d\'éclairage',
        required: true,
        options: ['Standard (salle jusqu\'à 100m²)', 'Puissant (salle jusqu\'à 200m²)', 'Professionnel (salle jusqu\'à 500m²)', 'Événementiel (grands espaces)']
      },
      installation: {
        type: 'checkbox',
        label: 'Installation et configuration',
        required: false,
        options: ['Oui, installation professionnelle (+80€)', 'Oui, avec technicien sur place (+150€)']
      },
      controle: {
        type: 'dropdown',
        label: 'Contrôle d\'éclairage',
        required: true,
        options: ['Télécommande simple', 'Contrôleur DMX', 'Application mobile', 'Contrôle automatique']
      }
    }
  },
  {
    name: "Décoration florale et accessoires",
    description: "Ensemble de décoration florale et accessoires pour embellir vos événements. Comprend vases, supports et éléments décoratifs.",
    price: 0,
    category: "rent",
    subcategory: "décoration",
    mainImageUrl: TEST_IMAGES.decor[0],
    additionalImages: TEST_IMAGES.decor.slice(1),
    isCustomizable: true,
    isForSale: false,
    isForRent: true,
    stockQuantity: 30,
    dailyRentalPrice: 85.00,
    customizationOptions: {
      style: {
        type: 'dropdown',
        label: 'Style de décoration',
        required: true,
        options: ['Romantique', 'Moderne', 'Rustique', 'Élégant', 'Coloré', 'Pastel', 'Luxe', 'Minimaliste']
      },
      elements: {
        type: 'dropdown',
        label: 'Éléments inclus',
        required: true,
        options: ['Vases et supports uniquement', 'Vases + fleurs artificielles', 'Vases + fleurs + accessoires', 'Pack complet (vases + fleurs + accessoires + bougies)']
      },
      quantite: {
        type: 'dropdown',
        label: 'Nombre d\'éléments',
        required: true,
        options: ['5 éléments', '10 éléments', '15 éléments', '20 éléments', '25 éléments', '30 éléments']
      },
      couleurs: {
        type: 'dropdown',
        label: 'Palette de couleurs',
        required: true,
        options: ['Blancs et verts', 'Roses et blancs', 'Rouges et roses', 'Jaunes et oranges', 'Violets et blancs', 'Multicolore', 'Pastels', 'Personnalisé']
      },
      installation: {
        type: 'checkbox',
        label: 'Installation et décoration sur place',
        required: false,
        options: ['Oui, installation par nos décorateurs (+100€)', 'Oui, avec retrait le lendemain (+50€)']
      }
    }
  }
];

async function createAllTestProducts() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Connecté à MongoDB');

    // Supprimer tous les anciens produits de test
    console.log('🧹 Nettoyage des anciens produits de test...');
    const allProductNames = [...saleProducts.map(p => p.name), ...rentalProducts.map(p => p.name)];
    await Product.deleteMany({ 
      name: { 
        $in: allProductNames 
      } 
    });

    // Créer les produits de vente
    console.log('\n📦 Création des produits destinés à la vente...');
    const createdSaleProducts = await Product.insertMany(saleProducts);

    console.log('✅ Produits de vente créés:');
    createdSaleProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.price}€)`);
    });

    // Créer les produits de location
    console.log('\n📦 Création des produits destinés à la location...');
    const createdRentalProducts = await Product.insertMany(rentalProducts);

    console.log('✅ Produits de location créés:');
    createdRentalProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.dailyRentalPrice}€/jour)`);
    });

    console.log(`\n🎉 ${createdSaleProducts.length + createdRentalProducts.length} produits de test ont été créés !`);
    console.log(`  - ${createdSaleProducts.length} produits destinés à la vente (Boutique)`);
    console.log(`  - ${createdRentalProducts.length} produits destinés à la location (SDK Rend)`);
    console.log('\n📍 Vous pouvez maintenant tester votre site avec ces produits !');

  } catch (error) {
    console.error('❌ Erreur lors de la création des produits:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
createAllTestProducts();
