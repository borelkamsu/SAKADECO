import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';
import { Product } from '../models/Product';
import Order from '../models/Order';
import { adminAuth, AdminRequest, requireSuperAdmin } from '../middleware/adminAuth';
import upload from '../middleware/upload';
import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                              process.env.CLOUDINARY_API_KEY && 
                              process.env.CLOUDINARY_API_SECRET &&
                              process.env.CLOUDINARY_CLOUD_NAME !== 'votre_cloud_name' &&
                              process.env.CLOUDINARY_API_KEY !== 'votre_api_key';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('☁️  Cloudinary configuré pour les uploads');
} else {
  console.log('⚠️  Cloudinary non configuré - utilisation des images locales');
}

const router = Router();

// Admin Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: admin.role },
      process.env.ADMIN_JWT_SECRET || 'admin-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Erreur de connexion admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get admin profile
router.get('/profile', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    res.json({
      admin: {
        id: req.admin._id,
        email: req.admin.email,
        name: req.admin.name,
        role: req.admin.role,
        lastLogin: req.admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Erreur récupération profil admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Create product
router.post('/products', adminAuth, upload.single('image'), async (req: AdminRequest, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subcategory,
      mainImageUrl,
      additionalImages,
      isCustomizable,
      isRentable,
      stockQuantity,
      dailyRentalPrice,
      customizationOptions
    } = req.body;

    let finalMainImageUrl = mainImageUrl;

    // Si un fichier a été uploadé, le traiter
    if (req.file) {
      console.log('📸 Fichier uploadé détecté:', req.file.originalname);
      
      if (isCloudinaryConfigured) {
        try {
          console.log('☁️  Upload vers Cloudinary...');
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'sakadeco/products',
            public_id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          });
          
          finalMainImageUrl = result.secure_url;
          console.log('✅ Image uploadée vers Cloudinary:', result.secure_url);
        } catch (cloudinaryError) {
          console.error('❌ Erreur upload Cloudinary:', cloudinaryError);
          // Fallback vers l'URL locale
          finalMainImageUrl = mainImageUrl || '/uploads/products/default-product.jpg';
        }
      } else {
        console.log('⚠️  Cloudinary non configuré, utilisation de l\'image locale');
        finalMainImageUrl = mainImageUrl || '/uploads/products/default-product.jpg';
      }
    } else {
      console.log('📸 Aucun fichier uploadé, utilisation de mainImageUrl fourni');
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      subcategory,
      mainImageUrl: finalMainImageUrl,
      additionalImages: additionalImages || [],
      isCustomizable: isCustomizable === 'true' || isCustomizable === true,
      isRentable: isRentable === 'true',
      stockQuantity: parseInt(stockQuantity) || 0,
      dailyRentalPrice: dailyRentalPrice ? parseFloat(dailyRentalPrice) : undefined,
      customizationOptions: customizationOptions || {}
    });

    await product.save();
    console.log('✅ Produit créé avec succès, image:', finalMainImageUrl);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Get all products (admin)
router.get('/products', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    
    const query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string) * 1)
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / parseInt(limit as string)),
      currentPage: parseInt(page as string),
      total
    });
  } catch (error) {
    console.error('Erreur récupération produits:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get single product (admin)
router.get('/products/:id', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Erreur récupération produit:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update product
router.put('/products/:id', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      subcategory,
      mainImageUrl,
      additionalImages,
      isCustomizable,
      isRentable,
      stockQuantity,
      dailyRentalPrice,
      customizationOptions
    } = req.body;

    const product = await Product.findByIdAndUpdate(id, {
      name,
      description,
      price: parseFloat(price),
      category,
      subcategory,
      mainImageUrl,
      additionalImages: additionalImages || [],
      isCustomizable: isCustomizable === 'true',
      isRentable: isRentable === 'true',
      stockQuantity: parseInt(stockQuantity) || 0,
      dailyRentalPrice: dailyRentalPrice ? parseFloat(dailyRentalPrice) : undefined,
      customizationOptions: customizationOptions || {}
    }, { new: true });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete product
router.delete('/products/:id', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression produit:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get dashboard stats
router.get('/dashboard', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({ stockQuantity: { $lt: 10 } });
    const totalAdmins = await Admin.countDocuments({ isActive: true });

    res.json({
      stats: {
        totalProducts,
        activeProducts,
        lowStockProducts,
        totalAdmins
      }
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Upload multiple images - simplified for development
router.post('/upload-images', (req: Request, res: Response, next) => {
  // Skip admin auth in development
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  Skipping admin auth for upload in development mode');
  }
  
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        message: 'Erreur lors de l\'upload des images',
        error: err.message 
      });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    console.log('Upload images request received');
    console.log('Files:', req.files);
    
    if (!req.files || req.files.length === 0) {
      console.log('No files provided');
      return res.status(400).json({ message: 'Aucune image fournie' });
    }
    
    const imageUrls = [];
    
    for (const file of req.files as Express.Multer.File[]) {
      console.log('📸 Traitement de l\'image:', file.originalname);
      
      if (isCloudinaryConfigured) {
        try {
          console.log('☁️  Upload vers Cloudinary...');
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'sakadeco/products',
            public_id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          });
          
          imageUrls.push(result.secure_url);
          console.log('✅ Image uploadée vers Cloudinary:', result.secure_url);
        } catch (cloudinaryError) {
          console.error('❌ Erreur upload Cloudinary pour', file.originalname, ':', cloudinaryError);
          // Fallback vers l'URL locale
          imageUrls.push(`/uploads/products/${file.filename}`);
        }
      } else {
        console.log('⚠️  Cloudinary non configuré, utilisation de l\'image locale');
        imageUrls.push(`/uploads/products/${file.filename}`);
      }
    }
    
    console.log('✅ Upload terminé, images:', imageUrls);
    
    res.json({
      message: 'Images uploadées avec succès',
      imageUrls,
      filenames: (req.files as Express.Multer.File[]).map(file => file.filename)
    });
  } catch (error) {
    console.error('Erreur upload images:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'upload des images',
      error: error.message 
    });
  }
});

