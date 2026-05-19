import React, { useState, useRef } from 'react';
import { Star, MessageCircle, AlertCircle, CheckCircle, Image as ImageIcon, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProductReviews } from '../../hooks/useProductReviews';
import { supabase } from '../../lib/supabase';
import './ProductReviews.css';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const { reviews, loading, submitReview, averageRating } = useProductReviews(productId);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        setFormMessage({ type: 'error', text: 'A imagem deve ter no máximo 5MB.' });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setFormMessage(null);

    let imageUrl: string | undefined = undefined;

    if (selectedFile) {
      try {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('review-images')
          .upload(filePath, selectedFile);
          
        if (uploadError) {
          console.error("Upload error:", uploadError);
          // Proceed without image if it fails, but user is warned. Or abort.
          // Let's abort
          setFormMessage({ type: 'error', text: 'Erro ao fazer upload da imagem.' });
          setSubmitting(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('review-images')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      } catch (err) {
        console.error(err);
      }
    }

    const result = await submitReview({
      product_id: productId,
      user_id: user.id,
      rating,
      comment,
      image_url: imageUrl
    });

    if (result.success) {
      setFormMessage({ type: 'success', text: 'Avaliação enviada com sucesso!' });
      setComment('');
      setRating(5);
      removeSelectedFile();
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
            size={interactive ? 28 : 16}
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
        <h2>Opiniões da Comunidade</h2>
      </div>

      <div className="reviews-layout">
        
        {/* LEFT/TOP: Input Form */}
        <div className="reviews-form-column">
          <div className="review-stats-card">
            <span className="avg-num">{averageRating.toFixed(1)}</span>
            {renderStars(Math.round(averageRating))}
            <span className="total-count">{reviews.length} avaliações</span>
          </div>

          <div className="review-form-card">
            {user ? (
              <form onSubmit={handleSubmit} className="review-form">
                <h3>Avalie este produto</h3>
                
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
                    rows={4}
                  />
                </div>

                <div className="form-group image-upload-group">
                  <label className="image-upload-label">Foto do produto (Opcional):</label>
                  {!imagePreview ? (
                    <button 
                      type="button" 
                      className="btn-upload-trigger"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon size={20} /> Anexar Imagem
                    </button>
                  ) : (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="review-image-preview" />
                      <button type="button" className="btn-remove-image" onClick={removeSelectedFile}>
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>

                {formMessage && (
                  <div className={`form-feedback ${formMessage.type}`}>
                    {formMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {formMessage.text}
                  </div>
                )}

                <button type="submit" disabled={submitting} className="btn-primary review-submit-btn">
                  {submitting ? 'Publicando...' : 'Publicar Avaliação'}
                </button>
              </form>
            ) : (
              <div className="login-prompt">
                <MessageCircle size={32} />
                <p>Faça login na sua conta para avaliar este produto e incluir fotos.</p>
                <a href="/login" className="btn-secondary">Fazer Login</a>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT/BOTTOM: List of Reviews */}
        <div className="reviews-list-column">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review-item-card">
                <div className="review-header-info">
                  <div className="review-user-info">
                    {review.profiles?.avatar_url ? (
                      <img src={review.profiles.avatar_url} alt="Avatar" className="review-avatar" />
                    ) : (
                      <div className="review-avatar-placeholder">
                        <User size={16} />
                      </div>
                    )}
                    <span className="user-name">{review.profiles?.full_name || 'Usuário'}</span>
                  </div>
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="review-rating-stars">
                  {renderStars(review.rating)}
                </div>
                
                <p className="review-comment-text">{review.comment}</p>
                
                {review.image_url && (
                  <div className="review-attached-image">
                    <img src={review.image_url} alt="Foto do Produto" />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-reviews-state">
              <MessageCircle size={48} color="var(--border)" />
              <p>Nenhuma avaliação ainda.<br/>Seja o primeiro a avaliar!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
