import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { z } from "zod";
import adminRoutes from "./routes/admin";

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

  // Auth routes - only if auth is enabled
  if (process.env.NODE_ENV === 'development' || process.env.REPLIT_DOMAINS) {
    app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      }
    });
  } else {
    // Mock auth endpoint for production without Replit Auth
    app.get('/api/auth/user', (req, res) => {
      res.json({ 
        message: "Auth disabled in production",
        user: null,
        isAuthenticated: false
      });
    });
  }

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

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { category } = req.query;
      console.log('📦 Fetching products...', category ? `Category: ${category}` : 'All categories');
      
      // Always return mock data for now to avoid database issues
      console.log('⚠️ Using mock data to avoid database issues');
      const mockProducts = [
        {
          _id: "mock-1",
          name: "Ballons de Fête Colorés",
          description: "Lot de 50 ballons de fête multicolores de haute qualité, parfaits pour toutes vos célébrations. Ballons en latex naturel, résistants et durables.",
          price: 25.99,
          category: "shop",
          subcategory: "ballons",
          imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
          isCustomizable: true,
          isRentable: false,
          stockQuantity: 100,
          customizationOptions: {
            colors: ["rouge", "bleu", "vert", "jaune", "rose", "orange", "violet"],
            sizes: ["petit", "moyen", "grand"],
            text: true
          }
        },
        {
          _id: "mock-2", 
          name: "Bouquet de Roses Premium",
          description: "Magnifique bouquet de 12 roses rouges fraîches, arrangées avec soin et accompagnées de verdure. Idéal pour les occasions romantiques et les événements spéciaux.",
          price: 89.99,
          category: "shop",
          subcategory: "fleurs",
          imageUrl: "https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400&h=300&fit=crop",
          isCustomizable: true,
          isRentable: false,
          stockQuantity: 25,
          customizationOptions: {
            colors: ["rouge", "blanc", "rose", "jaune", "orange"],
            arrangements: ["classique", "moderne", "romantique"],
            message: true
          }
        },
        {
          _id: "mock-3",
          name: "Arche de Ballons Événementielle",
          description: "Arche de ballons professionnelle pour vos événements. Installation complète avec support métallique, ballons de qualité et service de montage inclus.",
          price: 299.99,
          category: "events",
          subcategory: "décoration",
          imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=300&fit=crop",
          isCustomizable: true,
          isRentable: true,
          stockQuantity: 5,
          dailyRentalPrice: 150.00,
          customizationOptions: {
            colors: ["thème personnalisé", "couleurs de votre choix"],
            tailles: ["3m", "4m", "5m"],
            styles: ["classique", "moderne", "fantaisie"]
          }
        },
        {
          _id: "mock-4",
          name: "Pack Décoration Mariage Complet",
          description: "Pack complet de décoration pour mariage incluant : guirlandes, photobooth, centre de table, accessoires photo et service de décoration personnalisée.",
          price: 599.99,
          category: "events",
          subcategory: "mariage",
          imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop",
          isCustomizable: true,
          isRentable: true,
          stockQuantity: 3,
          dailyRentalPrice: 250.00,
          customizationOptions: {
            thèmes: ["romantique", "moderne", "vintage", "bohème", "élégant"],
            couleurs: ["personnalisées selon vos goûts"],
            services: ["installation", "démontage", "coordination"]
          }
        },
        {
          _id: "mock-5",
          name: "Éclairage LED Professionnel",
          description: "Kit d'éclairage LED professionnel pour événements. Inclut projecteurs, spots colorés, contrôleur DMX et service d'installation technique.",
          price: 799.99,
          category: "rent",
          subcategory: "éclairage",
          imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop",
          isCustomizable: false,
          isRentable: true,
          stockQuantity: 8,
          dailyRentalPrice: 120.00
        }
      ];
      
      const filteredProducts = category 
        ? mockProducts.filter(p => p.category === category)
        : mockProducts;
        
      console.log(`✅ Returning ${filteredProducts.length} mock products`);
      res.json(filteredProducts);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      
      // Check if it's a database connection error
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
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
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

  const httpServer = createServer(app);
  return httpServer;
}
