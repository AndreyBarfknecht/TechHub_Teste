<<<<<<< HEAD
// src/components/ui/ProductCard.tsx
// MUDANÇAS FEITAS NESSE ARQUIVO:
// 1. Importado useCart
// 2. Botão "Adicionar ao Carrinho" agora chama addToCart de verdade
// 3. Ícone muda se o produto já está no carrinho
// 4. Botão desabilitado se produto está sem estoque

=======
>>>>>>> 7a5cf369077cc70a1e5a9519e22a7394b79ee433
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import { ShoppingCart, Check } from 'lucide-react';
<<<<<<< HEAD
import { useCart } from '../../context/CartContext';        // NOVO
=======
>>>>>>> 7a5cf369077cc70a1e5a9519e22a7394b79ee433

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
<<<<<<< HEAD
  const { addToCart, items } = useCart();                  // NOVO
  const [justAdded, setJustAdded] = useState(false);

  // Verifica se o produto já está no carrinho
  const isInCart = items.some(item => item.product.id === product.id);  // NOVO
  const outOfStock = product.stock_quantity === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();   // impede navegar pro detalhe ao clicar no botão
    e.stopPropagation();

    if (outOfStock) return;

    addToCart(product, 1);                                  // NOVO: chama o contexto real

    // Feedback visual de "adicionado"
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <div
          className="product-image"
          style={{
            backgroundImage: product.image_url ? `url("${product.image_url}")` : 'none',
            backgroundColor: product.image_url ? 'transparent' : '#f5f5f5',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
        {!product.image_url && <div className="image-placeholder" />}

        {/* Badge de sem estoque */}
        {outOfStock && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#dc2626',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '100px',
          }}>
            Esgotado
          </div>
        )}
=======
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
>>>>>>> 7a5cf369077cc70a1e5a9519e22a7394b79ee433
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
<<<<<<< HEAD
            disabled={outOfStock}
            className={`btn-add-cart ${justAdded || isInCart ? 'added' : ''}`}
            title={outOfStock ? 'Produto esgotado' : isInCart ? 'Já no carrinho' : 'Adicionar ao carrinho'}
          >
            {/* Ícone muda dependendo do estado */}
            {justAdded ? <Check size={18} /> : isInCart ? <Check size={18} /> : <ShoppingCart size={18} />}
=======
            className={`btn-add-cart ${isAdded ? 'added' : ''}`}
            disabled={isAdding}
          >
            {isAdding ? '...' : isAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
>>>>>>> 7a5cf369077cc70a1e5a9519e22a7394b79ee433
          </button>
        </div>
      </div>
    </Link>
  );
};

<<<<<<< HEAD
export default ProductCard;
=======
export default ProductCard;
>>>>>>> 7a5cf369077cc70a1e5a9519e22a7394b79ee433
