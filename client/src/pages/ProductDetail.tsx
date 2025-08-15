import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  Package, 
  Palette,
  MessageSquare,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";

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

interface CustomizationSelection {
  [key: string]: string[] | string | boolean;
}

export default function ProductDetail() {
  const [location, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState<CustomizationSelection>({});
  const [customMessage, setCustomMessage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Extract product ID from URL
  const productId = location.split('/')[2]; // /shop/{id}

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      return response.json();
    },
    enabled: !!productId,
  });

  const handleCustomizationChange = (optionType: string, value: string | boolean, isMultiple = false) => {
    setCustomizations(prev => {
      if (isMultiple) {
        const currentValues = (prev[optionType] as string[]) || [];
        const newValues = currentValues.includes(value as string)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value as string];
        return { ...prev, [optionType]: newValues };
      } else {
        return { ...prev, [optionType]: value };
      }
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    
    try {
      // Here you would typically add to cart logic
      console.log('Adding to cart:', {
        productId: product._id,
        quantity,
        customizations,
        customMessage
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Produit ajouté au panier !');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderCustomizationOption = (optionKey: string, option: any) => {
    const { type, label, required, options, placeholder, maxLength } = option;
    const currentValue = customizations[optionKey];

    switch (type) {
      case 'checkbox':
        return (
          <div key={optionKey} className="flex items-center space-x-2">
            <Checkbox
              id={optionKey}
              checked={currentValue as boolean || false}
              onCheckedChange={(checked) => handleCustomizationChange(optionKey, checked)}
            />
            <Label htmlFor={optionKey} className="text-sm font-medium">
              {label}
            </Label>
            {required && <span className="text-red-500">*</span>}
          </div>
        );

      case 'dropdown':
        return (
          <div key={optionKey} className="space-y-2">
            <Label className="text-sm font-medium">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={currentValue as string || ""}
              onValueChange={(value) => handleCustomizationChange(optionKey, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Choisir ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((value: string) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'text':
        return (
          <div key={optionKey} className="space-y-2">
            <Label className="text-sm font-medium">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              placeholder={placeholder}
              maxLength={maxLength}
              value={currentValue as string || ""}
              onChange={(e) => handleCustomizationChange(optionKey, e.target.value)}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={optionKey} className="space-y-2">
            <Label className="text-sm font-medium">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              placeholder={placeholder}
              maxLength={maxLength}
              value={currentValue as string || ""}
              onChange={(e) => handleCustomizationChange(optionKey, e.target.value)}
              rows={3}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const allImages = product ? [product.mainImageUrl, ...product.additionalImages] : [];
  const currentImage = allImages[selectedImageIndex];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-4 border-skd-shop border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600">Produit non trouvé</p>
          <Button onClick={() => setLocation("/shop")} className="mt-4">
            Retour à la boutique
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="py-8 bg-gradient-to-br from-skd-shop/10 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/shop")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la boutique
          </Button>
        </div>
      </section>

      {/* Product Detail */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square overflow-hidden rounded-lg border-2 border-gray-200 relative">
                <ImageWithFallback 
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  width={600}
                  height={600}
                />
                
                {/* Navigation arrows */}
                {allImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                        index === selectedImageIndex 
                          ? 'border-skd-shop' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={150}
                        height={150}
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {product.isCustomizable && (
                <Alert>
                  <Palette className="h-4 w-4" />
                  <AlertDescription>
                    Ce produit est personnalisable ! Choisissez vos options ci-dessous.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="mb-2">
                  {product.subcategory}
                </Badge>
                <h1 className="text-3xl font-playfair font-bold text-gray-800 mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-600 mb-4">
                  {product.description}
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-skd-shop">
                    {product.price.toFixed(2)}€
                  </span>
                  {product.isRentable && product.dailyRentalPrice && (
                    <span className="text-sm text-gray-500">
                      ou {product.dailyRentalPrice.toFixed(2)}€/jour
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Info */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Package className="w-4 h-4" />
                <span>
                  {product.stockQuantity > 0 
                    ? `${product.stockQuantity} en stock` 
                    : 'Rupture de stock'
                  }
                </span>
              </div>

              {/* Customization Options */}
              {product.isCustomizable && product.customizationOptions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Palette className="w-5 h-5" />
                      <span>Options de Personnalisation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(product.customizationOptions).map(([optionKey, option]) => 
                      renderCustomizationOption(optionKey, option)
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quantity and Add to Cart */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-4">
                      <Label className="text-sm font-medium">Quantité:</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(quantity + 1)}
                          disabled={quantity >= product.stockQuantity}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || product.stockQuantity === 0}
                      className="w-full bg-skd-shop hover:bg-skd-shop/90 text-white"
                      size="lg"
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Ajout en cours...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Ajouter au panier - {(product.price * quantity).toFixed(2)}€
                        </>
                      )}
                    </Button>

                    {product.stockQuantity === 0 && (
                      <p className="text-sm text-red-600 text-center">
                        Ce produit n'est plus disponible
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
