import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/product';

export const useTrendingProducts = () => {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*, categories(name)')
          .order('created_at', { ascending: false })
          .limit(3);

        if (supabaseError) throw supabaseError;
        if (data) setTrendingProducts(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Failed to fetch trending products'));
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return { trendingProducts, loading, error };
};