// Test upload directory
router.get('/test-upload-dir', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const uploadDir = 'uploads/products/';
    const exists = fs.existsSync(uploadDir);
    const isDir = exists ? fs.statSync(uploadDir).isDirectory() : false;
    
    // Vérifier les permissions
    let permissions = 'unknown';
    if (exists) {
      try {
        fs.accessSync(uploadDir, fs.constants.R_OK | fs.constants.W_OK);
        permissions = 'read-write';
      } catch (err) {
        permissions = 'no-access';
      }
    }
    
    // Lister les fichiers avec leurs tailles
    let files = [];
    if (exists && isDir) {
      try {
        const fileList = fs.readdirSync(uploadDir);
        files = fileList.map(filename => {
          const filePath = path.join(uploadDir, filename);
          const stats = fs.statSync(filePath);
          return {
            name: filename,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        });
      } catch (err) {
        files = [{ error: err.message }];
      }
    }
    
    res.json({
      uploadDir,
      exists,
      isDirectory: isDir,
      permissions,
      currentDir: process.cwd(),
      files,
      absolutePath: path.resolve(uploadDir)
    });
  } catch (error) {
    console.error('Test upload dir error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Temporary route to create admin (remove in production)
router.post('/setup', async (req: Request, res: Response) => {
  try {
    const { secret } = req.body;
    
    // Simple security check
    if (secret !== 'sakadeco-setup-2024') {
      return res.status(401).json({ message: 'Secret invalide' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@sdk.com' });
    
    if (existingAdmin) {
      return res.json({ 
        message: 'Administrateur existe déjà',
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role
        }
      });
    }

    // Create new admin
    const admin = new Admin({
      email: 'admin@sdk.com',
      password: 'Admin123!',
      name: 'Administrateur SakaDeco',
      role: 'super_admin',
      isActive: true
    });

    await admin.save();

    res.json({
      message: 'Administrateur créé avec succès',
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Erreur création admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get all orders (admin)
router.get('/orders', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const orders = await Order.find({})
      .populate('items.product')
      .populate('user')
      .sort({ createdAt: -1 });

    res.json({
      orders: orders.map(order => ({
        _id: order._id,
        user: order.user,
        items: order.items,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        isRental: order.isRental,
        stripeSessionId: order.stripeSessionId,
        stripePaymentIntentId: order.stripePaymentIntentId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }))
    });
  } catch (error) {
    console.error('Erreur récupération commandes admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get order details (admin)
router.get('/orders/:orderId', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('items.product')
      .populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Erreur récupération commande admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update order status (admin)
router.put('/orders/:orderId/status', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.json({ 
      message: 'Statut de commande mis à jour',
      order: {
        _id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour statut commande:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Test image access
router.get('/test-image/:filename', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const filename = req.params.filename;
    const imagePath = path.join('uploads/products', filename);
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ 
        error: 'Image not found',
        path: imagePath,
        absolutePath: path.resolve(imagePath)
      });
    }
    
    const stats = fs.statSync(imagePath);
    
    res.json({
      filename,
      path: imagePath,
      absolutePath: path.resolve(imagePath),
      size: stats.size,
      exists: true,
      accessible: true
    });
  } catch (error) {
    console.error('Test image access error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
