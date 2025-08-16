import nodemailer from 'nodemailer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface InvoiceData {
  orderNumber: string;
  user: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  items: Array<{
    product: {
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Configuration pour Gmail (vous pouvez changer pour un autre service)
    const emailConfig: EmailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true pour 465, false pour les autres ports
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      }
    };

    // Vérifier si les variables d'environnement sont configurées
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('⚠️  Configuration email manquante - les emails ne seront pas envoyés');
      return;
    }

    try {
      this.transporter = nodemailer.createTransporter(emailConfig);
      console.log('✅ Service email initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation service email:', error);
    }
  }

  private generateInvoiceHTML(invoice: InvoiceData): string {
    const itemsHTML = invoice.items.map(item => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; text-align: left;">
          <div style="font-weight: 500; color: #1f2937;">${item.product.name}</div>
        </td>
        <td style="padding: 12px; text-align: center; color: #6b7280;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; color: #6b7280;">${item.price.toFixed(2)}€</td>
        <td style="padding: 12px; text-align: right; font-weight: 500; color: #1f2937;">
          ${(item.price * item.quantity).toFixed(2)}€
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Facture SakaDeco - ${invoice.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-info { margin-bottom: 30px; }
          .invoice-details { margin-bottom: 30px; }
          .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .address { flex: 1; margin: 0 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background-color: #f9fafb; padding: 12px; text-align: left; font-weight: bold; }
          .totals { text-align: right; margin-bottom: 30px; }
          .total-row { border-top: 2px solid #e5e7eb; padding-top: 10px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #059669; margin-bottom: 10px;">SakaDeco</h1>
            <p style="color: #6b7280; margin: 0;">Décoration et aménagement</p>
          </div>

          <div class="company-info">
            <p style="margin: 5px 0; color: #6b7280;">123 Rue de la Décoration</p>
            <p style="margin: 5px 0; color: #6b7280;">75001 Paris, France</p>
            <p style="margin: 5px 0; color: #6b7280;">contact@sakadeco.com</p>
          </div>

          <div class="invoice-details">
            <h2 style="color: #1f2937; margin-bottom: 20px;">FACTURE</h2>
            <p style="margin: 5px 0; color: #6b7280;"><strong>N° ${invoice.orderNumber}</strong></p>
            <p style="margin: 5px 0; color: #6b7280;">
              Date: ${format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>

          <div class="addresses">
            <div class="address">
              <h3 style="color: #1f2937; margin-bottom: 10px;">Adresse de facturation</h3>
              <p style="margin: 5px 0; color: #6b7280;">
                ${invoice.billingAddress.firstName} ${invoice.billingAddress.lastName}
              </p>
              <p style="margin: 5px 0; color: #6b7280;">${invoice.billingAddress.address}</p>
              <p style="margin: 5px 0; color: #6b7280;">
                ${invoice.billingAddress.postalCode} ${invoice.billingAddress.city}
              </p>
              <p style="margin: 5px 0; color: #6b7280;">${invoice.billingAddress.country}</p>
              <p style="margin: 5px 0; color: #6b7280;">${invoice.user.email}</p>
            </div>
            <div class="address">
              <h3 style="color: #1f2937; margin-bottom: 10px;">Adresse de livraison</h3>
              <p style="margin: 5px 0; color: #6b7280;">
                ${invoice.shippingAddress.firstName} ${invoice.shippingAddress.lastName}
              </p>
              <p style="margin: 5px 0; color: #6b7280;">${invoice.shippingAddress.address}</p>
              <p style="margin: 5px 0; color: #6b7280;">
                ${invoice.shippingAddress.postalCode} ${invoice.shippingAddress.city}
              </p>
              <p style="margin: 5px 0; color: #6b7280;">${invoice.shippingAddress.country}</p>
            </div>
          </div>

          <h3 style="color: #1f2937; margin-bottom: 15px;">Détails de la commande</h3>
          <table>
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: left;">Produit</th>
                <th style="padding: 12px; text-align: center;">Quantité</th>
                <th style="padding: 12px; text-align: right;">Prix unitaire</th>
                <th style="padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="totals">
            <p style="margin: 5px 0;"><span style="color: #6b7280;">Sous-total:</span> 
              <span style="font-weight: 500; margin-left: 20px;">${invoice.subtotal.toFixed(2)}€</span>
            </p>
            <p style="margin: 5px 0;"><span style="color: #6b7280;">TVA (20%):</span> 
              <span style="font-weight: 500; margin-left: 20px;">${invoice.tax.toFixed(2)}€</span>
            </p>
            <p style="margin: 5px 0;"><span style="color: #6b7280;">Livraison:</span> 
              <span style="font-weight: 500; margin-left: 20px;">${invoice.shipping.toFixed(2)}€</span>
            </p>
            <div class="total-row">
              <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #1f2937;">
                <span>Total:</span> 
                <span style="margin-left: 20px;">${invoice.total.toFixed(2)}€</span>
              </p>
            </div>
          </div>

          <div class="footer">
            <p style="margin-bottom: 10px; color: #6b7280;">Merci pour votre confiance !</p>
            <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">
              Pour toute question, contactez-nous à contact@sakadeco.com
            </p>
            <p style="margin: 5px 0; font-size: 12px; color: #9ca3af;">
              Facture générée le ${format(new Date(invoice.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendInvoiceEmail(invoice: InvoiceData): Promise<boolean> {
    if (!this.transporter) {
      console.warn('⚠️  Service email non configuré - email non envoyé');
      return false;
    }

    try {
      const mailOptions = {
        from: `"SakaDeco" <${process.env.EMAIL_USER}>`,
        to: invoice.user.email,
        subject: `Facture SakaDeco - Commande ${invoice.orderNumber}`,
        html: this.generateInvoiceHTML(invoice),
        attachments: [
          {
            filename: `facture-${invoice.orderNumber}.html`,
            content: this.generateInvoiceHTML(invoice)
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de facture envoyé:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi email facture:', error);
      return false;
    }
  }

  async sendOrderConfirmationEmail(invoice: InvoiceData): Promise<boolean> {
    if (!this.transporter) {
      console.warn('⚠️  Service email non configuré - email non envoyé');
      return false;
    }

    try {
      const mailOptions = {
        from: `"SakaDeco" <${process.env.EMAIL_USER}>`,
        to: invoice.user.email,
        subject: `Confirmation de commande - ${invoice.orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmation de commande</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .success { color: #059669; font-size: 24px; margin-bottom: 10px; }
              .order-details { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="success">✅</div>
                <h1 style="color: #059669;">Commande confirmée !</h1>
              </div>
              
              <p>Bonjour ${invoice.user.firstName || 'Client'},</p>
              
              <p>Nous vous remercions pour votre commande. Votre paiement a été traité avec succès.</p>
              
              <div class="order-details">
                <h3>Détails de la commande</h3>
                <p><strong>Numéro de commande:</strong> ${invoice.orderNumber}</p>
                <p><strong>Date:</strong> ${format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: fr })}</p>
                <p><strong>Total:</strong> ${invoice.total.toFixed(2)}€</p>
              </div>
              
              <p>Vous pouvez consulter votre facture en cliquant sur le bouton ci-dessous :</p>
              
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/invoice/${invoice.orderNumber}" 
                 class="button">Voir ma facture</a>
              
              <p>Nous vous tiendrons informé du statut de votre commande.</p>
              
              <p>Cordialement,<br>L'équipe SakaDeco</p>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de confirmation envoyé:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi email confirmation:', error);
      return false;
    }
  }
}

export default new EmailService();
