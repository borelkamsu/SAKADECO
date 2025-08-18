import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Search, Filter, ShoppingCart, Calendar } from 'lucide-react';
import ImageWithFallback from '../components/ImageWithFallback';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  dailyRentalPrice?: number;
  category: string;
  mainImageUrl: string;
  stockQuantity: number;
  isForSale: boolean;
  isForRent: boolean;
  isCustomizable: boolean;
  customizationOptions?: Map<string, string[]>;
}

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('sale');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les produits selon l'onglet actif
  const getFilteredProducts = () => {
    let filtered = products;

    // Filtrer par type (vente ou location)
    if (activeTab === 'sale') {
      filtered = filtered.filter(product => product.isForSale);
    } else if (activeTab === 'rent') {
      filtered = filtered.filter(product => product.isForRent);
    }

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    return filtered;
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Chargement des produits...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {activeTab === 'sale' ? 'Boutique' : 'SDK Rend'}
        </h1>
        <p className="text-gray-600">
          {activeTab === 'sale' 
            ? 'Découvrez nos produits disponibles à la vente' 
            : 'Louez nos produits pour vos événements'
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="sale" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Boutique
          </TabsTrigger>
          <TabsTrigger value="rent" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            SDK Rend
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sale" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'Toutes les catégories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getFilteredProducts().map((product) => (
              <Card key={product._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative">
                    <ImageWithFallback
                      src={product.mainImageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {product.isCustomizable && (
                      <Badge className="absolute top-2 right-2 bg-blue-500">
                        Personnalisable
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-green-600">
                      {product.price.toFixed(2)}€
                    </span>
                    <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"}>
                      {product.stockQuantity > 0 ? 'En stock' : 'Rupture'}
                    </Badge>
                  </div>
                  <Link href={`/product/${product._id.toString()}`}>
                    <Button className="w-full" disabled={product.stockQuantity === 0}>
                      Voir le produit
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rent" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un produit à louer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'Toutes les catégories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getFilteredProducts().map((product) => (
              <Card key={product._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative">
                    <ImageWithFallback
                      src={product.mainImageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {product.isCustomizable && (
                      <Badge className="absolute top-2 right-2 bg-blue-500">
                        Personnalisable
                      </Badge>
                    )}
                    <Badge className="absolute top-2 left-2 bg-orange-500">
                      Location
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-orange-600">
                      {product.dailyRentalPrice?.toFixed(2) || '0.00'}€/jour
                    </span>
                    <Badge variant="default" className="bg-orange-500">
                      Disponible
                    </Badge>
                  </div>
                  <Link href={`/rental/${product._id.toString()}`}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      Louer ce produit
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Shop;
