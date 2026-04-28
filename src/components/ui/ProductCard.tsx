// src/components/ui/ProductCard.tsx
// MUDANÇAS FEITAS NESSE ARQUIVO:
// 1. Importado useCart
// 2. Botão "Adicionar ao Carrinho" agora chama addToCart de verdade
// 3. Ícone muda se o produto já está no carrinho
// 4. Botão desabilitado se produto está sem estoque

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';        // NOVO

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
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
            disabled={outOfStock}
            className={`btn-add-cart ${justAdded || isInCart ? 'added' : ''}`}
            title={outOfStock ? 'Produto esgotado' : isInCart ? 'Já no carrinho' : 'Adicionar ao carrinho'}
          >
            {/* Ícone muda dependendo do estado */}
            {justAdded ? <Check size={18} /> : isInCart ? <Check size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;