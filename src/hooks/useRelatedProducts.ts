import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/product';

export const useRelatedProducts = (categoryId: string | undefined, currentProductId: string | undefined) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!categoryId || !currentProductId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('category_id', categoryId)
          .neq('id', currentProductId)
          .order('created_at', { ascending: false })
          .limit(4);

        if (supabaseError) throw supabaseError;
        if (data) setRelatedProducts(data as Product[]);
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Failed to fetch related products'));
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [categoryId, currentProductId]);

  return { relatedProducts, loading, error };
};
