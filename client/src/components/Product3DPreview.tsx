import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Eye, RotateCcw, Download, X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface Product3DPreviewProps {
  productImage: string;
  productName: string;
  engravingText?: string;
  engravingImage?: string;
  engravingPosition?: 'front' | 'back' | 'side' | 'top' | 'bottom';
  engravingStyle?: 'simple' | 'elegant' | 'bold' | 'script' | 'decorative';
  onClose?: () => void;
}

export default function Product3DPreview({
  productImage,
  productName,
  engravingText,
  engravingImage,
  engravingPosition = 'front',
  engravingStyle = 'simple',
  onClose
}: Product3DPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [currentView, setCurrentView] = useState(engravingPosition);

  useEffect(() => {
    // Simuler le chargement des textures
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    // Logique pour télécharger la prévisualisation
    console.log('Téléchargement de la prévisualisation...');
  };

  const handleReset = () => {
    setRotation(0);
    setZoom(1);
    setCurrentView(engravingPosition);
  };

  const getFontStyle = () => {
    switch (engravingStyle) {
      case 'elegant': return 'font-serif italic';
      case 'bold': return 'font-bold';
      case 'script': return 'font-serif italic';
      case 'decorative': return 'font-serif';
      default: return 'font-normal';
    }
  };

  const getEngravingColor = () => {
    switch (engravingStyle) {
      case 'elegant': return 'text-yellow-600';
      case 'bold': return 'text-gray-800';
      case 'script': return 'text-amber-700';
      case 'decorative': return 'text-gold-600';
      default: return 'text-gray-700';
    }
  };

  const getViewTransform = () => {
    const baseTransform = `rotateY(${rotation}deg) scale(${zoom})`;
    
    switch (currentView) {
      case 'front': return `${baseTransform} rotateX(0deg)`;
      case 'back': return `${baseTransform} rotateX(0deg) rotateY(180deg)`;
      case 'side': return `${baseTransform} rotateX(0deg) rotateY(90deg)`;
      case 'top': return `${baseTransform} rotateX(-90deg)`;
      case 'bottom': return `${baseTransform} rotateX(90deg)`;
      default: return baseTransform;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Prévisualisation 3D - {productName}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation(rotation - 90)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Rotation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
              >
                <ZoomIn className="w-4 h-4 mr-2" />
                Zoom +
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
              >
                <ZoomOut className="w-4 h-4 mr-2" />
                Zoom -
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4 mr-2" />
                Fermer
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de la prévisualisation 3D...</p>
              </div>
            </div>
          ) : (
            <div className="h-full relative bg-gradient-to-br from-gray-100 to-gray-200">
              {/* Vue 3D simulée */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="relative w-64 h-64 transition-all duration-500 ease-in-out"
                  style={{ transform: getViewTransform() }}
                >
                  {/* Produit principal */}
                  <div className="w-full h-full bg-white rounded-lg shadow-2xl border-2 border-gray-300 relative overflow-hidden">
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Gravure de texte */}
                    {engravingText && (
                      <div 
                        className={`absolute inset-0 flex items-center justify-center ${getFontStyle()} ${getEngravingColor()}`}
                        style={{
                          fontSize: `${Math.max(12, Math.min(24, engravingText.length * 0.8))}px`,
                          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          backdropFilter: 'blur(1px)'
                        }}
                      >
                        <span className="text-center px-4 py-2 rounded">
                          {engravingText}
                        </span>
                      </div>
                    )}
                    
                    {/* Gravure d'image */}
                    {engravingImage && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-400 shadow-lg"
                          style={{
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(2px)'
                          }}
                        >
                          <img
                            src={engravingImage}
                            alt="Image gravée"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Effet de profondeur */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black opacity-20 rounded-lg"></div>
                </div>
              </div>

              {/* Contrôles de vue */}
              <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
                <h4 className="font-medium mb-2 text-sm">Vues</h4>
                <div className="space-y-1">
                  {['front', 'back', 'side', 'top', 'bottom'].map((view) => (
                    <button
                      key={view}
                      onClick={() => setCurrentView(view as any)}
                      className={`block w-full text-left px-2 py-1 rounded text-xs ${
                        currentView === view 
                          ? 'bg-blue-500 text-white' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {view === 'front' && 'Avant'}
                      {view === 'back' && 'Arrière'}
                      {view === 'side' && 'Côté'}
                      {view === 'top' && 'Haut'}
                      {view === 'bottom' && 'Bas'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Informations de personnalisation */}
              <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg max-w-xs">
                <h4 className="font-medium mb-2">Personnalisation</h4>
                <div className="space-y-2 text-sm">
                  {engravingText && (
                    <div>
                      <strong>Texte gravé:</strong> {engravingText}
                    </div>
                  )}
                  {engravingImage && (
                    <div>
                      <strong>Image gravée:</strong> ✓
                    </div>
                  )}
                  <div>
                    <strong>Position:</strong> {currentView}
                  </div>
                  <div>
                    <strong>Style:</strong> {engravingStyle}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg max-w-xs">
                <h4 className="font-medium mb-2 text-sm">Instructions</h4>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• Utilisez les boutons pour faire pivoter</li>
                  <li>• Zoom + et - pour ajuster la taille</li>
                  <li>• Cliquez sur les vues pour changer d'angle</li>
                  <li>• Reset pour revenir à la vue initiale</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

