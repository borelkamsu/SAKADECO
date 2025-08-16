import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { z } from "zod";
import adminRoutes from "./routes/admin";
import paymentRoutes from "./routes/payment";
import invoiceRoutes from "./routes/invoice";

// Validation schemas for MongoDB
const insertProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  category: z.string(),
  subcategory: z.string().optional(),
  imageUrl: z.string().optional(),
  isCustomizable: z.boolean().optional(),
  isRentable: z.boolean().optional(),
  stockQuantity: z.number().optional(),
  dailyRentalPrice: z.number().optional(),
  customizationOptions: z.any().optional(),
});

const insertOrderSchema = z.object({
  userId: z.string().optional(),
  customerEmail: z.string().email(),
  customerName: z.string(),
  customerPhone: z.string().optional(),
  total: z.number(),
  orderType: z.string(),
  eventDate: z.string().optional(),
  notes: z.string().optional(),
  stripePaymentIntentId: z.string().optional(),
});

const insertQuoteSchema = z.object({
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  service: z.string(),
  description: z.string(),
  eventDate: z.string().optional(),
  estimatedPrice: z.number().optional(),
});

const insertNewsletterSubscriptionSchema = z.object({
  email: z.string().email(),
});

const insertReviewSchema = z.object({
  customerName: z.string(),
  customerEmail: z.string().email(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  service: z.string(),
});

const insertGalleryItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string(),
  category: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - only in development or if Replit Auth is configured
  if (process.env.NODE_ENV === 'development' || process.env.REPLIT_DOMAINS) {
    await setupAuth(app);
  }

  // Auth routes - simplified for development
  app.get('/api/auth/user', (req, res) => {
    // Return mock user data for development
    res.json({ 
      message: "Auth disabled in development",
      user: {
        id: "dev-user-1",
        email: "dev@example.com",
        name: "Development User",
        isAuthenticated: true
      },
      isAuthenticated: true
    });
  });

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      const dbStatus = db.connection.readyState === 1 ? 'connected' : 'disconnected';
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        environment: process.env.NODE_ENV || 'development',
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: (error as any).message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Test endpoint for debugging
  app.get('/api/test', async (req, res) => {
    try {
      res.json({
        message: 'API is working',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        dbConnected: db.connection.readyState === 1,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      });
    } catch (error) {
      res.status(500).json({
        error: (error as any).message
      });
    }
  });

  // Simple test endpoint without database
  app.get('/api/simple', (req, res) => {
    res.json({
      message: 'Simple API endpoint working',
      timestamp: new Date().toISOString(),
      status: 'ok'
    });
  });

  // List all products with their image URLs
  app.get('/api/products-images', async (req, res) => {
    try {
      const { Product } = await import('./models/Product');
      const products = await Product.find({});
      
      const productsWithImages = products.map(product => ({
        id: product._id,
        name: product.name,
        mainImageUrl: product.mainImageUrl,
        additionalImages: product.additionalImages || [],
        hasMainImage: !!product.mainImageUrl,
        hasAdditionalImages: product.additionalImages && product.additionalImages.length > 0
      }));
      
      res.json({
        totalProducts: products.length,
        products: productsWithImages
      });
    } catch (error) {
      console.error('Error fetching products with images:', error);
      res.status(500).json({
        error: error.message
      });
    }
  });

  // Simple image upload endpoint - no auth required
  app.post('/api/upload-images', async (req, res) => {
    try {
      const multer = await import('multer');
      const path = await import('path');
      
      // Configure multer for image upload
      const storage = multer.default.diskStorage({
        destination: (req, file, cb) => {
          cb(null, 'uploads/products/');
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, 'product-' + uniqueSuffix + path.default.extname(file.originalname));
        }
      });
      
      const upload = multer.default({ 
        storage: storage,
        limits: {
          fileSize: 5 * 1024 * 1024 // 5MB limit
        },
        fileFilter: (req, file, cb) => {
          if (file.mimetype.startsWith('image/')) {
            cb(null, true);
          } else {
            cb(new Error('Only image files are allowed'));
          }
        }
      });
      
      // Handle the upload
      upload.array('images', 10)(req, res, (err) => {
        if (err) {
          console.error('Upload error:', err);
          return res.status(400).json({ 
            message: 'Erreur lors de l\'upload des images',
            error: err.message 
          });
        }
        
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ message: 'Aucune image fournie' });
        }
        
        const imageUrls = (req.files as Express.Multer.File[]).map(file => {
          return `/uploads/products/${file.filename}`;
        });
        
        res.json({
          message: 'Images uploadées avec succès',
          imageUrls,
          filenames: (req.files as Express.Multer.File[]).map(file => file.filename)
        });
      });
    } catch (error) {
      console.error('Erreur upload images:', error);
      res.status(500).json({ 
        message: 'Erreur lors de l\'upload des images',
        error: error.message 
      });
    }
  });

  // Create test images for all products - public endpoint
  app.post('/api/create-test-images', async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const uploadDir = 'uploads/products/';
      if (!fs.default.existsSync(uploadDir)) {
        fs.default.mkdirSync(uploadDir, { recursive: true });
      }

      // Créer une image de test simple (1x1 pixel PNG en base64)
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const testImageBuffer = Buffer.from(testImageBase64, 'base64');

      // Récupérer tous les produits de la base de données
      const { Product } = await import('./models/Product');
      const products = await Product.find({});
      
      const createdImages = [];
      const existingImages = [];

      for (const product of products) {
        // Créer une image de test pour chaque produit
        const testImageName = `product-${product._id}-test.jpg`;
        const filePath = path.default.join(uploadDir, testImageName);
        
        if (!fs.default.existsSync(filePath)) {
          fs.default.writeFileSync(filePath, testImageBuffer);
          createdImages.push(testImageName);
        } else {
          existingImages.push(testImageName);
        }

        // Mettre à jour le produit avec l'image de test s'il n'en a pas
        if (!product.mainImageUrl) {
          product.mainImageUrl = `/uploads/products/${testImageName}`;
          await product.save();
          console.log(`✅ Updated product ${product.name} with test image`);
        }
      }

      res.json({
        message: 'Images de test créées avec succès',
        createdImages,
        existingImages,
        totalCreated: createdImages.length,
        totalExisting: existingImages.length,
        totalProducts: products.length
      });
    } catch (error) {
      console.error('Erreur lors de la création des images de test:', error);
      res.status(500).json({
        error: error.message,
        stack: error.stack
      });
    }
  });

  // Force create test images for all products
  app.post('/api/force-create-images', async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const uploadDir = 'uploads/products/';
      if (!fs.default.existsSync(uploadDir)) {
        fs.default.mkdirSync(uploadDir, { recursive: true });
      }

      // Créer une image de test simple (1x1 pixel PNG en base64)
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const testImageBuffer = Buffer.from(testImageBase64, 'base64');

      // Récupérer tous les produits de la base de données
      const { Product } = await import('./models/Product');
      const products = await Product.find({});
      
      const createdImages = [];
      const updatedProducts = [];

      for (const product of products) {
        // Créer une image de test pour chaque produit
        const testImageName = `product-${product._id}-test.jpg`;
        const filePath = path.default.join(uploadDir, testImageName);
        
        // Toujours créer l'image (forcer la création)
        fs.default.writeFileSync(filePath, testImageBuffer);
        createdImages.push(testImageName);

        // Mettre à jour le produit avec l'image de test
        product.mainImageUrl = `/uploads/products/${testImageName}`;
        await product.save();
        updatedProducts.push(product.name);
      }

      res.json({
        message: 'Images de test créées et produits mis à jour avec succès',
        createdImages,
        updatedProducts,
        totalCreated: createdImages.length,
        totalProducts: products.length
      });
    } catch (error) {
      console.error('Erreur lors de la création forcée des images:', error);
      res.status(500).json({
        error: error.message,
        stack: error.stack
      });
    }
  });

  // Create missing product images - public endpoint
  app.post('/api/create-missing-images', async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const uploadDir = 'uploads/products/';
      if (!fs.default.existsSync(uploadDir)) {
        fs.default.mkdirSync(uploadDir, { recursive: true });
      }

      // Créer une image de test simple (1x1 pixel PNG en base64)
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const testImageBuffer = Buffer.from(testImageBase64, 'base64');

      // Récupérer tous les produits de la base de données
      const { Product } = await import('./models/Product');
      const products = await Product.find({});
      
      const createdImages = [];
      const existingImages = [];

      for (const product of products) {
        if (product.mainImageUrl && product.mainImageUrl.startsWith('/uploads/products/')) {
          const filename = product.mainImageUrl.replace('/uploads/products/', '');
          const filePath = path.default.join(uploadDir, filename);
          
          if (!fs.default.existsSync(filePath)) {
            fs.default.writeFileSync(filePath, testImageBuffer);
            createdImages.push(filename);
          } else {
            existingImages.push(filename);
          }
        }

        // Vérifier aussi les images supplémentaires
        if (product.additionalImages && Array.isArray(product.additionalImages)) {
          for (const imageUrl of product.additionalImages) {
            if (imageUrl && imageUrl.startsWith('/uploads/products/')) {
              const filename = imageUrl.replace('/uploads/products/', '');
              const filePath = path.default.join(uploadDir, filename);
              
              if (!fs.default.existsSync(filePath)) {
                fs.default.writeFileSync(filePath, testImageBuffer);
                createdImages.push(filename);
              } else {
                existingImages.push(filename);
              }
            }
          }
        }
      }

      res.json({
        message: 'Images manquantes créées avec succès',
        createdImages,
        existingImages,
        totalCreated: createdImages.length,
        totalExisting: existingImages.length
      });
    } catch (error) {
      console.error('Erreur lors de la création des images manquantes:', error);
      res.status(500).json({
        error: error.message,
        stack: error.stack
      });
    }
  });

  

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { category } = req.query;
      console.log('📦 Fetching products...', category ? `Category: ${category}` : 'All categories');
      
      // Check if database is connected
      if (db.connection.readyState === 1) {
        console.log('✅ Database connected, fetching real products');
        const { Product } = await import('./models/Product');
        
        const query: any = {};
        if (category) {
          query.category = category;
        }
        
        const products = await Product.find(query).sort({ createdAt: -1 });
        console.log(`📦 Found ${products.length} products in database`);
        
        res.json(products);
      } else {
        console.log('⚠️ Database not connected, using mock data');
        // Mock products with new structure
        const mockProducts = [
          {
            _id: "mock-1",
            name: "Ballons de Fête Colorés",
            description: "Lot de 50 ballons de fête multicolores de haute qualité, parfaits pour toutes vos célébrations. Ballons en latex naturel, résistants et durables.",
            price: 25.99,
            category: "shop",
            subcategory: "ballons",
            mainImageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
            additionalImages: [
              "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
              "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=300&fit=crop"
            ],
            isCustomizable: true,
            isRentable: false,
            stockQuantity: 100,
            dailyRentalPrice: undefined,
            customizationOptions: {
              "couleurs": {
                type: "dropdown",
                label: "Couleurs disponibles",
                required: true,
                options: ["rouge", "bleu", "vert", "jaune", "rose", "orange", "violet"]
              },
              "taille": {
                type: "dropdown",
                label: "Taille des ballons",
                required: false,
                options: ["petit", "moyen", "grand"]
              },
              "message": {
                type: "text",
                label: "Message personnalisé",
                required: false,
                placeholder: "Entrez votre message...",
                maxLength: 50
              }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: "mock-2",
            name: "Décoration de Table Élégante",
            description: "Set complet de décoration de table pour événements spéciaux. Inclut nappes, serviettes, bougies et accessoires décoratifs.",
            price: 89.99,
            category: "shop",
            subcategory: "décoration",
            mainImageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=300&fit=crop",
            additionalImages: [
              "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
            ],
            isCustomizable: true,
            isRentable: true,
            stockQuantity: 25,
            dailyRentalPrice: 15.00,
            customizationOptions: {
              "thème": {
                type: "dropdown",
                label: "Thème de décoration",
                required: true,
                options: ["romantique", "moderne", "vintage", "naturel", "luxe"]
              },
              "couleurs": {
                type: "checkbox",
                label: "Couleurs préférées",
                required: false,
                options: ["blanc", "rose", "doré", "argenté", "vert"]
              },
              "message": {
                type: "textarea",
                label: "Instructions spéciales",
                required: false,
                placeholder: "Décrivez vos préférences...",
                maxLength: 200
              }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        const filteredProducts = category 
          ? mockProducts.filter(p => p.category === category)
          : mockProducts;
        
        res.json(filteredProducts);
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      if ((error as any).message && (error as any).message.includes('Database not connected')) {
        res.status(503).json({ 
          message: "Service temporairement indisponible - Problème de connexion à la base de données",
          error: "DATABASE_CONNECTION_ERROR"
        });
      } else {
        res.status(500).json({ 
          message: "Erreur lors de la récupération des produits",
          error: "INTERNAL_SERVER_ERROR"
        });
      }
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log('📦 Fetching product:', id);
      
      // Check if database is connected
      if (db.connection.readyState === 1) {
        console.log('✅ Database connected, fetching real product');
        const { Product } = await import('./models/Product');
        
        const product = await Product.findById(id);
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
        
        console.log('📦 Found product:', product.name);
        res.json(product);
      } else {
        console.log('⚠️ Database not connected, using mock data');
        // Return mock product for testing
        const mockProduct = {
          _id: id,
          name: "Ballons de Fête Colorés",
          description: "Lot de 50 ballons de fête multicolores de haute qualité, parfaits pour toutes vos célébrations. Ballons en latex naturel, résistants et durables.",
          price: 25.99,
          category: "shop",
          subcategory: "ballons",
          mainImageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
          additionalImages: [
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=300&fit=crop"
          ],
          isCustomizable: true,
          isRentable: false,
          stockQuantity: 100,
          dailyRentalPrice: undefined,
          customizationOptions: {
            "couleurs": {
              type: "dropdown",
              label: "Couleurs disponibles",
              required: true,
              options: ["rouge", "bleu", "vert", "jaune", "rose", "orange", "violet"]
            },
            "taille": {
              type: "dropdown",
              label: "Taille des ballons",
              required: false,
              options: ["petit", "moyen", "grand"]
            },
            "message": {
              type: "text",
              label: "Message personnalisé",
              required: false,
              placeholder: "Entrez votre message...",
              maxLength: 50
            }
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        res.json(mockProduct);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Error fetching product' });
    }
  });

  app.post('/api/products', async (req: any, res) => {
    try {
      // Only check auth if it's enabled
      if (process.env.NODE_ENV === 'development' || process.env.REPLIT_DOMAINS) {
        // Check if user is admin
        const user = await storage.getUser(req.user.claims.sub);
        if (user?.role !== 'admin') {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Admin can see all orders, users only their own
      const orders = user?.role === 'admin' 
        ? await storage.getOrders()
        : await storage.getOrders(userId);
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // Add order items if provided
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          await storage.addOrderItem({
            ...item,
            orderId: order.id,
          });
        }
      }

      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Rental availability check
  app.get('/api/rentals/availability/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      const isAvailable = await storage.getRentalAvailability(productId, start, end);
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  // Quote routes
  app.post('/api/quotes', async (req, res) => {
    try {
      const quoteData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(quoteData);
      res.status(201).json(quote);
    } catch (error) {
      console.error("Error creating quote:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quote" });
    }
  });

  app.get('/api/quotes', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  // Payment routes (placeholder for future integration)
  app.post("/api/create-payment-intent", async (req, res) => {
    res.status(501).json({ 
      message: "Payment system not implemented yet",
      info: "Payment integration will be added in a future version"
    });
  });

  // Newsletter routes
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const subscriptionData = insertNewsletterSubscriptionSchema.parse(req.body);
      const subscription = await storage.subscribeToNewsletter(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  app.get('/api/newsletter', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const subscriptions = await storage.getNewsletterSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching newsletter subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch newsletter subscriptions" });
    }
  });

  // Review routes
  app.get('/api/reviews', async (req, res) => {
    try {
      // Always return mock data for now
      console.log('⚠️ Using mock reviews data to avoid database issues');
      const mockReviews = [
        {
          _id: "review-1",
          customerName: "Marie Dupont",
          customerEmail: "marie@example.com",
          rating: 5,
          comment: "Service exceptionnel ! Les décorations étaient magnifiques.",
          serviceType: "events",
          isPublished: true
        },
        {
          _id: "review-2",
          customerName: "Jean Martin",
          customerEmail: "jean@example.com",
          rating: 4,
          comment: "Très satisfait du service et de la qualité des produits.",
          serviceType: "shop",
          isPublished: true
        }
      ];
      res.json(mockReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Gallery routes
  app.get('/api/gallery', async (req, res) => {
    try {
      const { category } = req.query;
      
      // Always return mock data for now
      console.log('⚠️ Using mock gallery data to avoid database issues');
      const mockGallery = [
        {
          _id: "gallery-1",
          title: "Décoration Mariage",
          description: "Magnifique décoration pour mariage",
          imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop",
          category: "events",
          isPublished: true
        },
        {
          _id: "gallery-2",
          title: "Arche de Ballons",
          description: "Arche de ballons événementielle",
          imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=300&fit=crop",
          category: "events",
          isPublished: true
        }
      ];
      
      const filteredItems = category 
        ? mockGallery.filter(item => item.category === category)
        : mockGallery;
        
      res.json(filteredItems);
    } catch (error) {
      console.error("Error fetching gallery items:", error);
      res.status(500).json({ message: "Failed to fetch gallery items" });
    }
  });

  app.post('/api/gallery', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const itemData = insertGalleryItemSchema.parse(req.body);
      const item = await storage.createGalleryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating gallery item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid gallery item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create gallery item" });
    }
  });

  // Webhook placeholder for future payment integration
  app.post('/api/payment-webhook', async (req, res) => {
    res.status(501).json({ 
      message: "Payment webhook not implemented yet",
      info: "Webhook will be configured when payment system is integrated"
    });
  });

  // Admin routes
  app.use('/api/admin', adminRoutes);
  
  // Payment routes
  app.use('/api/payment', paymentRoutes);
  
  // Invoice routes
  app.use('/api/invoice', invoiceRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
