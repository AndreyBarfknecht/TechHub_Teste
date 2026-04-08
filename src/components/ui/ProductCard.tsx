import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import { ShoppingCart, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    // Simulating API call
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }, 800);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div
        className="product-image"
        style={{
          backgroundImage: product.image_url ? `url(${product.image_url})` : 'none',
          backgroundColor: product.image_url ? 'transparent' : '#f5f5f5',
        }}
      >
        {!product.image_url && <div className="image-placeholder" />}
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
            disabled={isAdding}
          >
            {isAdding ? '...' : isAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
