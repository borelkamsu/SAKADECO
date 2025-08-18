import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import Order from '../models/Order';
import emailService from '../services/emailService';
import { Product } from '../models/Product';

const router = Router();

// Vérifier si Stripe est configuré
const isStripeConfigured = process.env.STRIPE_SECRET_KEY && 
                          process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key' &&
                          process.env.STRIPE_SECRET_KEY.length > 0;

// Initialiser Stripe seulement si configuré
let stripe: Stripe | null = null;
if (isStripeConfigured) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia'
    });
    console.log('✅ Stripe initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de Stripe:', error);
    stripe = null;
  }
} else {
  console.log('⚠️  Stripe non configuré - les paiements ne fonctionneront pas');
}

// Créer une session de paiement Stripe
router.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    // Vérifier si Stripe est configuré
    if (!stripe) {
      return res.status(503).json({ 
        message: 'Service de paiement temporairement indisponible. Veuillez réessayer plus tard.' 
      });
    }

    const { items, shippingAddress, billingAddress, isRental } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Aucun article dans le panier' });
    }

    // Calculer le total
    let subtotal = 0;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Produit ${item.productId} non trouvé` });
      }

      let price = product.price;
      let description = product.name;

      if (isRental && product.isRentable && product.dailyRentalPrice) {
        price = product.dailyRentalPrice * item.rentalDays;
        description = `${product.name} (Location - ${item.rentalDays} jour(s))`;
      }

      subtotal += price * item.quantity;

      // Préparer l'image pour Stripe - Stripe nécessite des URLs HTTPS valides
      let imageUrl = null;
      if (product.mainImageUrl) {
        if (product.mainImageUrl.startsWith('http')) {
          imageUrl = product.mainImageUrl;
        } else if (product.mainImageUrl.startsWith('/uploads/')) {
          // Pour le développement local, on peut utiliser une image par défaut
          // ou une image HTTPS publique
          imageUrl = 'https://via.placeholder.com/300x300/cccccc/666666?text=Produit';
        }
      }

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: description,
            images: imageUrl ? [imageUrl] : [],
          },
          unit_amount: Math.round(price * 100), // Stripe utilise les centimes
        },
        quantity: item.quantity,
      });
    }

    const tax = subtotal * 0.20; // TVA 20%
    const shipping = 0; // Frais de livraison gratuits pour l'instant
    const total = subtotal + tax + shipping;

    // Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment/cancel`,
      metadata: {
        isRental: isRental ? 'true' : 'false',
        itemsCount: items.length.toString(),
      },
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'CA'],
      },
      customer_email: req.body.customerEmail,
    });

    // Créer la commande en base de données
    const order = new Order({
      user: req.body.userId || null,
      items: items.map((item: any) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
        isRental: isRental,
        rentalStartDate: item.rentalStartDate,
        rentalEndDate: item.rentalEndDate,
        rentalDays: item.rentalDays,
        customizations: item.customizations,
        customMessage: item.customMessage,
      })),
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'stripe',
      stripeSessionId: session.id,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      billingAddress,
      isRental,
    });

    await order.save();

    res.json({
      sessionId: session.id,
      url: session.url,
      orderId: order._id,
    });
  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la session de paiement' });
  }
});

// Webhook Stripe pour confirmer les paiements
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret!);
  } catch (err) {
    console.error('Erreur webhook:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Mettre à jour la commande
        const order = await Order.findOne({ stripeSessionId: session.id });
        if (order) {
          order.status = 'paid';
          order.paymentStatus = 'paid';
          order.stripePaymentIntentId = session.payment_intent as string;
          await order.save();
          
          console.log(`Commande ${order._id} marquée comme payée`);
          
          // Envoyer automatiquement la facture par email
          try {
            const invoiceData = {
              orderNumber: order.orderNumber || order._id.toString(),
              user: {
                email: order.user?.email || 'client@example.com',
                firstName: order.shippingAddress?.firstName,
                lastName: order.shippingAddress?.lastName
              },
              items: order.items.map(item => ({
                product: {
                  name: item.product?.name || 'Produit',
                  price: item.price
                },
                quantity: item.quantity,
                price: item.price
              })),
              subtotal: order.subtotal,
              tax: order.tax,
              shipping: order.shipping,
              total: order.total,
              shippingAddress: order.shippingAddress,
              billingAddress: order.billingAddress,
              createdAt: order.createdAt.toISOString()
            };
            
                         // Envoyer l'email de confirmation et la facture
             await emailService.sendOrderConfirmationEmail(invoiceData);
             await emailService.sendInvoiceEmail(invoiceData);
             
             // Envoyer notification à l'admin
             await emailService.sendAdminNotificationEmail(invoiceData);
            
            console.log(`✅ Facture envoyée automatiquement pour la commande ${order._id}`);
          } catch (emailError) {
            console.error('❌ Erreur envoi facture automatique:', emailError);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Marquer la commande comme échouée
        const failedOrder = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
        if (failedOrder) {
          failedOrder.paymentStatus = 'failed';
          await failedOrder.save();
          
          console.log(`Paiement échoué pour la commande ${failedOrder._id}`);
        }
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erreur traitement webhook:', error);
    res.status(500).json({ message: 'Erreur traitement webhook' });
  }
});

// Récupérer les commandes d'un utilisateur
router.get('/orders/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer une commande spécifique
router.get('/orders/detail/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('items.product')
      .populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.json(order);
  } catch (error) {
    console.error('Erreur récupération commande:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
