import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';
import { Product } from '../models/Product';
import { adminAuth, AdminRequest, requireSuperAdmin } from '../middleware/adminAuth';
import upload from '../middleware/upload';

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
router.post('/products', adminAuth, async (req: AdminRequest, res: Response) => {
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

    const product = new Product({
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
    });

    await product.save();
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

// Upload multiple images
router.post('/upload-images', adminAuth, (req: AdminRequest, res: Response, next) => {
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
}, async (req: AdminRequest, res: Response) => {
  try {
    console.log('Upload images request received');
    console.log('Files:', req.files);
    
    if (!req.files || req.files.length === 0) {
      console.log('No files provided');
      return res.status(400).json({ message: 'Aucune image fournie' });
    }
    
    const imageUrls = (req.files as Express.Multer.File[]).map(file => {
      console.log('File uploaded successfully:', file.filename);
      return `/uploads/products/${file.filename}`;
    });
    
    console.log('Image URLs:', imageUrls);
    
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
    
    res.json({
      uploadDir,
      exists,
      isDirectory: isDir,
      currentDir: process.cwd(),
      files: exists ? fs.readdirSync(uploadDir) : []
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

export default router;
