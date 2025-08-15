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
  type: 'dropdown' | 'checkbox' | 'text' | 'textarea';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  maxLength?: number;
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
    isRentable: false,
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
        type: 'dropdown',
        label: '',
        required: false,
        options: []
      }
    }));
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
    const newValue = prompt("Entrez la valeur de l'option:");
    if (newValue) {
      setCustomizationOptions(prev => ({
        ...prev,
        [optionKey]: {
          ...prev[optionKey],
          options: [...(prev[optionKey].options || []), newValue]
        }
      }));
    }
  };

  const removeOptionValue = (optionKey: string, valueIndex: number) => {
    setCustomizationOptions(prev => ({
      ...prev,
      [optionKey]: {
        ...prev[optionKey],
        options: prev[optionKey].options?.filter((_, index) => index !== valueIndex)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainImageUrl) {
      alert("Veuillez uploader au moins une image principale");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          mainImageUrl,
          additionalImages,
          customizationOptions
        })
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="isRentable"
                  checked={formData.isRentable}
                  onCheckedChange={(checked) => handleInputChange('isRentable', checked)}
                />
                <Label htmlFor="isRentable">Produit disponible à la location</Label>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Type d'option</Label>
                        <Select
                          value={option.type}
                          onValueChange={(value: any) => updateCustomizationOption(key, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dropdown">Menu déroulant</SelectItem>
                            <SelectItem value="checkbox">Cases à cocher</SelectItem>
                            <SelectItem value="text">Champ texte</SelectItem>
                            <SelectItem value="textarea">Zone de texte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Libellé</Label>
                        <Input
                          value={option.label}
                          onChange={(e) => updateCustomizationOption(key, 'label', e.target.value)}
                          placeholder="ex: Couleur, Taille, Thème..."
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`required-${key}`}
                        checked={option.required}
                        onCheckedChange={(checked) => updateCustomizationOption(key, 'required', checked)}
                      />
                      <Label htmlFor={`required-${key}`}>Option obligatoire</Label>
                    </div>

                    {(option.type === 'dropdown' || option.type === 'checkbox') && (
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
                        <div className="flex flex-wrap gap-2">
                          {option.options?.map((value, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                              <span>{value}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOptionValue(key, index)}
                                className="h-auto p-0 ml-1"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {(option.type === 'text' || option.type === 'textarea') && (
                      <div className="space-y-2">
                        <div>
                          <Label>Placeholder</Label>
                          <Input
                            value={option.placeholder || ''}
                            onChange={(e) => updateCustomizationOption(key, 'placeholder', e.target.value)}
                            placeholder="ex: Entrez votre message..."
                          />
                        </div>
                        <div>
                          <Label>Longueur maximale</Label>
                          <Input
                            type="number"
                            value={option.maxLength || ''}
                            onChange={(e) => updateCustomizationOption(key, 'maxLength', parseInt(e.target.value) || undefined)}
                            placeholder="ex: 500"
                          />
                        </div>
                      </div>
                    )}
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
