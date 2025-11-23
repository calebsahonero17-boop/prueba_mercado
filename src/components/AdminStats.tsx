import React, { useEffect, useRef } from 'react';
import {
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Eye,
  Clock,
  Target
} from 'lucide-react';
import { Card } from './ui';
import { useAdminStats } from '../hooks/useAdminStats';

interface AdminStatsProps {
  refreshTrigger?: number;
}

function AdminStats({ refreshTrigger }: AdminStatsProps) {
  const { stats, loading, error, refetch } = useAdminStats();
  const lastTriggerRef = useRef(0);

  // Refetch stats when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && refreshTrigger !== lastTriggerRef.current) {
      console.log('🔄 Refreshing admin stats... trigger:', refreshTrigger);
      lastTriggerRef.current = refreshTrigger;
      refetch();
    }
  }, [refreshTrigger, refetch]);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="mb-8">
        <Card variant="elevated" padding="lg" className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Error cargando estadísticas</p>
        </Card>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => {
    const colorClasses = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      yellow: "bg-yellow-100 text-yellow-600",
      red: "bg-red-100 text-red-600",
      purple: "bg-purple-100 text-purple-600",
    };

    return (
      <Card variant="elevated" padding="lg" className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          title="Total Productos"
          value={stats.totalProducts}
          subtitle="en inventario"
          color="blue"
        />

        <StatCard
          icon={DollarSign}
          title="Valor Total"
          value={`Bs ${stats.totalValue.toLocaleString()}`}
          subtitle="inventario completo"
          color="green"
        />

        <StatCard
          icon={AlertTriangle}
          title="Stock Bajo"
          value={stats.lowStockProducts}
          subtitle="productos con ≤5 unidades"
          color="yellow"
        />

        <StatCard
          icon={TrendingUp}
          title="Categorías"
          value={Object.keys(stats.categoriesCount).length}
          subtitle="categorías activas"
          color="purple"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Categories */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Top Categorías</h3>
          </div>
          <div className="space-y-3">
            {stats.topCategories.slice(0, 4).map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{category.count}</div>
                  <div className="text-xs text-gray-500">{category.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Stock Status */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Estado Stock</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-700">En Stock</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.stockStatus.inStock}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-700">Stock Bajo</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.stockStatus.lowStock}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-700">Agotado</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.stockStatus.outOfStock}</span>
            </div>
          </div>
        </Card>

        {/* Recent Products */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Recientes</h3>
          </div>
          <div className="space-y-3">
            {stats.recentProducts.slice(0, 4).map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <img
                  src={product.url_imagen || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40'}
                  alt={product.nombre}
                  className="w-8 h-8 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.nombre}</p>
                  <p className="text-xs text-gray-500">{product.categoria}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-900">Bs {product.precio}</p>
                  <p className="text-xs text-gray-500">{product.stock} und</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Price Distribution */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Distribución de Precios</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.priceRanges.under50}</div>
            <div className="text-sm text-gray-600">Menos de Bs 50</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.priceRanges.between50and200}</div>
            <div className="text-sm text-gray-600">Bs 50 - 200</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.priceRanges.between200and500}</div>
            <div className="text-sm text-gray-600">Bs 200 - 500</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.priceRanges.over500}</div>
            <div className="text-sm text-gray-600">Más de Bs 500</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AdminStats;