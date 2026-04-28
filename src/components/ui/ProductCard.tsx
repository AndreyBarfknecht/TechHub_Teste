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

  return (
    <Link to={`/product/${product.id}`} className="product-card card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div
        className="product-image"
        style={{
          backgroundImage: coverImage ? `url(${coverImage})` : 'none',
          backgroundColor: coverImage ? 'transparent' : '#f5f5f5',
        }}
      >
        {!coverImage && <div className="image-placeholder" />}
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
