import React from 'react';
import { Calendar, Users, UserSquare, Newspaper, Rss, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';

const menuItems = [
  { icon: Calendar, text: 'Eventos', description: 'Organiza o busca eventos y actividades online o cerca de ti.', path: '/events' },
  { icon: Users, text: 'Amigos', description: 'Busca amigos o personas que quizá conozcas.', path: '/friends' },
  { icon: UserSquare, text: 'Grupos', description: 'Conéctate con personas que comparten tus mismos intereses.', path: '/groups' },
  { icon: Newspaper, text: 'Noticias', description: 'Mira publicaciones relevantes de personas y páginas que sigues.', path: '/news' },
  { icon: Rss, text: 'Feeds', description: 'Mira publicaciones más recientes de amigos, grupos y páginas.', path: '/feeds' },
  { icon: Flag, text: 'Páginas', description: 'Descubre negocios y conéctate con ellos.', path: '/pages' },
];

const Sidebar: React.FC = () => {
  return (
    <div className="w-80 bg-white p-4 space-y-2">
      {menuItems.map((item, index) => (
        <Link to={item.path} key={index} className="flex items-center p-2 rounded-lg hover:bg-gray-100">
          <item.icon className="w-6 h-6 text-blue-600" />
          <div className="ml-4">
            <p className="font-semibold text-gray-800">{item.text}</p>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
