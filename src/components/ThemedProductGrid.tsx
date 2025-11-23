import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, Button } from './ui';

interface Product {
  id: string;
  imageUrl: string;
  name: string;
  currentPrice: string;
  oldPrice?: string;
  optionsAvailable: boolean;
  shippingCost?: string;
}

interface ThemedProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  themeColorClass?: string;
  viewAllLink?: string;
}

const defaultProducts: Product[] = [];

function ThemedProductGrid({ title, subtitle, products = defaultProducts, themeColorClass = 'text-blue-600', viewAllLink = '#' }: ThemedProductGridProps) {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {title}
            </h2>
            {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
          </div>
          <Button variant="link" className={`${themeColorClass} hover:${themeColorClass.replace('text-', 'text-opacity-75 ')}`}>
            Ver todo <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col p-4">
              <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover mb-4 rounded-lg" />
              <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
              <div className="flex items-baseline mb-1">
                <span className="text-lg font-bold text-gray-900">{product.currentPrice}</span>
                {product.oldPrice && (
                  <span className="text-sm text-gray-500 line-through ml-2">{product.oldPrice}</span>
                )}
              </div>
              {product.optionsAvailable && (
                <p className="text-xs text-gray-600 mb-2">Opciones</p>
              )}
              {product.shippingCost && (
                <p className="text-xs text-gray-600 mb-2">{product.shippingCost}</p>
              )}
              <Button variant="outline" className="mt-auto w-full">Agregar</Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ThemedProductGrid;
