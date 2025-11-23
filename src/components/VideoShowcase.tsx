import React from 'react';
import { PlayCircle } from 'lucide-react';

interface VideoItem {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  creatorHandle: string;
  productName: string;
  productPrice: string;
}

const videoItems: VideoItem[] = [
  {
    id: '1',
    videoUrl: '#',
    thumbnailUrl: '/images/placeholder_video_thumb.jpg',
    creatorHandle: '@monicascassi',
    productName: 'Soapbox Biotin & Superfruit Volumizing Shampoo wit',
    productPrice: 'Bs.7.97',
  },
  {
    id: '2',
    videoUrl: '#',
    thumbnailUrl: '/images/placeholder_video_thumb.jpg',
    creatorHandle: '@aprilt88',
    productName: 'Olay Cleansing & Nourishing Liquid Body Wash with Vitamin B3 and Hyaluronic Acid, 20 fl oz',
    productPrice: 'Bs.10.97',
  },
  {
    id: '3',
    videoUrl: '#',
    thumbnailUrl: '/images/placeholder_video_thumb.jpg',
    creatorHandle: '@white.at.home',
    productName: 'My Texas House Perry Extended Dining Table with Wa',
    productPrice: 'Bs.439.00',
  },
  {
    id: '4',
    videoUrl: '#',
    thumbnailUrl: '/images/placeholder_video_thumb.jpg',
    creatorHandle: '@thatlifestylebyjesse',
    productName: 'Dove Beauty Bar Women\'s Bath Soap Calming Oatmeal ',
    productPrice: 'Bs.7.97',
  },
];

function VideoShowcase() {
  return (
    <section className="py-4 sm:py-8 bg-gray-100">
      <div className="max-w-screen-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Destacado en videos
          </h2>
          <p className="text-lg text-gray-600">Mira lo que comparten los creadores</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {videoItems.map((item) => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden shadow-lg">
              <img src={item.thumbnailUrl} alt="Video thumbnail" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="w-16 h-16 text-white" />
              </div>
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

export default VideoShowcase;
