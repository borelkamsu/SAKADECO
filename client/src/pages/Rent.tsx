import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import RentalBooking from "@/components/RentalBooking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Handshake, Clock, RotateCcw } from "lucide-react";

export default function Rent() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products", { category: "rent" }],
  });

  const rentalProducts = [
    {
      id: "1",
      name: "Vaisselle & Linge",
      description: "Nappes, serviettes, assiettes élégantes",
      price: "5",
      imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "2", 
      name: "Structures & Arches",
      description: "Gonflables, arches, photobooth",
      price: "25",
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "3",
      name: "Mobilier Festif", 
      description: "Tables, chaises, éléments déco",
      price: "15",
      imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <Layout>
      {/* Header */}
      <section className="py-20 bg-gradient-to-br from-skd-rent/10 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-skd-rent rounded-full mb-6">
              <Handshake className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-playfair font-bold text-gray-800 mb-4">SKD Rent</h1>
            <p className="text-xl text-gray-600 mb-2">Location de matériel festif</p>
            <p className="text-lg font-playfair text-skd-rent italic">« Louez l'élégance. Célébrez sans limites »</p>
          </div>
        </div>
      </section>

      {/* Rental Schedule */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="border-2 border-skd-rent/20 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-playfair text-gray-800">Créneaux de Retrait/Retour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-skd-rent/10 rounded-lg">
                  <Clock className="w-12 h-12 text-skd-rent mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-800 mb-2">Retrait</h4>
                  <p className="text-lg font-playfair text-skd-rent">Vendredi 17h30-19h30</p>
                </div>
                <div className="text-center p-6 bg-skd-rent/10 rounded-lg">
                  <RotateCcw className="w-12 h-12 text-skd-rent mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-800 mb-2">Retour</h4>
                  <p className="text-lg font-playfair text-skd-rent">Dimanche 15h30-17h30</p>
                </div>
              </div>
              <p className="text-center text-gray-600 mt-6 text-sm">
                Veuillez vous assurer d'être disponible pendant ces créneaux horaires
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-playfair font-semibold text-gray-800">Matériel Disponible</h2>
            <Badge variant="outline" className="border-skd-rent text-skd-rent">
              Location avec retrait/retour
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {rentalProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-skd-rent/30">
                <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                  <img 
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="font-playfair">{product.name}</CardTitle>
                  <p className="text-gray-600">{product.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-skd-rent">
                      Dès {product.price}€/jour
                    </span>
                    <Button 
                      size="sm" 
                      className="bg-skd-rent hover:bg-skd-rent/90 text-white"
                      onClick={() => setSelectedProduct(product)}
                    >
                      Réserver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rental Booking Modal */}
      {selectedProduct && (
        <RentalBooking
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Info Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-playfair font-semibold text-gray-800 mb-8">Informations Importantes</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-skd-rent">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-800 mb-3">🕐 Créneaux Fixes</h4>
                <p className="text-gray-600">
                  Aucun retrait n'est possible en dehors des créneaux définis, 
                  sauf en cas d'événement exceptionnel.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-skd-rent">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-800 mb-3">📋 Disponibilité</h4>
                <p className="text-gray-600">
                  Vérifiez la disponibilité de votre matériel avant de confirmer 
                  votre réservation pour éviter toute déception.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
