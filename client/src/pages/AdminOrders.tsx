import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  Filter,
  ArrowLeft,
  Calendar,
  User,
  Package,
  CreditCard
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    product: {
      name: string;
      price: number;
      imageUrl: string;
    };
    quantity: number;
    customizationOptions?: {
      [key: string]: string;
    };
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLocation("/admin/login");
      return;
    }
    fetchOrders();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");
             const params = new URLSearchParams({
         page: currentPage.toString(),
         limit: "10",
         ...(searchTerm && { search: searchTerm }),
         ...(statusFilter && statusFilter !== "all" && { status: statusFilter })
       });

      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur récupération commandes");
      }

      const data = await response.json();
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Erreur récupération commandes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statuses = {
      pending: "En attente",
      confirmed: "Confirmée",
      processing: "En traitement",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée"
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusLabel = (status: string) => {
    const statuses = {
      pending: "En attente",
      paid: "Payé",
      failed: "Échoué",
      refunded: "Remboursé"
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-orange-100 text-orange-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/admin/dashboard")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour</span>
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-gold to-yellow-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Gestion des Commandes
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtres et Recherche</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="all">Tous les statuts</SelectItem>
                   <SelectItem value="pending">En attente</SelectItem>
                   <SelectItem value="confirmed">Confirmée</SelectItem>
                   <SelectItem value="processing">En traitement</SelectItem>
                   <SelectItem value="shipped">Expédiée</SelectItem>
                   <SelectItem value="delivered">Livrée</SelectItem>
                   <SelectItem value="cancelled">Annulée</SelectItem>
                 </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {orders.length} commande(s) trouvée(s)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Commande #{order.orderNumber}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{order.customer.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4" />
                        <span>{order.items.length} article(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="text-xl font-bold text-gold">
                      {formatPrice(order.totalAmount)}
                    </span>
                    <div className="flex space-x-2">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23f3f4f6'/%3E%3Ctext x='24' y='24' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='10'%3EImage%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">
                            Quantité: {item.quantity} × {formatPrice(item.product.price)}
                          </p>
                          {item.customizationOptions && Object.keys(item.customizationOptions).length > 0 && (
                            <div className="mt-1">
                              {Object.entries(item.customizationOptions).map(([key, value]) => (
                                <span key={key} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-medium">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informations client</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Nom:</strong> {order.customer.name}</p>
                        <p><strong>Email:</strong> {order.customer.email}</p>
                        {order.customer.phone && (
                          <p><strong>Téléphone:</strong> {order.customer.phone}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Adresse de livraison</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/admin/orders/${order._id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir les détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}

        {orders.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune commande trouvée
            </h3>
            <p className="text-gray-600 mb-4">
                             {searchTerm || (statusFilter && statusFilter !== "all")
                 ? "Aucune commande ne correspond à vos critères de recherche."
                 : "Vous n'avez pas encore de commandes."
               }
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
