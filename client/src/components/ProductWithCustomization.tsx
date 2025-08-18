import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Eye, Upload, X, Type, Image as ImageIcon } from 'lucide-react';
import Product3DPreview from './Product3DPreview';
import ImageUpload from './ImageUpload';

interface CustomizationZone {
  id: string;
  type: 'text' | 'image';
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  label: string;
  required: boolean;
  maxLength?: number;
}

interface ProductWithCustomizationProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    mainImageUrl: string;
    additionalImages: string[];
    isCustomizable: boolean;
    customizationZones?: CustomizationZone[];
  };
}

export default function ProductWithCustomization({ product }: ProductWithCustomizationProps) {
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Zones de personnalisation par défaut si non définies
  const customizationZones = product.customizationZones || [
    {
      id: 'main_text',
      type: 'text',
      position: 'center',
      label: 'Votre nom ou message',
      required: true,
      maxLength: 30
    },
    {
      id: 'main_image',
      type: 'image',
      position: 'top-right',
      label: 'Votre logo ou image',
      required: false
    }
  ];

  const handleCustomizationChange = (zoneId: string, value: string) => {
    setCustomizations(prev => ({
      ...prev,
      [zoneId]: value
    }));
  };

  const getZonePosition = (position: string) => {
    const positions = {
      'top-left': 'absolute top-4 left-4',
      'top-center': 'absolute top-4 left-1/2 transform -translate-x-1/2',
      'top-right': 'absolute top-4 right-4',
      'center-left': 'absolute top-1/2 left-4 transform -translate-y-1/2',
      'center': 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      'center-right': 'absolute top-1/2 right-4 transform -translate-y-1/2',
      'bottom-left': 'absolute bottom-4 left-4',
      'bottom-center': 'absolute bottom-4 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'absolute bottom-4 right-4'
    };
    return positions[position as keyof typeof positions] || positions.center;
  };

  const renderCustomizationZone = (zone: CustomizationZone) => {
    const isSelected = selectedZone === zone.id;
    const hasValue = customizations[zone.id];

    return (
      <div
        key={zone.id}
        className={`${getZonePosition(zone.position)} ${
          isSelected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-300'
        } bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-2 min-w-[120px] max-w-[200px] transition-all duration-200 hover:ring-2 hover:ring-blue-400 cursor-pointer`}
        onClick={() => setSelectedZone(zone.id)}
      >
        {zone.type === 'text' ? (
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-700">
              {zone.label}
              {zone.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {isSelected ? (
              <Input
                value={customizations[zone.id] || ''}
                onChange={(e) => handleCustomizationChange(zone.id, e.target.value)}
                placeholder="Entrez votre texte..."
                maxLength={zone.maxLength}
                className="text-xs h-8"
                autoFocus
              />
            ) : (
              <div className="text-xs text-gray-500 min-h-[32px] flex items-center">
                {hasValue ? (
                  <span className="truncate">{customizations[zone.id]}</span>
                ) : (
                  <span className="flex items-center">
                    <Type className="w-3 h-3 mr-1" />
                    Cliquez pour écrire
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-700">
              {zone.label}
              {zone.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {isSelected ? (
              <div className="space-y-2">
                <ImageUpload
                  onImagesUploaded={(urls) => {
                    if (urls.length > 0) {
                      handleCustomizationChange(zone.id, urls[0]);
                      setSelectedZone(null);
                    }
                  }}
                  onFilesSelected={() => {}}
                  multiple={false}
                  maxImages={1}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedZone(null)}
                  className="w-full text-xs"
                >
                  Annuler
                </Button>
              </div>
            ) : (
              <div className="text-xs text-gray-500 min-h-[32px] flex items-center">
                {hasValue ? (
                  <div className="flex items-center space-x-2">
                    <img
                      src={customizations[zone.id]}
                      alt="Image personnalisée"
                      className="w-6 h-6 object-cover rounded"
                    />
                    <span className="truncate">Image ajoutée</span>
                  </div>
                ) : (
                  <span className="flex items-center">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Cliquez pour uploader
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const hasCustomizations = Object.values(customizations).some(value => value.trim() !== '');

  return (
    <div className="space-y-6">
      {/* Produit avec zones de personnalisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {product.name}
            {product.isCustomizable && (
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                ✨ Personnalisable
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image du produit avec zones de personnalisation */}
            <div className="relative">
              <div
                ref={imageRef}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
              >
                <img
                  src={product.mainImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Zones de personnalisation */}
                {product.isCustomizable && customizationZones.map(renderCustomizationZone)}
                
                {/* Overlay pour indiquer les zones cliquables */}
                {!selectedZone && product.isCustomizable && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                    <div className="text-white text-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <p className="text-sm font-medium">Cliquez sur les zones pour personnaliser</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Instructions */}
              {product.isCustomizable && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Comment personnaliser :</strong> Cliquez sur les zones colorées pour ajouter votre texte ou image personnalisée.
                  </p>
                </div>
              )}
            </div>

            {/* Informations du produit */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="text-gray-600 mt-2">{product.description}</p>
              </div>
              
              <div className="text-2xl font-bold text-gray-900">
                {product.price.toFixed(2)} €
              </div>

              {/* Résumé des personnalisations */}
              {product.isCustomizable && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Vos personnalisations :</h4>
                  {customizationZones.map(zone => {
                    const value = customizations[zone.id];
                    if (!value) return null;
                    
                    return (
                      <div key={zone.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{zone.label}:</span>
                        <span className="text-sm text-gray-600 truncate max-w-[150px]">
                          {zone.type === 'text' ? value : '✓ Image ajoutée'}
                        </span>
                      </div>
                    );
                  })}
                  
                  {!hasCustomizations && (
                    <p className="text-sm text-gray-500 italic">
                      Aucune personnalisation ajoutée
                    </p>
                  )}
                </div>
              )}

              {/* Boutons d'action */}
              <div className="space-y-2">
                {product.isCustomizable && hasCustomizations && (
                  <Button
                    onClick={() => setShowPreview(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Prévisualiser en 3D
                  </Button>
                )}
                
                <Button className="w-full">
                  Ajouter au panier
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de prévisualisation 3D */}
      {showPreview && (
        <Product3DPreview
          productImage={product.mainImageUrl}
          productName={product.name}
          engravingText={customizations['main_text'] || ''}
          engravingImage={customizations['main_image'] || ''}
          engravingPosition="front"
          engravingStyle="simple"
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
