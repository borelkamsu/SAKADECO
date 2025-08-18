import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, ArrowLeft, X } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface CustomizationOption {
  label: string;
  values: string[];
}

export default function AdminAddProduct() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [customizationOptions, setCustomizationOptions] = useState<Record<string, CustomizationOption>>({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    isCustomizable: false,
    isForSale: true,
    isForRent: false,
    stockQuantity: "",
    dailyRentalPrice: ""
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImagesUploaded = (imageUrls: string[]) => {
    if (imageUrls.length > 0) {
      setMainImageUrl(imageUrls[0]);
      setAdditionalImages(imageUrls.slice(1));
    }
  };

  const addCustomizationOption = () => {
    const optionKey = `option_${Date.now()}`;
    setCustomizationOptions(prev => ({
      ...prev,
      [optionKey]: {
        label: '',
        values: ['', '', ''] // 3 valeurs par défaut
      }
    }));
    
    // Automatically enable customization when adding options
    if (!formData.isCustomizable) {
      handleInputChange('isCustomizable', true);
    }
  };

  // Transform customization options to the expected format before sending
  const transformCustomizationOptions = () => {
    const transformed: any = {};
    
    Object.entries(customizationOptions).forEach(([key, option]) => {
      if (option.label.trim()) {
        // Use the label as the key for better readability
        const optionKey = option.label.toLowerCase().replace(/\s+/g, '_');
        
        // Filter out empty values
        const validValues = option.values.filter(value => value.trim() !== '');
        
        if (validValues.length > 0) {
          transformed[optionKey] = validValues;
        }
      }
    });
    
    return transformed;
  };

  const updateCustomizationOption = (key: string, field: keyof CustomizationOption, value: any) => {
    setCustomizationOptions(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const removeCustomizationOption = (key: string) => {
    setCustomizationOptions(prev => {
      const newOptions = { ...prev };
      delete newOptions[key];
      return newOptions;
    });
  };

  const addOptionValue = (optionKey: string) => {
    setCustomizationOptions(prev => ({
      ...prev,
      [optionKey]: {
        ...prev[optionKey],
        values: [...prev[optionKey].values, '']
      }
    }));
  };

  const removeOptionValue = (optionKey: string, valueIndex: number) => {
    setCustomizationOptions(prev => ({
      ...prev,
      [optionKey]: {
        ...prev[optionKey],
        values: prev[optionKey].values.filter((_, index) => index !== valueIndex)
      }
    }));
  };

  const updateOptionValue = (optionKey: string, valueIndex: number, value: string) => {
    setCustomizationOptions(prev => ({
      ...prev,
      [optionKey]: {
        ...prev[optionKey],
        values: prev[optionKey].values.map((v, index) => index === valueIndex ? value : v)
      }
    }));
  };

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    const errors = [];
    if (!formData.name?.trim()) errors.push('Le nom est requis');
    if (!formData.description?.trim()) errors.push('La description est requise');
    if (!formData.price || formData.price <= 0) errors.push('Le prix doit être supérieur à 0');
    if (!formData.category?.trim()) errors.push('La catégorie est requise');
    
    if (errors.length > 0) {
      alert('Erreurs de validation:\n' + errors.join('\n'));
      return;
    }
    
    if (uploadedFiles.length === 0) {
      alert("Veuillez uploader au moins une image principale");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      
      // Créer FormData pour envoyer les fichiers
      const formDataToSend = new FormData();
      
      // Ajouter les données du formulaire
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory);
      formDataToSend.append('isCustomizable', String(Object.keys(customizationOptions).length > 0 || formData.isCustomizable));
      formDataToSend.append('isForSale', String(formData.isForSale));
      formDataToSend.append('isForRent', String(formData.isForRent));
      formDataToSend.append('stockQuantity', formData.stockQuantity);
      formDataToSend.append('dailyRentalPrice', formData.dailyRentalPrice);
      formDataToSend.append('customizationOptions', JSON.stringify(transformCustomizationOptions()));
      
      // Ajouter les fichiers
      if (uploadedFiles.length > 0) {
        formDataToSend.append('image', uploadedFiles[0]); // Image principale
      }
      
      // Ajouter les images supplémentaires
      uploadedFiles.slice(1).forEach((file, index) => {
        formDataToSend.append('additionalImages', file);
      });

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Ne pas définir Content-Type pour FormData
        },
        body: formDataToSend
      });

      // Debug log
      console.log('🔍 Debug - Sending product data:', {
        formDataIsCustomizable: formData.isCustomizable,
        hasCustomizationOptions: Object.keys(customizationOptions).length > 0,
        finalIsCustomizable: Object.keys(customizationOptions).length > 0 || formData.isCustomizable,
        customizationOptions: transformCustomizationOptions(),
        uploadedFilesCount: uploadedFiles.length
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du produit');
      }

      alert('Produit créé avec succès !');
      setLocation('/admin/products');
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la création du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/admin/products')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Ajouter un produit</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Prix (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shop">Boutique</SelectItem>
                      <SelectItem value="rent">Location</SelectItem>
                      <SelectItem value="events">Événements</SelectItem>
                      <SelectItem value="home">Maison</SelectItem>
                      <SelectItem value="co">Co</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Sous-catégorie</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="stockQuantity">Quantité en stock</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dailyRentalPrice">Prix de location/jour (€)</Label>
                  <Input
                    id="dailyRentalPrice"
                    type="number"
                    step="0.01"
                    value={formData.dailyRentalPrice}
                    onChange={(e) => handleInputChange('dailyRentalPrice', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images du produit</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onImagesUploaded={handleImagesUploaded}
                onFilesSelected={setUploadedFiles}
                multiple={true}
                maxImages={10}
              />
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle>Options du produit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isCustomizable"
                  checked={formData.isCustomizable}
                  onCheckedChange={(checked) => handleInputChange('isCustomizable', checked)}
                />
                <Label htmlFor="isCustomizable">Produit personnalisable</Label>
              </div>
              
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-gray-900">Disponibilité du produit</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isForSale"
                      checked={formData.isForSale}
                      onCheckedChange={(checked) => handleInputChange('isForSale', checked)}
                    />
                    <Label htmlFor="isForSale">Destiné à la vente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isForRent"
                      checked={formData.isForRent}
                      onCheckedChange={(checked) => handleInputChange('isForRent', checked)}
                    />
                    <Label htmlFor="isForRent">Destiné à la location</Label>
                  </div>
                </div>
                
                {!formData.isForSale && !formData.isForRent && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                    ⚠️ Le produit doit être disponible à la vente OU à la location (ou les deux)
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customization Options */}
          {formData.isCustomizable && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Options de personnalisation
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomizationOption}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une option
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(customizationOptions).map(([key, option]) => (
                  <div key={key} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Option de personnalisation</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCustomizationOption(key)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div>
                      <Label>Libellé de l'option</Label>
                      <Input
                        value={option.label}
                        onChange={(e) => updateCustomizationOption(key, 'label', e.target.value)}
                        placeholder="ex: Couleur, Taille, Thème, Style..."
                        className="mb-4"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Valeurs disponibles</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOptionValue(key)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter une valeur
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {option.values.map((value, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={value}
                              onChange={(e) => updateOptionValue(key, index, e.target.value)}
                              placeholder={`Valeur ${index + 1}`}
                              className="flex-1"
                            />
                            {option.values.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOptionValue(key, index)}
                                className="h-auto p-1"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Créer le produit
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
