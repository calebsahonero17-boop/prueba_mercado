import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';

interface AdminStats {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: number;
  categoriesCount: { [key: string]: number };
  topCategories: Array<{ name: string; count: number; percentage: number }>;
  stockStatus: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  recentProducts: Product[];
  priceRanges: {
    under50: number;
    between50and200: number;
    between200and500: number;
    over500: number;
  };
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      console.log('📊 Fetching admin statistics...');
      setLoading(true);
      setError(null);

      // Fetch all products
      const { data: products, error: productsError } = await supabase
        .from('productos')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (productsError) {
        throw productsError;
      }

      const productList = products || [];

      // Calculate basic metrics
      const totalProducts = productList.length;
      const totalValue = productList.reduce((sum, product) => sum + (product.precio * product.stock), 0);
      const lowStockProducts = productList.filter(product => product.stock <= 5 && product.stock > 0).length;

      // Categories count
      const categoriesCount: { [key: string]: number } = {};
      productList.forEach(product => {
        const category = product.categoria || 'Sin categoría';
        categoriesCount[category] = (categoriesCount[category] || 0) + 1;
      });

      // Top categories with percentages
      const topCategories = Object.entries(categoriesCount)
        .map(([name, count]) => ({
          name,
          count,
          percentage: totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Stock status
      const stockStatus = {
        inStock: productList.filter(product => product.stock > 5).length,
        lowStock: productList.filter(product => product.stock <= 5 && product.stock > 0).length,
        outOfStock: productList.filter(product => product.stock === 0).length,
      };

      // Recent products (last 5)
      const recentProducts = productList.slice(0, 5);

      // Price ranges
      const priceRanges = {
        under50: productList.filter(product => product.precio < 50).length,
        between50and200: productList.filter(product => product.precio >= 50 && product.precio < 200).length,
        between200and500: productList.filter(product => product.precio >= 200 && product.precio < 500).length,
        over500: productList.filter(product => product.precio >= 500).length,
      };

      const adminStats: AdminStats = {
        totalProducts,
        totalValue,
        lowStockProducts,
        categoriesCount,
        topCategories,
        stockStatus,
        recentProducts,
        priceRanges,
      };

      console.log('✅ Admin statistics calculated:', adminStats);
      setStats(adminStats);
    } catch (err) {
      console.error('❌ Error fetching admin stats:', err);
      setError(err instanceof Error ? err.message : 'Error loading statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = fetchStats;

  return {
    stats,
    loading,
    error,
    refetch,
  };
}