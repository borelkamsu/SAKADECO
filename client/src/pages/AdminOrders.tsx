import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  Package, 
  CreditCard, 
  User, 
  Calendar,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import Layout from '@/components/Layout';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    mainImageUrl: string;
  };
  quantity: number;
  price: number;
  isRental: boolean;
  customizations?: any;
}

interface Order {
  _id: string;
  user?: {
    _id: string;
    email: string;
    name: string;
  };
  items: OrderItem[];
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
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
    phone: string;
  };
  isRental: boolean;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminOrders: React.FC = () => {
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setLocation('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commandes');
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Erreur récupération commandes:', error);
      alert('Erreur lors de la récupération des commandes');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    try {
      setUpdatingStatus(orderId);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, paymentStatus })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      // Mettre à jour la liste des commandes
      await fetchOrders();
      alert('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.items.some(item => item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
              <p className="text-gray-600 mt-2">Gérez toutes les commandes de vos clients</p>
            </div>
            <Button onClick={fetchOrders} className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filtres</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Recherche</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Rechercher par ID, nom, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="paid">Payé</SelectItem>
                      <SelectItem value="shipped">Expédié</SelectItem>
                      <SelectItem value="delivered">Livré</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                      <SelectItem value="refunded">Remboursé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentStatus">Statut Paiement</Label>
                  <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les paiements</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="paid">Payé</SelectItem>
                      <SelectItem value="failed">Échoué</SelectItem>
                      <SelectItem value="refunded">Remboursé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPaymentStatusFilter('all');
                    }}
                    className="w-full"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Commandes ({filteredOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande trouvée</h3>
                  <p className="text-gray-600">Aucune commande ne correspond à vos critères de recherche.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Commande #{order._id.slice(-8)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status === 'pending' && 'En attente'}
                            {order.status === 'paid' && 'Payé'}
                            {order.status === 'shipped' && 'Expédié'}
                            {order.status === 'delivered' && 'Livré'}
                            {order.status === 'cancelled' && 'Annulé'}
                            {order.status === 'refunded' && 'Remboursé'}
                          </Badge>
                          
                          <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                            {order.paymentStatus === 'pending' && 'Paiement en attente'}
                            {order.paymentStatus === 'paid' && 'Paiement effectué'}
                            {order.paymentStatus === 'failed' && 'Paiement échoué'}
                            {order.paymentStatus === 'refunded' && 'Paiement remboursé'}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Client</h4>
                          <div className="text-sm text-gray-600">
                            <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                            <p>{order.shippingAddress.phone}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Articles</h4>
                          <div className="space-y-1">
                            {order.items.map((item, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                <p>{item.product?.name || 'Produit supprimé'} x{item.quantity}</p>
                                <p className="text-xs text-gray-500">
                                  {item.isRental ? 'Location' : 'Achat'} - {item.price.toFixed(2)}€
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Total</h4>
                          <div className="text-sm text-gray-600">
                            <p>Sous-total: {order.subtotal.toFixed(2)}€</p>
                            <p>TVA: {order.tax.toFixed(2)}€</p>
                            <p>Livraison: {order.shipping.toFixed(2)}€</p>
                            <p className="font-semibold text-gray-900">
                              Total: {order.total.toFixed(2)}€
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Détails
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order._id, value)}
                            disabled={updatingStatus === order._id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="paid">Payé</SelectItem>
                              <SelectItem value="shipped">Expédié</SelectItem>
                              <SelectItem value="delivered">Livré</SelectItem>
                              <SelectItem value="cancelled">Annulé</SelectItem>
                              <SelectItem value="refunded">Remboursé</SelectItem>
                            </SelectContent>
                          </Select>

                          {updatingStatus === order._id && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Détails de la commande #{selectedOrder._id.slice(-8)}
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Fermer
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Informations client</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Nom:</strong> {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                      <p><strong>Adresse:</strong> {selectedOrder.shippingAddress.address}</p>
                      <p><strong>Ville:</strong> {selectedOrder.shippingAddress.postalCode} {selectedOrder.shippingAddress.city}</p>
                      <p><strong>Pays:</strong> {selectedOrder.shippingAddress.country}</p>
                      <p><strong>Téléphone:</strong> {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Informations commande</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Statut:</strong> 
                        <Badge className={`ml-2 ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </Badge>
                      </p>
                      <p><strong>Paiement:</strong> 
                        <Badge className={`ml-2 ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                          {selectedOrder.paymentStatus}
                        </Badge>
                      </p>
                      <p><strong>Méthode:</strong> {selectedOrder.paymentMethod}</p>
                      <p><strong>Type:</strong> {selectedOrder.isRental ? 'Location' : 'Achat'}</p>
                      <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Articles</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <img
                          src={item.product.mainImageUrl}
                          alt={item.product?.name || 'Produit supprimé'}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAxNkMyMy4xNjM0IDE2IDE2IDIzLjE2MzQgMTYgMzJDMTYgNDAuODM2NiAyMy4xNjM0IDQ4IDMyIDQ4QzQwLjgzNjYgNDggNDggNDAuODM2NiA0OCAzMkM0OCAyMy4xNjM0IDQwLjgzNjYgMTYgMzIgMTZaIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMyNS4zNzI2IDIwIDIwIDI1LjM3MjYgMjAgMzJDMjAgMzguNjI3NCAyNS4zNzI2IDQ0IDMyIDQ0QzM4LjYyNzQgNDQgNDQgMzguNjI3NCA0NCAzMkM0NCAyNS4zNzI2IDM4LjYyNzQgMjAgMzIgMjBaIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product?.name || 'Produit supprimé'}</h4>
                          <p className="text-sm text-gray-600">
                            Quantité: {item.quantity} | Prix: {item.price.toFixed(2)}€
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.isRental ? 'Location' : 'Achat'}
                          </p>
                          {item.customizations && Object.keys(item.customizations).length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {Object.entries(item.customizations).map(([key, value]) => (
                                <span key={key} className="mr-2">{key}: {value as string}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {(item.price * item.quantity).toFixed(2)}€
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sous-total:</span>
                      <span>{selectedOrder.subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TVA:</span>
                      <span>{selectedOrder.tax.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison:</span>
                      <span>{selectedOrder.shipping.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{selectedOrder.total.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminOrders;
