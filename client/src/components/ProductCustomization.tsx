import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Eye, Upload, X, Type, Image as ImageIcon } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface CustomizationOption {
  type: 'dropdown' | 'checkbox' | 'text' | 'textarea' | 'text_image_upload';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  maxLength?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  pricePerCharacter?: number;
  basePrice?: number;
  engravingType?: 'text' | 'image' | 'both'; // Nouveau champ pour les gravures
}

interface ProductCustomizationProps {
  productName: string;
  productImage: string;
  customizationOptions: Record<string, CustomizationOption>;
  onCustomizationChange: (customizations: Record<string, any>) => void;
  initialCustomizations?: Record<string, any>;
}

export default function ProductCustomization({
  productName,
  productImage,
  customizationOptions,
  onCustomizationChange,
  initialCustomizations = {}
}: ProductCustomizationProps) {
  const [customizations, setCustomizations] = useState<Record<string, any>>(initialCustomizations);
  const [customText, setCustomText] = useState('');
  const [customImage, setCustomImage] = useState<string>('');
  const [customizationType, setCustomizationType] = useState<'text' | 'image'>('text');
  const [customizationPrice, setCustomizationPrice] = useState(0);

  const handleCustomizationChange = (key: string, value: any) => {
    const newCustomizations = { ...customizations, [key]: value };
    setCustomizations(newCustomizations);
    onCustomizationChange(newCustomizations);
  };

  const handleTextImageUploadChange = (key: string, type: 'text' | 'image', value: string) => {
    const option = customizationOptions[key];
    let price = option.basePrice || 0;

    if (type === 'text' && value.length > 0) {
      // Calculer le prix basé sur le nombre de caractères
      const extraChars = Math.max(0, value.length - (option.maxLength || 0));
      price += extraChars * (option.pricePerCharacter || 0.1);
    } else if (type === 'image' && value) {
      price = option.basePrice || 5; // Prix de base pour l'image
    }

    setCustomizationPrice(price);

    const newCustomizations = {
      ...customizations,
      [key]: {
        type,
        value,
        price
      }
    };
    setCustomizations(newCustomizations);
    onCustomizationChange(newCustomizations);
  };

  const handleImageUpload = (key: string, imageUrl: string) => {
    setCustomImage(imageUrl);
    handleTextImageUploadChange(key, 'image', imageUrl);
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

      case 'checkbox':
        return (
          <div className="space-y-2">
            {option.options?.map((opt) => (
              <div key={opt} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${key}-${opt}`}
                  checked={customizations[key]?.includes(opt) || false}
                  onChange={(e) => {
                    const currentValues = customizations[key] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, opt]
                      : currentValues.filter((v: string) => v !== opt);
                    handleCustomizationChange(key, newValues);
                  }}
                  className="rounded"
                />
                <Label htmlFor={`${key}-${opt}`}>{opt}</Label>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <Input
            value={customizations[key] || ''}
            onChange={(e) => handleCustomizationChange(key, e.target.value)}
            placeholder={option.placeholder}
            maxLength={option.maxLength}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={customizations[key] || ''}
            onChange={(e) => handleCustomizationChange(key, e.target.value)}
            placeholder={option.placeholder}
            maxLength={option.maxLength}
            rows={3}
          />
        );

            case 'text_image_upload':
        const engravingType = option.engravingType;
        
        // Interface pour gravure texte uniquement
        if (engravingType === 'text') {
          return (
            <div className="space-y-2">
              <Label>Texte à graver</Label>
              <Textarea
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  handleTextImageUploadChange(key, 'text', e.target.value);
                }}
                placeholder="Entrez le texte à graver sur le produit"
                maxLength={option.maxLength}
                rows={3}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{customText.length}/{option.maxLength || 50} caractères</span>
                {customizationPrice > 0 && (
                  <span className="text-blue-600 font-medium">
                    +{customizationPrice.toFixed(2)}€
                  </span>
                )}
              </div>
              {option.maxLength && customText.length > option.maxLength && (
                <p className="text-sm text-red-600">
                  Limite de caractères dépassée. Prix supplémentaire appliqué.
                </p>
              )}
            </div>
          );
        }
        
        // Interface pour gravure image uniquement
        if (engravingType === 'image') {
          return (
            <div className="space-y-2">
              <Label>Image à graver</Label>
              <ImageUpload
                onImageUpload={(imageUrl) => handleImageUpload(key, imageUrl)}
                maxFileSize={option.maxFileSize}
                allowedFileTypes={option.allowedFileTypes}
                placeholder="Téléchargez l'image à graver sur le produit"
              />
              {customizationPrice > 0 && (
                <div className="text-sm text-blue-600 font-medium">
                  Prix de gravure : +{customizationPrice.toFixed(2)}€
                </div>
              )}
            </div>
          );
        }
        
        // Interface pour gravure texte ET image
        if (engravingType === 'both') {
          return (
            <div className="space-y-4">
              <div>
                <Label>Texte à graver (optionnel)</Label>
                <Textarea
                  value={customText}
                  onChange={(e) => {
                    setCustomText(e.target.value);
                    handleTextImageUploadChange(key, 'text', e.target.value);
                  }}
                  placeholder="Entrez le texte à graver (optionnel)"
                  maxLength={option.maxLength}
                  rows={2}
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{customText.length}/{option.maxLength || 50} caractères</span>
                </div>
              </div>

              <div>
                <Label>Image à graver (optionnel)</Label>
                <ImageUpload
                  onImageUpload={(imageUrl) => handleImageUpload(key, imageUrl)}
                  maxFileSize={option.maxFileSize}
                  allowedFileTypes={option.allowedFileTypes}
                  placeholder="Téléchargez l'image à graver (optionnel)"
                />
              </div>

              {(customText || customImage) && (
                <div className="text-sm text-blue-600 font-medium">
                  Prix de gravure : +{customizationPrice.toFixed(2)}€
                </div>
              )}
            </div>
          );
        }
        
        // Interface générique pour text_image_upload sans engravingType
        return (
          <div className="space-y-4">
            {/* Sélection du type de personnalisation */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={customizationType === 'text' ? 'default' : 'outline'}
                onClick={() => setCustomizationType('text')}
                className="flex items-center space-x-2"
              >
                <Type className="w-4 h-4" />
                <span>Texte</span>
              </Button>
              <Button
                type="button"
                variant={customizationType === 'image' ? 'default' : 'outline'}
                onClick={() => setCustomizationType('image')}
                className="flex items-center space-x-2"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Image</span>
              </Button>
            </div>

            {/* Interface pour le texte */}
            {customizationType === 'text' && (
              <div className="space-y-2">
                <Textarea
                  value={customText}
                  onChange={(e) => {
                    setCustomText(e.target.value);
                    handleTextImageUploadChange(key, 'text', e.target.value);
                  }}
                  placeholder={option.placeholder}
                  maxLength={option.maxLength}
                  rows={3}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{customText.length}/{option.maxLength || 50} caractères</span>
                  {customizationPrice > 0 && (
                    <span className="text-blue-600 font-medium">
                      +{customizationPrice.toFixed(2)}€
                    </span>
                  )}
                </div>
                {option.maxLength && customText.length > option.maxLength && (
                  <p className="text-sm text-red-600">
                    Limite de caractères dépassée. Prix supplémentaire appliqué.
                  </p>
                )}
              </div>
            )}

            {/* Interface pour l'image */}
            {customizationType === 'image' && (
              <div className="space-y-2">
                <ImageUpload
                  onImageUpload={(imageUrl) => handleImageUpload(key, imageUrl)}
                  maxFileSize={option.maxFileSize || 5}
                  allowedFileTypes={option.allowedFileTypes || ['image/jpeg', 'image/png']}
                  placeholder="Glissez-déposez votre image ou cliquez pour sélectionner"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Taille max: {option.maxFileSize || 5}MB</span>
                  {customizationPrice > 0 && (
                    <span className="text-blue-600 font-medium">
                      +{customizationPrice.toFixed(2)}€
                    </span>
                  )}
                </div>
                {customImage && (
                  <div className="mt-2">
                    <img
                      src={customImage}
                      alt="Image personnalisée"
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Options de Personnalisation</span>
            {Object.values(customizations).some(val => val && (typeof val === 'string' ? val.length > 0 : true)) && (
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                ✨ Personnalisé
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(customizationOptions).map(([key, option]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="text-sm font-medium">
                {option.label}
                {option.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderCustomizationField(key, option)}
              {option.placeholder && (
                <p className="text-xs text-gray-500">{option.placeholder}</p>
              )}
            </div>
          ))}

          {/* Résumé des prix de personnalisation */}
          {customizationPrice > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Prix de personnalisation:</strong> +{customizationPrice.toFixed(2)}€
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


