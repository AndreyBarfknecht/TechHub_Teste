import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Review, ReviewSubmission } from '../types/review';

export const useProductReviews = (productId: string | undefined) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setReviews(data as Review[]);
    } catch (err: unknown) {
      console.error('Error fetching reviews:', err);
      setError('Erro ao carregar avaliações.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = async (submission: ReviewSubmission) => {
    try {
      const { error: supabaseError } = await supabase
        .from('reviews')
        .insert(submission);

      if (supabaseError) {
        if (supabaseError.code === '23505') {
          throw new Error('Você já avaliou este produto.');
        }
        throw supabaseError;
      }
      
      await fetchReviews();
      return { success: true };
    } catch (err: unknown) {
      console.error('Error submitting review:', err);
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Erro ao enviar avaliação.' 
      };
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
    : 0;

  return { reviews, loading, error, submitReview, averageRating, refreshReviews: fetchReviews };
};
