import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Plus } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";

// Define Product type for frontend
interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  subcategory?: string;
  mainImageUrl: string;
  additionalImages: string[];
  isCustomizable: boolean;
  isRentable: boolean;
  stockQuantity: number;
  dailyRentalPrice?: number;
  customizationOptions?: {
    [key: string]: {
      type: 'dropdown' | 'checkbox' | 'text' | 'textarea';
      label: string;
      required: boolean;
      options?: string[];
      placeholder?: string;
      maxLength?: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export default function Shop() {
  const [, setLocation] = useLocation();
  const { data: allProducts, isLoading, error } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  // Filter products for shop category
  const products = allProducts?.filter(product => product.category === "shop") || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-4 border-skd-shop border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600">Erreur lors du chargement des produits</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="py-20 bg-gradient-to-br from-skd-shop/10 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-skd-shop rounded-full mb-6">
              <ShoppingBag className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-playfair font-bold text-gray-800 mb-4">SKD Shop</h1>
            <p className="text-xl text-gray-600 mb-2">Vente de ballons, fleurs & accessoires</p>
            <p className="text-lg font-playfair text-skd-shop italic font-semibold">« Offrez la touche qui fait sourire »</p>
            <p className="text-base text-gray-600 mt-2">Des petits détails qui font de grands effets</p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-playfair font-semibold text-gray-800">Nos Produits</h2>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-skd-shop text-skd-shop">
                {products.length} produits disponibles
              </Badge>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun produit disponible</h3>
              <p className="text-gray-500">Nos produits arrivent bientôt !</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: Product) => (
                <Card 
                  key={product._id} 
                  className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-skd-shop/30 cursor-pointer"
                  onClick={() => setLocation(`/shop/${product._id}`)}
                >
                  <CardHeader className="p-0">
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <ImageWithFallback 
                        src={product.mainImageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        width={400}
                        height={400}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </CardTitle>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-skd-shop">
                        {product.price.toFixed(2)}€
                      </span>
                      <div className="flex space-x-1">
                        {product.isCustomizable && (
                          <Badge variant="secondary" className="text-xs">
                            Personnalisable
                          </Badge>
                        )}
                        {product.isRentable && (
                          <Badge variant="outline" className="text-xs">
                            Location
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {product.stockQuantity > 0 
                          ? `${product.stockQuantity} en stock` 
                          : 'Rupture de stock'
                        }
                      </span>
                      <Button 
                        size="sm" 
                        className="bg-skd-shop hover:bg-skd-shop/90 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/shop/${product._id}`);
                        }}
                      >
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        Voir détails
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-playfair font-semibold text-gray-800 mb-8 text-center">Nos Catégories</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6 border-2 border-skd-shop/20 hover:border-skd-shop/50 transition-colors">
              <div className="w-16 h-16 bg-skd-shop/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎈</span>
              </div>
              <h4 className="font-playfair font-semibold text-gray-800 mb-3">Ballons Personnalisés</h4>
              <p className="text-gray-600 mb-4">Latex, mylar, bulles avec messages sur-mesure</p>
              <p className="text-sm text-gray-500">À partir de 15€</p>
            </Card>
            
            <Card className="text-center p-6 border-2 border-skd-shop/20 hover:border-skd-shop/50 transition-colors">
              <div className="w-16 h-16 bg-skd-shop/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌸</span>
              </div>
              <h4 className="font-playfair font-semibold text-gray-800 mb-3">Fleurs & Compositions</h4>
              <p className="text-gray-600 mb-4">Artificielles & naturelles pour tous événements</p>
              <p className="text-sm text-gray-500">À partir de 25€</p>
            </Card>
            
            <Card className="text-center p-6 border-2 border-skd-shop/20 hover:border-skd-shop/50 transition-colors">
              <div className="w-16 h-16 bg-skd-shop/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h4 className="font-playfair font-semibold text-gray-800 mb-3">Objets Déco</h4>
              <p className="text-gray-600 mb-4">Vases, lanternes, guirlandes pour la maison</p>
              <p className="text-sm text-gray-500">À partir de 10€</p>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
