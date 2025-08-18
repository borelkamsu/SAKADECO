import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import ProductWithCustomization from '@/components/ProductWithCustomization';

export default function TestCustomization() {
  const [, setLocation] = useLocation();

  // Produit de test simple
  const testProduct = {
    id: 'test-product',
    name: "Trophée de test",
    description: "Un trophée simple pour tester l'interface de personnalisation.",
    price: 49.99,
    mainImageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
    additionalImages: [],
    isCustomizable: true,
    customizationZones: [
      {
        id: 'text_zone',
        type: 'text',
        position: 'center',
        label: 'Votre nom',
        required: true,
        maxLength: 20
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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
            <h1 className="text-2xl font-bold text-gray-900">Test - Interface de Personnalisation</h1>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">🧪 Test de l'interface</h2>
          <p className="text-sm text-gray-700">
            Cliquez sur la zone bleue au centre de l'image pour tester la personnalisation.
          </p>
        </div>

        {/* Produit de test */}
        <ProductWithCustomization product={testProduct} />

        {/* Informations de debug */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Debug Info:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Zone de personnalisation : Centre de l'image</li>
            <li>• Type : Texte uniquement</li>
            <li>• Longueur max : 20 caractères</li>
            <li>• Obligatoire : Oui</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
