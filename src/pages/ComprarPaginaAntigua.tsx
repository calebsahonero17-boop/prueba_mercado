import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, MapPin, Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { Button, Card, Input, Badge } from '../components/ui';
import ProductDetailModal from '../components/ui/ProductDetailModal';

interface BuyPageProps {
  onNavigate: (page: string) => void;
}

function BuyPage({ onNavigate }: BuyPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const { addItem } = useCart();
  const toast = useToast();

  const categories = [
    { id: 'all', name: 'Todas las categorías' },
    { id: 'electronics', name: 'Electrónicos' },
    { id: 'clothing', name: 'Ropa y Accesorios' },
    { id: 'home', name: 'Hogar' },
    { id: 'crafts', name: 'Artesanías' },
    { id: 'vehicles', name: 'Vehículos' }
  ];

  const locations = [
    { id: 'all', name: 'Toda Bolivia' },
    { id: 'la-paz', name: 'La Paz' },
    { id: 'cochabamba', name: 'Cochabamba' },
    { id: 'santa-cruz', name: 'Santa Cruz' },
    { id: 'oruro', name: 'Oruro' },
    { id: 'potosi', name: 'Potosí' }
  ];

  const featuredProducts: Product[] = [
    {
      id: 1,
      title: "iPhone 12 128GB Usado",
      price: 3200,
      location: "La Paz",
      condition: "Muy bueno",
      image: "📱",
      seller: "Carlos M.",
      rating: 4.8,
      reviews: 15,
      featured: true,
      category: "electronics",
      description: "iPhone 12 en excelente estado, batería al 95%, incluye cargador original y caja. Sin golpes ni rayones.",
      availability: "available"
    },
    {
      id: 2,
      title: "Artesanía Tejido Aguayo",
      price: 85,
      location: "Cochabamba",
      condition: "Nuevo",
      image: "🧶",
      seller: "María Q.",
      rating: 5.0,
      reviews: 23,
      featured: false,
      category: "crafts",
      description: "Hermoso tejido tradicional aguayo hecho a mano por artesanas de Cochabamba. Colores vibrantes y auténticos.",
      availability: "available"
    },
    {
      id: 3,
      title: "Laptop Dell Inspiron",
      price: 2800,
      location: "Santa Cruz",
      condition: "Bueno",
      image: "💻",
      seller: "Ana R.",
      rating: 4.9,
      reviews: 8,
      featured: true,
      category: "electronics",
      description: "Laptop Dell Inspiron 15 con Intel i5, 8GB RAM, 512GB SSD. Ideal para trabajo y estudios.",
      availability: "available"
    },
    {
      id: 4,
      title: "Bicicleta Montañera",
      price: 450,
      location: "La Paz",
      condition: "Muy bueno",
      image: "🚲",
      seller: "Jorge L.",
      rating: 4.7,
      reviews: 12,
      featured: false,
      category: "vehicles",
      description: "Bicicleta de montaña Trek 21 velocidades, frenos de disco, perfecta para ciclismo urbano y de montaña.",
      availability: "available"
    },
    {
      id: 5,
      title: "Set Ollas de Cocina",
      price: 120,
      location: "Oruro",
      condition: "Nuevo",
      image: "🍳",
      seller: "Rosa M.",
      rating: 4.8,
      reviews: 6,
      featured: false,
      category: "home",
      description: "Set completo de ollas antiadherentes de 7 piezas, incluye tapas y utensilios. Nuevas en caja.",
      availability: "available"
    },
    {
      id: 6,
      title: "Guitarra Acústica",
      price: 380,
      location: "Cochabamba",
      condition: "Bueno",
      image: "🎸",
      seller: "Pedro S.",
      rating: 4.6,
      reviews: 19,
      featured: false,
      category: "electronics",
      description: "Guitarra acústica Yamaha F310, sonido cálido, cuerdas nuevas. Incluye funda y púas.",
      availability: "available"
    }
  ];

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleToggleFavorite = (productId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast.success(
      `${product.title} agregado al carrito`,
      'Producto agregado'
    );
  };

  const filteredProducts = featuredProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || product.location.toLowerCase().includes(selectedLocation);
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="p-2 text-gray-600 hover:text-blue-700 mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explorar Productos</h1>
            <p className="text-gray-600 mt-1">Encuentra productos únicos de vendedores bolivianos</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card variant="elevated" padding="lg" className="mb-8 animate-slide-up">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <Input
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos..."
                variant="outlined"
              />
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="lg:w-48">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="primary" size="md" icon={Filter} className="lg:w-auto w-full">
              Filtrar
            </Button>
          </div>
        </Card>

        {/* Quick Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Categorías Populares</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Celulares', icon: '📱', count: '2,450', category: 'electronics' },
              { name: 'Ropa', icon: '👕', count: '1,890', category: 'clothing' },
              { name: 'Hogar', icon: '🏠', count: '1,230', category: 'home' },
              { name: 'Artesanías', icon: '🧶', count: '890', category: 'crafts' },
              { name: 'Vehículos', icon: '🚗', count: '567', category: 'vehicles' },
              { name: 'Deportes', icon: '⚽', count: '445', category: 'sports' }
            ].map((cat, index) => (
              <Card
                key={index}
                variant="default"
                padding="md"
                hover={true}
                clickable={true}
                onClick={() => setSelectedCategory(cat.category)}
                className={`text-center cursor-pointer animate-fade-in group ${selectedCategory === cat.category ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <div className="font-medium text-gray-900">{cat.name}</div>
                <div className="text-sm text-gray-500">{cat.count} productos</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Productos Encontrados ({filteredProducts.length})
            </h2>
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>Más relevantes</option>
              <option>Precio: menor a mayor</option>
              <option>Precio: mayor a menor</option>
              <option>Más recientes</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <Card
                key={product.id}
                variant="elevated"
                padding="md"
                hover={true}
                className="overflow-hidden animate-fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {product.featured && (
                  <Badge variant="warning" className="absolute top-3 left-3 z-10">
                    🌟 DESTACADO
                  </Badge>
                )}

                {/* Product Image */}
                <div
                  className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-6xl cursor-pointer hover-scale"
                  onClick={() => handleViewDetails(product)}
                >
                  {product.image}
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <h3
                    className="font-bold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleViewDetails(product)}
                  >
                    {product.title}
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      Bs {product.price.toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(product.id)}
                      className={`p-2 ${favorites.has(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {product.location}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Estado: <span className="font-medium">{product.condition}</span>
                    </span>
                    <Badge
                      variant={product.availability === 'available' ? 'success' : 'danger'}
                      size="sm"
                    >
                      {product.availability === 'available' ? 'Disponible' : 'No disponible'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{product.rating}</span>
                      <span className="text-gray-500">({product.reviews})</span>
                    </div>
                    <span className="text-gray-600 font-medium">{product.seller}</span>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewDetails(product)}
                      className="flex-1"
                    >
                      Ver Detalles
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      icon={ShoppingCart}
                      onClick={() => handleAddToCart(product)}
                      className="hover-scale"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* QR Payment Reminder */}
        <Card variant="glass" padding="lg" className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-center animate-slide-up">
          <h3 className="text-2xl font-bold mb-4">Pago Seguro con QR</h3>
          <p className="text-lg mb-6 max-w-3xl mx-auto">
            Todos los productos incluyen pago seguro con QR. Paga con Tigo Money, Yape Bolivia, Alto Ke o Simple QR
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { name: 'Tigo Money', icon: '🔷' },
              { name: 'Yape Bolivia', icon: '💜' },
              { name: 'Alto Ke', icon: '🔴' },
              { name: 'Simple QR', icon: '💚' }
            ].map((payment, index) => (
              <div
                key={index}
                className="bg-white/20 rounded-lg p-3 text-center hover:bg-white/30 transition-colors cursor-pointer hover-scale"
              >
                <div className="text-2xl mb-1">{payment.icon}</div>
                <div className="font-medium">{payment.name}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default BuyPage;