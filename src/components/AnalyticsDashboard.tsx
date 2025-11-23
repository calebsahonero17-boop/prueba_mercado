import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, Button } from './ui';

interface AnalyticsData {
  totalVentas: number;
  ventasEsteMes: number;
  totalUsuarios: number;
  usuariosActivos: number;
  totalProductos: number;
  productosStock: number;
  ingresoTotal: number;
  ingresoEsteMes: number;
  ventasPorDia: Array<{ fecha: string; ventas: number; ingresos: number }>;
  ventasPorCategoria: Array<{ categoria: string; ventas: number; ingresos: number }>;
  productosPopulares: Array<{ nombre: string; ventas: number; categoria: string }>;
  crecimientoMensual: number;
}

interface AnalyticsDashboardProps {
  refreshTrigger?: number;
}

function AnalyticsDashboard({ refreshTrigger = 0 }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData>({
    totalVentas: 0,
    ventasEsteMes: 0,
    totalUsuarios: 0,
    usuariosActivos: 0,
    totalProductos: 0,
    productosStock: 0,
    ingresoTotal: 0,
    ingresoEsteMes: 0,
    ventasPorDia: [],
    ventasPorCategoria: [],
    productosPopulares: [],
    crecimientoMensual: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Fetching analytics data...');

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Total de ventas
      const { data: totalVentasData, error: ventasError } = await supabase
        .from('pedidos')
        .select('id, total, fecha_creacion')
        .eq('estado', 'completado');

      if (ventasError) throw ventasError;

      // Ventas de este mes
      const ventasEsteMes = totalVentasData?.filter(
        venta => new Date(venta.fecha_creacion) >= startOfMonth
      ) || [];

      // Ventas del mes pasado para calcular crecimiento
      const ventasMesPasado = totalVentasData?.filter(
        venta => new Date(venta.fecha_creacion) >= startOfLastMonth &&
                 new Date(venta.fecha_creacion) <= endOfLastMonth
      ) || [];

      // Total de usuarios
      const { count: totalUsuarios, error: usuariosError } = await supabase
        .from('perfiles')
        .select('*', { count: 'exact', head: true });

      if (usuariosError) throw usuariosError;

      // Usuarios activos (que han hecho al menos un pedido)
      const { data: usuariosActivosData, error: activosError } = await supabase
        .from('perfiles')
        .select('id')
        .in('id', totalVentasData?.map(v => v.id) || []);

      if (activosError) console.warn('Error fetching active users:', activosError);

      // Total de productos
      const { count: totalProductos, error: productosError } = await supabase
        .from('productos')
        .select('*', { count: 'exact', head: true });

      if (productosError) throw productosError;

      // Productos con stock
      const { count: productosStock, error: stockError } = await supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .gt('stock', 0);

      if (stockError) throw stockError;

      // Ventas por día (últimos 7 días)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const ventasPorDia = last7Days.map(fecha => {
        const ventasDelDia = totalVentasData?.filter(
          venta => venta.fecha_creacion.split('T')[0] === fecha
        ) || [];

        return {
          fecha,
          ventas: ventasDelDia.length,
          ingresos: ventasDelDia.reduce((sum, venta) => sum + (venta.total || 0), 0)
        };
      });

      // Ventas por categoría
      const { data: ventasPorCategoriaData, error: categoriaError } = await supabase
        .from('detalle_pedidos')
        .select(`
          cantidad,
          precio_unitario,
          productos!inner(categoria)
        `)
        .in('pedido_id', totalVentasData?.map(v => v.id) || []);

      if (categoriaError) console.warn('Error fetching category data:', categoriaError);

      const categoriasMap = new Map();
      ventasPorCategoriaData?.forEach(detalle => {
        const categoria = detalle.productos.categoria;
        const current = categoriasMap.get(categoria) || { ventas: 0, ingresos: 0 };
        categoriasMap.set(categoria, {
          ventas: current.ventas + detalle.cantidad,
          ingresos: current.ingresos + (detalle.cantidad * detalle.precio_unitario)
        });
      });

      const ventasPorCategoria = Array.from(categoriasMap.entries()).map(([categoria, stats]) => ({
        categoria,
        ventas: stats.ventas,
        ingresos: stats.ingresos
      }));

      // Productos más populares
      const productosMap = new Map();
      ventasPorCategoriaData?.forEach(detalle => {
        const producto = detalle.productos;
        const current = productosMap.get(producto.categoria) || { ventas: 0 };
        productosMap.set(producto.categoria, {
          nombre: producto.categoria, // Simplificado por ahora
          ventas: current.ventas + detalle.cantidad,
          categoria: producto.categoria
        });
      });

      const productosPopulares = Array.from(productosMap.values())
        .sort((a, b) => b.ventas - a.ventas)
        .slice(0, 5);

      // Calcular totales
      const ingresoTotal = totalVentasData?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;
      const ingresoEsteMes = ventasEsteMes.reduce((sum, venta) => sum + (venta.total || 0), 0);
      const ingresoMesPasado = ventasMesPasado.reduce((sum, venta) => sum + (venta.total || 0), 0);

      const crecimientoMensual = ingresoMesPasado > 0
        ? ((ingresoEsteMes - ingresoMesPasado) / ingresoMesPasado) * 100
        : 0;

      setData({
        totalVentas: totalVentasData?.length || 0,
        ventasEsteMes: ventasEsteMes.length,
        totalUsuarios: totalUsuarios || 0,
        usuariosActivos: usuariosActivosData?.length || 0,
        totalProductos: totalProductos || 0,
        productosStock: productosStock || 0,
        ingresoTotal,
        ingresoEsteMes,
        ventasPorDia,
        ventasPorCategoria,
        productosPopulares,
        crecimientoMensual
      });

      console.log('✅ Analytics data loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      setError('Error al cargar los datos de analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [refreshTrigger]);

  // Función para exportar datos a CSV
  const exportToCSV = (csvData: any[], filename: string) => {
    if (csvData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Obtener las cabeceras del primer objeto
    const headers = Object.keys(csvData[0]);

    // Crear el contenido CSV
    const csvContent = [
      headers.join(','), // Cabeceras
      ...csvData.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escapar comillas y envolver en comillas si contiene comas
          return typeof value === 'string' && value.includes(',')
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar resumen general
  const exportResumenGeneral = () => {
    const resumenData = [{
      'Total_Ventas': data.totalVentas,
      'Ventas_Este_Mes': data.ventasEsteMes,
      'Total_Usuarios': data.totalUsuarios,
      'Usuarios_Activos': data.usuariosActivos,
      'Total_Productos': data.totalProductos,
      'Productos_En_Stock': data.productosStock,
      'Ingreso_Total_Bs': data.ingresoTotal.toFixed(2),
      'Ingreso_Este_Mes_Bs': data.ingresoEsteMes.toFixed(2),
      'Crecimiento_Mensual_Porcentaje': data.crecimientoMensual.toFixed(2),
      'Promedio_Por_Venta_Bs': data.totalVentas > 0 ? (data.ingresoTotal / data.totalVentas).toFixed(2) : '0.00',
      'Fecha_Reporte': new Date().toLocaleDateString('es-BO')
    }];

    exportToCSV(resumenData, 'resumen_general_mercado_express');
  };

  // Exportar ventas por día
  const exportVentasPorDia = () => {
    const ventasData = data.ventasPorDia.map(dia => ({
      'Fecha': dia.fecha,
      'Fecha_Formateada': new Date(dia.fecha).toLocaleDateString('es-BO'),
      'Cantidad_Ventas': dia.ventas,
      'Ingresos_Bs': dia.ingresos.toFixed(2)
    }));

    exportToCSV(ventasData, 'ventas_por_dia_mercado_express');
  };

  // Exportar ventas por categoría
  const exportVentasPorCategoria = () => {
    const categoriaData = data.ventasPorCategoria.map(cat => ({
      'Categoria': cat.categoria,
      'Cantidad_Vendida': cat.ventas,
      'Ingresos_Bs': cat.ingresos.toFixed(2),
      'Porcentaje_Del_Total': data.totalVentas > 0 ? ((cat.ventas / data.totalVentas) * 100).toFixed(2) + '%' : '0%'
    }));

    exportToCSV(categoriaData, 'ventas_por_categoria_mercado_express');
  };

  // Exportar productos populares
  const exportProductosPopulares = () => {
    const productosData = data.productosPopulares.map((prod, index) => ({
      'Ranking': index + 1,
      'Producto': prod.nombre,
      'Categoria': prod.categoria,
      'Cantidad_Vendida': prod.ventas,
      'Porcentaje_Del_Total': data.totalVentas > 0 ? ((prod.ventas / data.totalVentas) * 100).toFixed(2) + '%' : '0%'
    }));

    exportToCSV(productosData, 'productos_populares_mercado_express');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} variant="elevated" padding="lg">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="elevated" padding="lg" className="mb-8">
        <div className="text-center text-red-600">
          <Activity className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 mb-8">
      {/* Header con botones de exportación */}
      <Card variant="elevated" padding="lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">Exporta tus datos para análisis externo</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={exportResumenGeneral}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Resumen General
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={exportVentasPorDia}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              Ventas por Día
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={exportVentasPorCategoria}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Por Categoría
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={exportProductosPopulares}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Productos Top
            </Button>
          </div>
        </div>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ventas Totales</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalVentas}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowUp className="w-3 h-3 mr-1" />
                {data.ventasEsteMes} este mes
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">Bs {data.ingresoTotal.toFixed(2)}</p>
              <p className={`text-xs flex items-center mt-1 ${
                data.crecimientoMensual >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.crecimientoMensual >= 0 ? (
                  <ArrowUp className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(data.crecimientoMensual).toFixed(1)}% vs mes anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Usuarios Registrados</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalUsuarios}</p>
              <p className="text-xs text-blue-600 flex items-center mt-1">
                <Activity className="w-3 h-3 mr-1" />
                {data.usuariosActivos} activos
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Productos</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalProductos}</p>
              <p className="text-xs text-orange-600 flex items-center mt-1">
                <Package className="w-3 h-3 mr-1" />
                {data.productosStock} en stock
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por día */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ventas por Día (Últimos 7 días)</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {data.ventasPorDia.map((dia, index) => {
              const maxVentas = Math.max(...data.ventasPorDia.map(d => d.ventas));
              const width = maxVentas > 0 ? (dia.ventas / maxVentas) * 100 : 0;

              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-gray-600">
                    {new Date(dia.fecha).toLocaleDateString('es-BO', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-xs text-gray-900 text-right">
                    {dia.ventas}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Ventas por categoría */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ventas por Categoría</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {data.ventasPorCategoria.slice(0, 6).map((categoria, index) => {
              const maxVentas = Math.max(...data.ventasPorCategoria.map(c => c.ventas));
              const width = maxVentas > 0 ? (categoria.ventas / maxVentas) * 100 : 0;
              const colors = [
                'bg-blue-500',
                'bg-green-500',
                'bg-yellow-500',
                'bg-purple-500',
                'bg-pink-500',
                'bg-indigo-500'
              ];

              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-gray-600 truncate">
                    {categoria.categoria}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                    <div
                      className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-xs text-gray-900 text-right">
                    {categoria.ventas} vendidos
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Productos más populares */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Productos Más Populares</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.productosPopulares.map((producto, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold text-sm">#{index + 1}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">{producto.nombre}</p>
              <p className="text-xs text-gray-600">{producto.categoria}</p>
              <p className="text-sm font-bold text-blue-600 mt-1">{producto.ventas} vendidos</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Resumen financiero */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Resumen Financiero</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-1">Ingresos Este Mes</p>
            <p className="text-2xl font-bold text-green-700">Bs {data.ingresoEsteMes.toFixed(2)}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">Promedio por Venta</p>
            <p className="text-2xl font-bold text-blue-700">
              Bs {data.totalVentas > 0 ? (data.ingresoTotal / data.totalVentas).toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 mb-1">Crecimiento Mensual</p>
            <p className={`text-2xl font-bold ${
              data.crecimientoMensual >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {data.crecimientoMensual >= 0 ? '+' : ''}{data.crecimientoMensual.toFixed(1)}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AnalyticsDashboard;