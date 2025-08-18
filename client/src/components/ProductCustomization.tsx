import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Eye, Upload, X } from 'lucide-react';
import Product3DPreview from './Product3DPreview';
import ImageUpload from './ImageUpload';

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
  const [showPreview, setShowPreview] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  const [engravingImage, setEngravingImage] = useState<string>('');
  const [engravingPosition, setEngravingPosition] = useState<'front' | 'back' | 'side' | 'top' | 'bottom'>('front');
  const [engravingStyle, setEngravingStyle] = useState<'simple' | 'elegant' | 'bold' | 'script' | 'decorative'>('simple');

  const handleCustomizationChange = (key: string, value: any) => {
    const newCustomizations = { ...customizations, [key]: value };
    setCustomizations(newCustomizations);
    onCustomizationChange(newCustomizations);
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

  const hasEngravingOptions = Object.values(customizationOptions).some(
    option => option.type === 'name_engraving' || option.type === 'image_upload'
  );

  return (
    <div className="space-y-6">
      {/* Options de personnalisation standard */}
      {Object.entries(customizationOptions)
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
            {Object.entries(customizationOptions)
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

      {/* Modal de prévisualisation 3D */}
      {showPreview && (
        <Product3DPreview
          productImage={productImage}
          productName={productName}
          engravingText={engravingText}
          engravingImage={engravingImage}
          engravingPosition={engravingPosition}
          engravingStyle={engravingStyle}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

