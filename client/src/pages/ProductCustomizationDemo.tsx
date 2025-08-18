import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Upload, X, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import Product3DPreview from '@/components/Product3DPreview';
import ImageUpload from '@/components/ImageUpload';

interface CustomizationOption {
  type: 'dropdown' | 'checkbox' | 'text' | 'textarea' | 'name_engraving' | 'image_upload';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  maxLength?: number;
  engravingType?: 'text' | 'image' | 'both';
  engravingPosition?: 'front' | 'back' | 'side' | 'top' | 'bottom';
  engravingStyle?: 'simple' | 'elegant' | 'bold' | 'script' | 'decorative';
}

export default function ProductCustomizationDemo() {
  const [, setLocation] = useLocation();
  const [customizations, setCustomizations] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  const [engravingImage, setEngravingImage] = useState<string>('');
  const [engravingPosition, setEngravingPosition] = useState<'front' | 'back' | 'side' | 'top' | 'bottom'>('front');
  const [engravingStyle, setEngravingStyle] = useState<'simple' | 'elegant' | 'bold' | 'script' | 'decorative'>('simple');

  // Produit de démonstration
  const demoProduct = {
    name: "Trophée personnalisable",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
    customizationOptions: {
      nom_a_graver: {
        type: 'name_engraving',
        label: 'Nom à graver',
        required: true,
        engravingPosition: 'front',
        engravingStyle: 'elegant'
      },
      logo_a_graver: {
        type: 'image_upload',
        label: 'Logo à graver (optionnel)',
        required: false,
        engravingPosition: 'top',
        engravingStyle: 'simple'
      },
      taille: {
        type: 'dropdown',
        label: 'Taille du trophée',
        required: true,
        options: ['Petit (15cm)', 'Moyen (25cm)', 'Grand (35cm)', 'Extra Large (45cm)']
      },
      couleur: {
        type: 'dropdown',
        label: 'Couleur du métal',
        required: true,
        options: ['Or', 'Argent', 'Bronze', 'Chrome', 'Laiton']
      },
      style: {
        type: 'dropdown',
        label: 'Style du trophée',
        required: true,
        options: ['Classique', 'Moderne', 'Sportif', 'Élégant', 'Minimaliste']
      }
    }
  };

  const handleCustomizationChange = (key: string, value: any) => {
    const newCustomizations = { ...customizations, [key]: value };
    setCustomizations(newCustomizations);
  };

  const handleEngravingTextChange = (text: string) => {
    setEngravingText(text);
    handleCustomizationChange('engravingText', text);
  };

  const handleEngravingImageChange = (imageUrl: string) => {
    setEngravingImage(imageUrl);
    handleCustomizationChange('engravingImage', imageUrl);
  };

  const renderCustomizationField = (key: string, option: CustomizationOption) => {
    switch (option.type) {
      case 'dropdown':
        return (
          <Select
            value={customizations[key] || ''}
            onValueChange={(value) => handleCustomizationChange(key, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Choisir ${option.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {option.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'name_engraving':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="engravingText">Texte à graver</Label>
              <Input
                id="engravingText"
                value={engravingText}
                onChange={(e) => handleEngravingTextChange(e.target.value)}
                placeholder="Entrez le nom ou texte à graver..."
                maxLength={50}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="engravingPosition">Position de la gravure</Label>
                <Select value={engravingPosition} onValueChange={(value: any) => setEngravingPosition(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Avant</SelectItem>
                    <SelectItem value="back">Arrière</SelectItem>
                    <SelectItem value="side">Côté</SelectItem>
                    <SelectItem value="top">Haut</SelectItem>
                    <SelectItem value="bottom">Bas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="engravingStyle">Style de gravure</Label>
                <Select value={engravingStyle} onValueChange={(value: any) => setEngravingStyle(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="elegant">Élégant</SelectItem>
                    <SelectItem value="bold">Gras</SelectItem>
                    <SelectItem value="script">Script</SelectItem>
                    <SelectItem value="decorative">Décoratif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'image_upload':
        return (
          <div className="space-y-4">
            <div>
              <Label>Image à graver</Label>
              <ImageUpload
                onImagesUploaded={(urls) => {
                  if (urls.length > 0) {
                    handleEngravingImageChange(urls[0]);
                  }
                }}
                onFilesSelected={() => {}}
                multiple={false}
                maxImages={1}
              />
            </div>
            
            {engravingImage && (
              <div className="relative inline-block">
                <img
                  src={engravingImage}
                  alt="Image à graver"
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 p-0"
                  onClick={() => handleEngravingImageChange('')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="engravingPosition">Position de la gravure</Label>
                <Select value={engravingPosition} onValueChange={(value: any) => setEngravingPosition(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Avant</SelectItem>
                    <SelectItem value="back">Arrière</SelectItem>
                    <SelectItem value="side">Côté</SelectItem>
                    <SelectItem value="top">Haut</SelectItem>
                    <SelectItem value="bottom">Bas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const hasEngravingOptions = Object.values(demoProduct.customizationOptions).some(
    option => option.type === 'name_engraving' || option.type === 'image_upload'
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Démonstration - Personnalisation avec Gravure</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Produit et personnalisation */}
          <div className="space-y-6">
            {/* Produit */}
            <Card>
              <CardHeader>
                <CardTitle>{demoProduct.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={demoProduct.image}
                    alt={demoProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Options de personnalisation standard */}
            <Card>
              <CardHeader>
                <CardTitle>Options de personnalisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(demoProduct.customizationOptions)
                  .filter(([_, option]) => option.type !== 'name_engraving' && option.type !== 'image_upload')
                  .map(([key, option]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>
                        {option.label}
                        {option.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderCustomizationField(key, option)}
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Options de gravure */}
            {hasEngravingOptions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Options de gravure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(demoProduct.customizationOptions)
                    .filter(([_, option]) => option.type === 'name_engraving' || option.type === 'image_upload')
                    .map(([key, option]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key}>
                          {option.label}
                          {option.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {renderCustomizationField(key, option)}
                      </div>
                    ))}

                  {/* Bouton de prévisualisation */}
                  {(engravingText || engravingImage) && (
                    <div className="pt-4 border-t">
                      <Button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Prévisualiser en 3D
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Résumé de la personnalisation */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Résumé de votre personnalisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(customizations).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{key}:</span>
                      <span className="text-gray-600">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </span>
                    </div>
                  ))}
                  
                  {engravingText && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Texte gravé:</span>
                      <span className="text-blue-600">{engravingText}</span>
                    </div>
                  )}
                  
                  {engravingImage && (
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Image gravée:</span>
                      <span className="text-green-600">✓ Ajoutée</span>
                    </div>
                  )}
                  
                  {!engravingText && !engravingImage && Object.keys(customizations).length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucune personnalisation sélectionnée</p>
                      <p className="text-sm">Commencez par personnaliser votre produit</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Comment ça marche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <p>Choisissez les options de personnalisation de base (taille, couleur, style)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <p>Ajoutez du texte ou une image à graver sur le produit</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <p>Cliquez sur "Prévisualiser en 3D" pour voir le résultat final</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <p>Explorez différentes vues et angles dans la prévisualisation 3D</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de prévisualisation 3D */}
        {showPreview && (
          <Product3DPreview
            productImage={demoProduct.image}
            productName={demoProduct.name}
            engravingText={engravingText}
            engravingImage={engravingImage}
            engravingPosition={engravingPosition}
            engravingStyle={engravingStyle}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </div>
  );
}
