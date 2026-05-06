import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Loader2, MapPin, QrCode, ArrowRight, ShoppingBag, Truck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import './CheckoutPage.css';

import { calculateShippingRate } from '../lib/shipping';

const CheckoutPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string>('');
  const [finalSummary, setFinalSummary] = useState<{ subtotal: number; shipping: number; total: number } | null>(null);

  const [shippingFee, setShippingFee] = useState<number>(25.9);
  const [shippingInfo, setShippingInfo] = useState<{ carrier: string; days: number } | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [isManuallyCalculated, setIsManuallyCalculated] = useState(false);
  const orderTotal = totalPrice + shippingFee;

  const [delivery, setDelivery] = useState({
    name: '', cpf: '', phone: '', cep: '', address: '', number: '', complement: '', city: '', state: ''
  });
  const [deliveryErrors, setDeliveryErrors] = useState<Record<string, string>>({});

  const [payment, setPayment] = useState({
    method: 'pix' as 'pix' | 'credit_card',
    cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '', cardFlag: ''
  });
  const [focusedCvv, setFocusedCvv] = useState(false);

  // ----- VIA CEP & SHIPPING -----
  const handleCalculateShipping = React.useCallback(async (cepToCalc: string) => {
    const cepNumbers = cepToCalc.replace(/\D/g, '');
    if (cepNumbers.length !== 8) return;

    setIsCalculatingShipping(true);
    try {
      const shipping = await calculateShippingRate(cepNumbers);
      setShippingFee(shipping.rate || 0);
      setShippingInfo({ carrier: shipping.carrier || 'Transportadora', days: shipping.deliveryDays || 5 });
      setIsManuallyCalculated(true);
      
      setDelivery(prev => ({ 
        ...prev, 
        city: shipping.city || prev.city, 
        state: shipping.state || prev.state 
      }));

      const res = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setDelivery(prev => ({ 
          ...prev, 
          address: prev.address || data.logradouro || '', 
          city: data.localidade || prev.city, 
          state: data.uf || prev.state 
        }));
      }
    } catch (err) { console.error("Erro frete:", err); } finally { setIsCalculatingShipping(false); }
  }, []);

  const checkCEP = () => handleCalculateShipping(delivery.cep);

  // Redirects
  useEffect(() => {
    if (!authLoading && !user) navigate('/login?redirect=/checkout');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && items.length === 0 && currentStep < 3) navigate('/cart');
  }, [items, authLoading, navigate, currentStep]);

  // Sync initial fee
  useEffect(() => {
    if (!isManuallyCalculated) {
      if (totalPrice >= 200 && totalPrice > 0) setShippingFee(0);
      else setShippingFee(25.9);
    }
  }, [totalPrice, isManuallyCalculated]);

  // Profile data
  useEffect(() => {
    if (user?.id) {
      const loadProfile = async () => {
        try {
          const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (data && !error) {
            setDelivery(prev => ({ 
              ...prev, 
              name: data.full_name || prev.name, 
              phone: data.phone || prev.phone, 
              cpf: data.cpf || prev.cpf, 
              cep: data.cep || prev.cep, 
              address: data.address || prev.address, 
              city: data.city || prev.city, 
              state: data.state || prev.state 
            }));
            if (data.cep) handleCalculateShipping(data.cep);
          }
        } catch (err) { console.error(err); }
      };
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleMask = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    let { value } = e.target;
    if (field === 'cpf') value = value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').substring(0, 14);
    else if (field === 'phone') value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);
    else if (field === 'cep') value = value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9);
    else if (field === 'cardNumber') {
      value = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
      let flag = '';
      if (value.startsWith('4')) flag = 'Visa'; else if (value.startsWith('5')) flag = 'Mastercard';
      setPayment(p => ({ ...p, cardFlag: flag }));
    }
    else if (field === 'cardExpiry') value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);
    else if (field === 'cardCvv') value = value.replace(/\D/g, '').substring(0, 4);

    if (['cardNumber', 'cardName', 'cardExpiry', 'cardCvv'].includes(field)) setPayment(p => ({ ...p, [field]: value }));
    else setDelivery(p => ({ ...p, [field]: value }));
  };

  const validateDelivery = () => {
    const errs: Record<string, string> = {};
    if (!delivery.name.trim()) errs.name = "Obrigatório";
    if (delivery.cep.replace(/\D/g, '').length !== 8) errs.cep = "Inválido";
    setDeliveryErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const finishOrder = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const orderId = crypto.randomUUID();
      const { error } = await supabase.from('orders').insert({ 
        id: orderId, user_id: user.id, status: 'paid', 
        subtotal: totalPrice, shipping_fee: shippingFee, total_amount: orderTotal, 
        shipping_address: `${delivery.address}, ${delivery.number}`, 
        payment_method: payment.method, created_at: new Date().toISOString() 
      });
      if (error) throw error;
      setCreatedOrderId(orderId);
      const orderItems = items.map(item => ({ 
        id: crypto.randomUUID(), order_id: orderId, product_id: item.product.id, 
        quantity: item.quantity, unit_price: item.product.price, created_at: new Date().toISOString() 
      }));
      await supabase.from('order_items').insert(orderItems);
      
      setFinalSummary({
        subtotal: totalPrice,
        shipping: shippingFee,
        total: orderTotal
      });

      clearCart();
      setCurrentStep(3);
    } catch (err: unknown) { setSubmitError(err instanceof Error ? err.message : "Erro"); } finally { setIsSubmitting(false); }
  };

  const formatBRL = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (authLoading || (!user && currentStep === 1)) return <div style={{display: 'flex', justifyContent: 'center', marginTop: '10vh'}}><Loader2 className="spinning" size={48} color="var(--primary)" /></div>;

  return (
    <div className="checkout-page fade-in">
      <div className="container">
        <h1 className="checkout-title">Checkout Seguro</h1>
        {currentStep < 3 && (
          <div className="stepper">
            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}><div className="step-circle">{currentStep > 1 ? <Check size={20} /> : 1}</div><span className="step-label">Entrega</span></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}><div className="step-circle">{currentStep > 2 ? <Check size={20} /> : 2}</div><span className="step-label">Pagamento</span></div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}><div className="step-circle">3</div><span className="step-label">Fim</span></div>
          </div>
        )}
        <div className={`checkout-layout ${currentStep === 3 ? 'success-layout' : ''}`}>
          <div className="checkout-form-col">
            {currentStep === 1 && (
              <div className="card">
                <h2><MapPin size={20} /> Entrega</h2>
                <div className="form-group"><label>Nome Completo *</label><input type="text" className="form-input" value={delivery.name} onChange={e => handleMask(e, 'name')} />{deliveryErrors.name && <span className="form-error">{deliveryErrors.name}</span>}</div>
                <div className="form-row">
                  <div className="form-group"><label>CPF</label><input type="text" className="form-input" value={delivery.cpf} onChange={e => handleMask(e, 'cpf')} /></div>
                  <div className="form-group">
                    <label>CEP *</label>
                    <div style={{ position: 'relative' }}>
                      <input type="text" className="form-input" placeholder="00000-000" value={delivery.cep} onChange={e => handleMask(e, 'cep')} onBlur={checkCEP} />
                      {isCalculatingShipping && <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}><Loader2 size={16} className="spinning" /></div>}
                    </div>
                    {deliveryErrors.cep && <span className="form-error">{deliveryErrors.cep}</span>}
                  </div>
                </div>
                <div className="form-row"><div className="form-group" style={{flex:2}}><label>Rua</label><input type="text" className="form-input" value={delivery.address} onChange={e => handleMask(e, 'address')} /></div><div className="form-group"><label>Nº</label><input type="text" className="form-input" value={delivery.number} onChange={e => handleMask(e, 'number')} /></div></div>
                <div className="form-row"><div className="form-group"><label>Cidade</label><input type="text" className="form-input" value={delivery.city} onChange={e => handleMask(e, 'city')} /></div><div className="form-group"><label>UF</label><input type="text" className="form-input" value={delivery.state} onChange={e => handleMask(e, 'state')} maxLength={2} /></div></div>
                <div className="checkout-actions"><button className="btn-primary" onClick={() => { if(validateDelivery()) setCurrentStep(2); }}>Continuar para Pagamento <ArrowRight size={18} /></button></div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="card">
                <h2><CreditCard size={20} /> Pagamento</h2>
                <div className="payment-methods">
                  <div className={`payment-method-card ${payment.method === 'pix' ? 'selected' : ''}`} onClick={() => setPayment(p => ({ ...p, method: 'pix' }))}><QrCode size={32} /> <span>PIX</span></div>
                  <div className={`payment-method-card ${payment.method === 'credit_card' ? 'selected' : ''}`} onClick={() => setPayment(p => ({ ...p, method: 'credit_card' }))}><CreditCard size={32} /> <span>Cartão</span></div>
                </div>

                {payment.method === 'pix' ? (
                  <div className="pix-container">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x180&data=Tech-PIX-${orderTotal}`} alt="PIX" />
                    <div style={{background:'var(--primary-light)', padding:'1rem', borderRadius:'8px', marginTop:'1rem', textAlign:'center', width:'100%'}}>
                      <strong>Total: {formatBRL(orderTotal)}</strong><br/>
                      <small>Itens: {formatBRL(totalPrice)} + Frete: {shippingFee === 0 ? 'Grátis' : formatBRL(shippingFee)}</small>
                    </div>
                  </div>
                ) : (
                  <div className="credit-card-container fade-in">
                    <div className={`credit-card-preview ${focusedCvv ? 'flipped' : ''}`}>
                      <div className="cc-front">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div className="cc-chip"></div>
                          <div style={{ fontWeight: 'bold', fontSize: '1.2rem', fontStyle: 'italic' }}>{payment.cardFlag}</div>
                        </div>
                        <div className="cc-number">{payment.cardNumber || '•••• •••• •••• ••••'}</div>
                        <div className="cc-footer">
                          <div className="cc-name">{payment.cardName || 'NOME NO CARTÃO'}</div>
                          <div>{payment.cardExpiry || 'MM/AA'}</div>
                        </div>
                      </div>
                      <div className="cc-back">
                        <div className="cc-stripe"></div>
                        <div className="cc-cvv-value">{payment.cardCvv || '•••'}</div>
                      </div>
                    </div>

                    <div className="checkout-form-section" style={{width:'100%'}}>
                      <div className="form-group"><label>Número do Cartão</label><input type="text" className="form-input" placeholder="0000 0000 0000 0000" value={payment.cardNumber} onChange={e => handleMask(e, 'cardNumber')} onFocus={() => setFocusedCvv(false)} /></div>
                      <div className="form-group"><label>Nome no Cartão</label><input type="text" className="form-input" placeholder="NOME COMO NO CARTÃO" value={payment.cardName} onChange={e => handleMask(e, 'cardName')} onFocus={() => setFocusedCvv(false)} /></div>
                      <div className="form-row">
                        <div className="form-group"><label>Validade</label><input type="text" className="form-input" placeholder="MM/AA" value={payment.cardExpiry} onChange={e => handleMask(e, 'cardExpiry')} onFocus={() => setFocusedCvv(false)} /></div>
                        <div className="form-group"><label>CVV</label><input type="text" className="form-input" placeholder="000" value={payment.cardCvv} onChange={e => handleMask(e, 'cardCvv')} onFocus={() => setFocusedCvv(true)} onBlur={() => setFocusedCvv(false)} /></div>
                      </div>
                    </div>
                  </div>
                )}
                {submitError && <div className="error-message"><AlertCircle size={16} /> {submitError}</div>}
                <div className="checkout-actions">
                  <button className="btn-secondary" onClick={() => setCurrentStep(1)}>Voltar</button>
                  <button className="btn-primary" onClick={finishOrder} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="spinning" size={16} /> : 'Finalizar Pedido'}</button>
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="success-container fade-in">
                <Check size={64} color="#10b981" />
                <h2>Pedido Realizado! 🎉</h2>
                <div className="order-badge">#{createdOrderId.substring(0,8)}</div>
                <div className="success-details">
                  <div className="success-details-row"><span>Itens:</span><span>{formatBRL(finalSummary?.subtotal || 0)}</span></div>
                  <div className="success-details-row"><span>Frete:</span><span>{finalSummary?.shipping === 0 ? 'Grátis' : formatBRL(finalSummary?.shipping || 0)}</span></div>
                  <div className="success-details-row"><strong>Total Pago:</strong><strong>{formatBRL(finalSummary?.total || 0)}</strong></div>
                </div>
                {shippingInfo && <p style={{fontSize:'0.9rem', color:'var(--text-muted)', marginBottom:'1.5rem'}}><Truck size={16} style={{verticalAlign:'middle', marginRight:'5px'}} /> Entrega por {shippingInfo.carrier} em {shippingInfo.days} dias.</p>}
                <button className="btn-primary" onClick={() => navigate('/products')}><ShoppingBag size={18} /> Voltar para Loja</button>
              </div>
            )}
          </div>
          <div className="checkout-summary-col">
            {currentStep < 3 && (
              <div className="card">
                <h3>Resumo</h3>
                <div className="summary-line"><span>Subtotal ({totalItems})</span><span>{formatBRL(totalPrice)}</span></div>
                <div className="summary-line">
                  <span>Frete</span>
                  <div style={{textAlign:'right'}}>
                    {isCalculatingShipping ? <Loader2 size={12} className="spinning" /> : (
                      <><span style={{color: shippingFee === 0 ? '#10b981' : 'inherit', fontWeight: 600}}>{shippingFee === 0 ? 'Grátis' : formatBRL(shippingFee)}</span>{shippingInfo && <div style={{fontSize:'0.65rem', opacity:0.7}}>{shippingInfo.carrier}</div>}</>
                    )}
                  </div>
                </div>
                <div className="summary-divider" />
                <div className="summary-total" style={{display:'flex', justifyContent:'space-between', fontSize:'1.1rem', fontWeight:'bold'}}><span>Total</span><span>{formatBRL(orderTotal)}</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
