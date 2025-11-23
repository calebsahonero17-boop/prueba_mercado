import React from 'react';
import { Heart } from 'lucide-react';

interface SocialProductItem {
  id: string;
  imageUrl: string;
  creatorHandle: string;
  productName: string;
  productPrice: string;
}

const socialProductItems: SocialProductItem[] = [
  {
    id: '1',
    imageUrl: '/images/placeholder_social_product.jpg',
    creatorHandle: '@makeupby_montselezama',
    productName: 'Secret Clinical Strength Invisible Solid Antiperspirant and Deodorant, Completely Clean, 2.6 oz',
    productPrice: 'Bs.13.97',
  },
  {
    id: '2',
    imageUrl: '/images/placeholder_social_product.jpg',
    creatorHandle: '@milestriesthings',
    productName: 'Old Spice Men\'s Body Wash Moisturize with Shea Butter, All Skin Types, 30 fl oz, Red',
    productPrice: 'Bs.10.47',
  },
  {
    id: '3',
    imageUrl: '/images/placeholder_social_product.jpg',
    creatorHandle: '@straw_berrycreamxx',
    productName: 'Walmart Hydrating Fragrance Mist, Coconut Hibiscus',
    productPrice: 'Bs.5.97',
  },
  {
    id: '4',
    imageUrl: '/images/placeholder_social_product.jpg',
    creatorHandle: '@savewithdulce1',
    productName: 'The Wizard of Oz Baby Layette Newborn Essentials G',
    productPrice: 'Bs.14.98',
  },
];

function SocialProductShowcase() {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Tendencias en redes sociales
          </h2>
          <p className="text-lg text-gray-600">Compra los favoritos de los creadores</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {socialProductItems.map((item) => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden shadow-lg">
              <img src={item.imageUrl} alt="Product from social media" className="w-full h-48 object-cover" />
              <div className="p-4 bg-white">
                <p className="text-sm text-gray-600 mb-1">{item.creatorHandle}</p>
                <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{item.productName}</h3>
                <p className="text-lg font-bold text-gray-800 mt-2">{item.productPrice}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SocialProductShowcase;
