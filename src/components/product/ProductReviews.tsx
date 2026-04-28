import React, { useState } from 'react';
import { Star, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProductReviews } from '../../hooks/useProductReviews';
import './ProductReviews.css';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const { reviews, loading, submitReview, averageRating } = useProductReviews(productId);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setFormMessage(null);

    const result = await submitReview({
      product_id: productId,
      user_id: user.id,
      rating,
      comment
    });

    if (result.success) {
      setFormMessage({ type: 'success', text: 'Avaliação enviada com sucesso!' });
      setComment('');
      setRating(5);
    } else {
      setFormMessage({ type: 'error', text: result.message || 'Erro ao enviar avaliação.' });
    }
    setSubmitting(false);
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className={`stars-display ${interactive ? 'interactive' : ''}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={interactive ? 24 : 16}
            className={i <= count ? 'star-filled' : 'star-empty'}
            onClick={() => interactive && setRating(i)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />
        ))}
      </div>
    );
  };

  if (loading) return <div className="reviews-loading">Carregando avaliações...</div>;

  return (
    <div className="product-reviews-container">
      <div className="reviews-header">
        <h2>Avaliações dos Clientes</h2>
        <div className="reviews-summary">
          <div className="average-box">
            <span className="avg-num">{averageRating.toFixed(1)}</span>
            {renderStars(Math.round(averageRating))}
            <span className="total-count">{reviews.length} avaliações</span>
          </div>
        </div>
      </div>

      <div className="reviews-content">
        {/* Form Section */}
        <div className="review-form-section">
          {user ? (
            <form onSubmit={handleSubmit} className="review-form card">
              <h3>Deixe sua avaliação</h3>
              
              <div className="form-group">
                <label>Sua nota:</label>
                {renderStars(rating, true)}
              </div>

              <div className="form-group">
                <label htmlFor="comment">Seu comentário:</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte o que achou do produto..."
                  required
                />
              </div>

              {formMessage && (
                <div className={`form-feedback ${formMessage.type}`}>
                  {formMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {formMessage.text}
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Enviando...' : 'Publicar Avaliação'}
              </button>
            </form>
          ) : (
            <div className="login-prompt card">
              <MessageCircle size={32} />
              <p>Você precisa estar logado para avaliar este produto.</p>
              <a href="/login" className="btn-secondary">Fazer Login</a>
            </div>
          )}
        </div>

        {/* List Section */}
        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-meta">
                  <span className="user-name">{review.profiles?.full_name || 'Usuário'}</span>
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {renderStars(review.rating)}
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="empty-reviews">
              Nenhuma avaliação ainda. Seja o primeiro a avaliar!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
