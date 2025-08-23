import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51RwMYOR0o3iJkkS6m6QdutPepHoHevnGVfr771nNV25WXrE74hpb2vvPKpEiL7EHTQYtJ2rX71rbGxnXaLnheUjP00dz8vDKzm');

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  isRental: boolean;
  customizations?: any;
  customMessage?: string;
}

const CartPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    phone: ''
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const removeItem = (productId: string) => {
    const updatedItems = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const subtotal = cartItems.reduce((total, item) => {
    let itemTotal = item.price * item.quantity;
    
    // Ajouter les prix de personnalisation
    if (item.customizations) {
      Object.values(item.customizations).forEach((customization: any) => {
        if (typeof customization === 'object' && customization.price) {
          itemTotal += customization.price * item.quantity;
        }
      });
    }
    
    return total + itemTotal;
  }, 0);
  const tax = subtotal * 0.20; // TVA 20%
  const shipping = 0; // Frais de livraison gratuits
  const total = subtotal + tax + shipping;

  const handleCheckout = async () => {
    if (!customerEmail) {
      alert('Veuillez entrer votre email');
      return;
    }

    if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      alert('Veuillez remplir toutes les informations de livraison');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Envoi des données de paiement:', {
        items: cartItems,
        customerEmail,
        shippingAddress,
        billingAddress: shippingAddress,
        isRental: false
      });

      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cartItems, 
          customerEmail, 
          shippingAddress, 
          billingAddress: shippingAddress, 
          isRental: false 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur serveur:', errorData);
        throw new Error(errorData.message || 'Erreur lors de la création de la session de paiement');
      }

      const { url } = await response.json();
      console.log('Redirection vers Stripe:', url);
      
      // Rediriger vers Stripe
      window.location.href = url;
    } catch (error) {
      console.error('Erreur checkout:', error);
      alert(`Erreur lors du processus de paiement: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <ShoppingCart className="mx-auto h-24 w-24 text-gray-400 mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
              <p className="text-gray-600 mb-8">Découvrez nos produits et commencez vos achats !</p>
              <Button 
                onClick={() => setLocation('/shop')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Continuer les achats
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/shop')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continuer les achats</span>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Votre Panier</h1>
            <Button 
              variant="outline" 
              onClick={clearCart}
              className="text-red-600 hover:text-red-700"
            >
              Vider le panier
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Articles ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCAyMEMyOS4wNTQ5IDIwIDIwIDI5LjA1NDkgMjAgNDBDMjAgNTAuOTQ1MSAyOS4wNTQ5IDYwIDQwIDYwQzUwLjk0NTEgNjAgNjAgNTAuOTQ1MSA2MCA0MEM2MCAyOS4wNTQ5IDUwLjk0NTEgMjAgNDAgMjBaIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCAyNEMzMS4xNjM0IDI0IDI0IDMxLjE2MzQgMjQgNDBDMjQgNDguODM2NiAzMS4xNjM0IDU2IDQwIDU2QzQ4LjgzNjYgNTYgNTYgNDguODM2NiA1NiA0MEM1NiAzMS4xNjM0IDQ4LjgzNjYgMjQgNDAgMjRaIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-gray-600">
                          {(() => {
                            let totalPrice = item.price;
                            if (item.customizations) {
                              Object.values(item.customizations).forEach((customization: any) => {
                                if (typeof customization === 'object' && customization.price) {
                                  totalPrice += customization.price;
                                }
                              });
                            }
                            return `${totalPrice.toFixed(2)}€`;
                          })()}
                        </p>
                        {item.customizations && Object.keys(item.customizations).length > 0 && (
                          <div className="text-sm text-gray-500 mt-1">
                            {Object.entries(item.customizations).map(([key, value]) => {
                              // Gérer les différents types de personnalisations
                              if (typeof value === 'string') {
                                return <div key={key}>{key}: {value}</div>;
                              } else if (typeof value === 'object' && value !== null) {
                                // Pour les objets de personnalisation {type, value, price} ou {type: 'both', textValue, imageValue, price}
                                const customization = value as any;
                                
                                if (customization.type === 'both') {
                                  return (
                                    <div key={key} className="space-y-1">
                                      {customization.textValue && (
                                        <div className="flex justify-between items-center">
                                          <span>{key} (texte): {customization.textValue}</span>
                                        </div>
                                      )}
                                      {customization.imageValue && (
                                        <div className="flex justify-between items-center">
                                          <span>{key} (image): ✓ Image fournie</span>
                                        </div>
                                      )}
                                      {customization.price > 0 && (
                                        <div className="text-blue-600 font-medium text-right">
                                          +{customization.price.toFixed(2)}€
                                        </div>
                                      )}
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div key={key} className="flex justify-between items-center">
                                      <span>{key}: {customization.value}</span>
                                      {customization.price > 0 && (
                                        <span className="text-blue-600 font-medium">
                                          +{customization.price.toFixed(2)}€
                                        </span>
                                      )}
                                    </div>
                                  );
                                }
                              } else if (Array.isArray(value)) {
                                return <div key={key}>{key}: {value.join(', ')}</div>;
                              }
                              return <div key={key}>{key}: {String(value)}</div>;
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {(() => {
                            let totalPrice = item.price;
                            if (item.customizations) {
                              Object.values(item.customizations).forEach((customization: any) => {
                                if (typeof customization === 'object' && customization.price) {
                                  totalPrice += customization.price;
                                }
                              });
                            }
                            return `${(totalPrice * item.quantity).toFixed(2)}€`;
                          })()}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA (20%)</span>
                    <span>{tax.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span>Gratuit</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{total.toFixed(2)}€</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-green-600">📧 Informations client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="border-2 focus:border-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Votre email sera utilisé pour la confirmation de commande</p>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-green-600">🚚 Adresse de livraison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={shippingAddress.firstName}
                        onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={shippingAddress.lastName}
                        onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Adresse *</Label>
                    <Input
                      id="address"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Code postal *</Label>
                      <Input
                        id="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Checkout Button */}
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">💳 Informations de paiement</h3>
                  <p className="text-sm text-yellow-700">
                    Après avoir cliqué sur "Payer", vous serez redirigé vers Stripe pour saisir vos informations de paiement de manière sécurisée.
                  </p>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  disabled={isLoading || cartItems.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 text-xl shadow-lg"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">💳</span>
                      Payer {total.toFixed(2)}€
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Paiement sécurisé par Stripe • Vos données sont protégées
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
