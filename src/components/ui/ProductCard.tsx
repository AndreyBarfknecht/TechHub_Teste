import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock_quantity <= 0) return;

    setIsAdding(true);
    
    // Adiciona ao carrinho global
    addToCart(product, 1);
    
    // Feedback visual
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }, 500);
  };

  const coverImage = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : null;
  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <Link to={`/product/${product.id}`} className={`product-card card ${isOutOfStock ? 'out-of-stock' : ''}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', opacity: isOutOfStock ? 0.8 : 1 }}>
      <div
        className="product-image"
        style={{
          backgroundImage: coverImage ? `url(${coverImage})` : 'none',
          backgroundColor: coverImage ? 'transparent' : '#f5f5f5',
          position: 'relative'
        }}
      >
        {!coverImage && <div className="image-placeholder" />}
        {isOutOfStock && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            zIndex: 1
          }}>
            ESGOTADO
          </div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">
          {product.description || 'Sem descrição disponível'}
        </p>
        <div className="product-footer">
          <span className="product-price">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <button
            onClick={handleAddToCart}
            className={`btn-add-cart ${isAdded ? 'added' : ''}`}
            disabled={isAdding || isOutOfStock}
            style={{
              backgroundColor: isOutOfStock ? '#ccc' : undefined,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
            }}
          >
            {isAdding ? '...' : isAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
