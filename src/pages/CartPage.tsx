// src/pages/CartPage.tsx
// Página principal do carrinho. Lista todos os itens e mostra o resumo do pedido.

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShippingCalculator } from '../components/cart/ShippingCalculator';
import './CartPage.css';

const CartPage = () => {
  const { items, totalPrice, totalItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shippingFee, setShippingFee] = React.useState<number>(totalPrice >= 200 ? 0 : 25.9);
  const [coupon, setCoupon] = React.useState('');
  const [discount, setDiscount] = React.useState<number>(0);

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };


  // Update shipping fee if totalPrice changes (handle free shipping threshold)
  React.useEffect(() => {
    if (totalPrice >= 200) {
      setShippingFee(0);
    }
  }, [totalPrice]);

  const handleApplyCoupon = () => {
    // Simulating a simple coupon system
    if (coupon.toUpperCase() === 'TECHHUB10') {
      setDiscount(totalPrice * 0.1);
    } else if (coupon.toUpperCase() === 'FRETEGRATIS') {
      setShippingFee(0);
      setDiscount(0);
    } else {
      alert('Cupom inválido');
      setDiscount(0);
    }
  };

  const orderTotal = totalPrice + shippingFee - discount;

  const formatBRL = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // ----- CARRINHO VAZIO -----
  if (items.length === 0) {
    return (
      <div className="cart-empty fade-in">
        <div className="cart-empty-inner">
          <div className="cart-empty-icon">
            <ShoppingCart size={64} strokeWidth={1.2} />
          </div>
          <h2>Seu carrinho está vazio</h2>
          <p>Explore nossa loja e adicione produtos incríveis ao carrinho.</p>
          <div className="cart-empty-actions">
            <Link to="/products" className="btn-primary cart-empty-btn">
              <ShoppingBag size={18} />
              Explorar Produtos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----- CARRINHO COM ITENS -----
  return (
    <div className="cart-page fade-in">
      <div className="container">

        {/* Cabeçalho */}
        <div className="cart-header">
          <div>
            <h1 className="cart-title">Meu Carrinho</h1>
            <p className="cart-subtitle">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</p>
          </div>
          <button className="cart-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Voltar
          </button>
        </div>

        <div className="cart-layout">

          {/* ===== COLUNA ESQUERDA: Lista de itens ===== */}
          <div className="cart-items-col">
            <div className="cart-items-header">
              <span>Produto</span>
              <button className="clear-cart-btn" onClick={clearCart}>
                Limpar carrinho
              </button>
            </div>

            <div className="cart-items-list">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="cart-item card">

                  {/* Imagem do produto */}
                  <div className="cart-item-image">
                    {product.image_urls && product.image_urls.length > 0 ? (
                      <img src={product.image_urls[0]} alt={product.name} />
                    ) : (
                      <div className="cart-item-image-placeholder">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>

                  {/* Informações do produto */}
                  <div className="cart-item-info">
                    <div className="cart-item-meta">
                      {product.category?.name && (
                        <span className="cart-item-category">{product.category.name}</span>
                      )}
                      <h3 className="cart-item-name">{product.name}</h3>
                      <p className="cart-item-unit-price">
                        {formatBRL(product.price)} cada
                      </p>
                    </div>

                    {/* Controles de quantidade + remover */}
                    <div className="cart-item-controls">
                      <div className="qty-controls">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-value">{quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock_quantity}
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        className="cart-remove-btn"
                        onClick={() => removeFromCart(product.id)}
                        aria-label="Remover item"
                      >
                        <Trash2 size={16} />
                        Remover
                      </button>
                    </div>
                  </div>

                  {/* Subtotal do item */}
                  <div className="cart-item-subtotal">
                    <span className="cart-item-subtotal-label">Subtotal</span>
                    <span className="cart-item-subtotal-value">
                      {formatBRL(product.price * quantity)}
                    </span>
                  </div>

                </div>
              ))}
            </div>

            {/* Link para continuar comprando */}
            <Link to="/products" className="continue-shopping-link">
              <ArrowLeft size={16} />
              Continuar Comprando
            </Link>
          </div>

          {/* ===== COLUNA DIREITA: Resumo do pedido ===== */}
          <div className="cart-summary-col">
            <div className="cart-summary card">
              <h2 className="cart-summary-title">Resumo do Pedido</h2>

              <div className="cart-summary-lines">
                <div className="summary-line">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
                  <span>{formatBRL(totalPrice)}</span>
                </div>

                <div className="summary-line">
                  <span>Frete</span>
                  <span className={shippingFee === 0 ? 'shipping-free' : ''}>
                    {shippingFee === 0 ? 'Grátis 🎉' : formatBRL(shippingFee)}
                  </span>
                </div>

                <div className="shipping-calculator-wrapper">
                  <ShippingCalculator
                    onShippingRateChange={(rate) => {
                      if (totalPrice < 200) {
                        setShippingFee(rate);
                      }
                    }}
                  />
                </div>

                {shippingFee > 0 && (
                  <p className="shipping-hint">
                    Faltam {formatBRL(200 - totalPrice)} para frete grátis
                  </p>
                )}
              </div>

              <div className="coupon-section">
                <div className="coupon-input-group">
                  <input
                    type="text"
                    placeholder="Cupom de desconto"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="coupon-input"
                  />
                  <button onClick={handleApplyCoupon} className="coupon-btn">
                    Aplicar
                  </button>
                </div>
                {discount > 0 && (
                  <div className="summary-line discount-line">
                    <span>Desconto</span>
                    <span className="discount-value">-{formatBRL(discount)}</span>
                  </div>
                )}
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total</span>
                <span>{formatBRL(orderTotal)}</span>
              </div>

              <p className="summary-installment">
                ou 10x de {formatBRL(orderTotal / 10)} sem juros
              </p>

              <button 
                className="btn-primary checkout-btn" 
                onClick={handleCheckout} 
                disabled={items.length === 0}
              >
                Finalizar Compra
              </button>

              <div className="summary-badges">
                <span className="badge-item">🔒 Compra 100% segura</span>
                <span className="badge-item">🚚 Entrega para todo o Brasil</span>
                <span className="badge-item">🛡️ Garantia de 30 dias</span>
                <span className="badge-item">💳 Parcelamento sem juros</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;