// src/pages/CartPage.tsx
// Página principal do carrinho. Lista todos os itens e mostra o resumo do pedido.

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShoppingCart, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { ShippingCalculator } from '../components/cart/ShippingCalculator';
import './CartPage.css';

const CartPage = () => {
  const { items, totalPrice, totalItems, removeFromCart, updateQuantity, clearCart, appliedCoupon, discountAmount, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shippingFee, setShippingFee] = React.useState<number>(totalPrice >= 200 ? 0 : 25.9);
  const [isManuallyCalculated, setIsManuallyCalculated] = React.useState(false);

  // --- Coupon state (UI only) ---
  const [couponInput, setCouponInput] = React.useState('');
  const [couponError, setCouponError] = React.useState('');
  const [couponLoading, setCouponLoading] = React.useState(false);

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  // Update shipping fee if totalPrice changes (handle free shipping threshold)
  React.useEffect(() => {
    if (totalPrice >= 200 && !isManuallyCalculated) {
      setShippingFee(0);
    } else if (!isManuallyCalculated && shippingFee === 0 && totalPrice < 200) {
      setShippingFee(25.9);
    }
  }, [totalPrice, isManuallyCalculated, shippingFee]);


  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setCouponError('');
    setCouponLoading(true);

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    setCouponLoading(false);

    if (error || !data) {
      setCouponError('Cupom inválido ou não encontrado.');
      removeCoupon();
      return;
    }

    const coupon = data as import('../types/coupon').Coupon;

    // Check usage limit
    if (coupon.max_uses !== null && coupon.usage_count >= coupon.max_uses) {
      setCouponError('Este cupom atingiu o limite de usos e não pode mais ser aplicado.');
      removeCoupon();
      return;
    }

    applyCoupon(coupon);
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponError('');
  };

  const orderTotal = Math.max(0, totalPrice + shippingFee - discountAmount);

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
                  <span className={shippingFee === 0 && !isManuallyCalculated ? 'shipping-pending' : ''}>
                    {shippingFee === 0 && !isManuallyCalculated ? 'A calcular' : formatBRL(shippingFee)}
                  </span>
                </div>

                <div className="shipping-calculator-wrapper">
                  <ShippingCalculator
                    onShippingRateChange={(rate) => {
                      setShippingFee(rate);
                      setIsManuallyCalculated(true);
                    }}
                  />
                </div>
              </div>

              {/* COUPON SECTION */}
              <div className="coupon-section">
                {appliedCoupon ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.6rem 0.85rem',
                      background: '#dcfce7', border: '1px solid #86efac',
                      borderRadius: '8px',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#16a34a', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={15} />
                        {appliedCoupon.code} — {appliedCoupon.discount_percent}% OFF
                      </span>
                      <button
                        onClick={handleRemoveCoupon}
                        title="Remover cupom"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', display: 'flex', alignItems: 'center' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="summary-line discount-line">
                      <span>Desconto</span>
                      <span className="discount-value">-{formatBRL(discountAmount)}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="coupon-input-group">
                      <input
                        type="text"
                        placeholder="Cupom de desconto"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                        className="coupon-input"
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      />
                      <button onClick={handleApplyCoupon} className="coupon-btn" disabled={couponLoading}>
                        {couponLoading ? <Loader2 size={14} className="spinning" /> : 'Aplicar'}
                      </button>
                    </div>
                    {couponError && (
                      <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.35rem', marginBottom: 0 }}>
                        {couponError}
                      </p>
                    )}
                  </>
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