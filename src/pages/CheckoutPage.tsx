import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Loader2, MapPin, QrCode, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, authLoading, navigate]);

  // Stepper state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string>('');

  // Shipping state
  const shippingFee = totalPrice >= 200 ? 0 : 25.9;
  const orderTotal = totalPrice + shippingFee;

  // Delivery Form State
  const [delivery, setDelivery] = useState({
    name: '',
    cpf: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    city: '',
    state: ''
  });
  const [deliveryErrors, setDeliveryErrors] = useState<Record<string, string>>({});

  // Payment Form State
  const [payment, setPayment] = useState({
    method: 'pix' as 'pix' | 'credit_card',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    cardFlag: ''
  });
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  const [focusedCvv, setFocusedCvv] = useState(false);

  // Load existing profile data
  useEffect(() => {
    if (user) {
      const loadProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data && !error) {
            setDelivery(prev => ({
              ...prev,
              name: data.full_name || '',
              phone: data.phone || '',
              cpf: data.cpf || '',
              cep: data.cep || '',
              address: data.address || '',
              city: data.city || '',
              state: data.state || ''
            }));
          }
        } catch (err) {
          console.error("Erro ao puxar perfil", err);
        }
      };
      loadProfile();
    }
  }, [user]);

  // ----- MASKS -----
  const handleMask = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    let { value } = e.target;
    if (field === 'cpf') {
      value = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    } else if (field === 'phone') {
      value = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    } else if (field === 'cep') {
      value = value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+?$/, '$1');
    } else if (field === 'cardNumber') {
      value = value
        .replace(/\D/g, '')
        .replace(/(\d{4})(?=\d)/g, '$1 ')
        .substring(0, 19);
      
      // Update card flag
      let flag = '';
      if (value.startsWith('4')) flag = 'Visa';
      else if (value.startsWith('5')) flag = 'Mastercard';
      else if (value.startsWith('6')) flag = 'Elo';
      else if (value.startsWith('3')) flag = 'Amex';
      setPayment(p => ({ ...p, cardFlag: flag }));
    } else if (field === 'cardExpiry') {
      value = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\/\d{2})\d+?$/, '$1');
    } else if (field === 'cardCvv') {
      value = value.replace(/\D/g, '').substring(0, 4);
    } else if (field === 'cardName') {
      value = value.toUpperCase();
    }

    if (['cardNumber', 'cardName', 'cardExpiry', 'cardCvv'].includes(field)) {
      setPayment(p => ({ ...p, [field]: value }));
    } else {
      setDelivery(p => ({ ...p, [field]: value }));
    }
  };

  // ----- VIA CEP -----
  const checkCEP = async () => {
    const cepNumbers = delivery.cep.replace(/\D/g, '');
    if (cepNumbers.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setDelivery(p => ({
            ...p,
            address: data.logradouro || p.address,
            city: data.localidade || p.city,
            state: data.uf || p.state
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP", err);
      }
    }
  };

  // ----- VALIDATIONS -----
  const validateDelivery = () => {
    const errs: Record<string, string> = {};
    if (!delivery.name.trim()) errs.name = "Nome é obrigatório";
    if (delivery.cpf.replace(/\D/g, '').length !== 11) errs.cpf = "CPF inválido";
    if (delivery.phone.replace(/\D/g, '').length < 10) errs.phone = "Telefone inválido";
    if (delivery.cep.replace(/\D/g, '').length !== 8) errs.cep = "CEP inválido";
    if (!delivery.address.trim()) errs.address = "Endereço é obrigatório";
    if (!delivery.number.trim()) errs.number = "Número é obrigatório";
    if (!delivery.city.trim()) errs.city = "Cidade é obrigatória";
    if (!delivery.state.trim()) errs.state = "Estado é obrigatório";

    setDeliveryErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    const errs: Record<string, string> = {};
    if (payment.method === 'credit_card') {
      if (payment.cardNumber.replace(/\D/g, '').length < 13) errs.cardNumber = "Número de cartão inválido";
      if (!payment.cardName.trim()) errs.cardName = "Nome impresso é obrigatório";
      if (payment.cardExpiry.length !== 5) errs.cardExpiry = "Validade inválida (MM/AA)";
      if (payment.cardCvv.length < 3) errs.cardCvv = "CVV inválido";
    }
    setPaymentErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ----- NAVIGATION -----
  const goNext = async () => {
    if (currentStep === 1) {
      if (validateDelivery()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validatePayment()) {
        await finishOrder();
      }
    }
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // ----- SUBMIT -----
  const finishOrder = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Upsert Profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: delivery.name,
        cpf: delivery.cpf,
        phone: delivery.phone,
        cep: delivery.cep,
        address: delivery.address,
        city: delivery.city,
        state: delivery.state
      });
      if (profileError) throw profileError;

      // 2. Insert Order
      const fullAddress = `${delivery.address}, ${delivery.number} ${delivery.complement ? '- ' + delivery.complement : ''}. ${delivery.city} - ${delivery.state}. CEP: ${delivery.cep}`;
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        status: 'paid', // Fictício
        subtotal: totalPrice,
        shipping_fee: shippingFee,
        total_amount: orderTotal,
        shipping_address: fullAddress,
        payment_method: payment.method
      }).select().single();
      
      if (orderError) throw orderError;
      setCreatedOrderId(orderData.id);

      // 3. Insert Items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // 4. Success
      clearCart();
      setCurrentStep(3);
    } catch (err: unknown) {
      console.error("Erro ao salvar pedido", err);
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Erro desconhecido ao processar pedido.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBRL = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


  // ====== RENDER =======
  if (authLoading || (!user && currentStep === 1)) {
    return (
      <div className="checkout-page" style={{display: 'flex', justifyContent: 'center', marginTop: '10vh'}}>
        <Loader2 className="spinning" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="checkout-page fade-in">
      <div className="container">
        <div className="checkout-header">
          <h1 className="checkout-title">Checkout Segura</h1>
        </div>

        {/* Stepper */}
        {currentStep < 3 && (
          <div className="stepper">
            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-circle">{currentStep > 1 ? <Check size={20} /> : 1}</div>
              <span className="step-label">Entrega</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-circle">{currentStep > 2 ? <Check size={20} /> : 2}</div>
              <span className="step-label">Pagamento</span>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              <span className="step-label">Confirmação</span>
            </div>
          </div>
        )}

        <div className="checkout-layout">
          
          {/* Formulários (Coluna central/esquerda) */}
          <div className="checkout-form-col">
            
            {/* ETAPA 1 - ENTREGA */}
            {currentStep === 1 && (
              <div className="card">
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={24} color="var(--primary)" /> Dados de Entrega
                </h2>
                
                <div className="checkout-form-section">
                  <div className="form-group">
                    <label>Nome Completo *</label>
                    <input type="text" className="form-input" value={delivery.name} onChange={e => handleMask(e, 'name')} />
                    {deliveryErrors.name && <span className="form-error">{deliveryErrors.name}</span>}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>CPF *</label>
                      <input type="text" className="form-input" placeholder="000.000.000-00" value={delivery.cpf} onChange={e => handleMask(e, 'cpf')} />
                      {deliveryErrors.cpf && <span className="form-error">{deliveryErrors.cpf}</span>}
                    </div>
                    <div className="form-group">
                      <label>Telefone *</label>
                      <input type="text" className="form-input" placeholder="(00) 00000-0000" value={delivery.phone} onChange={e => handleMask(e, 'phone')} />
                      {deliveryErrors.phone && <span className="form-error">{deliveryErrors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>CEP *</label>
                      <input type="text" className="form-input" placeholder="00000-000" value={delivery.cep} onChange={e => handleMask(e, 'cep')} onBlur={checkCEP} />
                      {deliveryErrors.cep && <span className="form-error">{deliveryErrors.cep}</span>}
                    </div>
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>Endereço / Rua *</label>
                      <input type="text" className="form-input" value={delivery.address} onChange={e => handleMask(e, 'address')} />
                      {deliveryErrors.address && <span className="form-error">{deliveryErrors.address}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Número *</label>
                      <input type="text" className="form-input" value={delivery.number} onChange={e => handleMask(e, 'number')} />
                      {deliveryErrors.number && <span className="form-error">{deliveryErrors.number}</span>}
                    </div>
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>Complemento</label>
                      <input type="text" className="form-input" value={delivery.complement} onChange={e => handleMask(e, 'complement')} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cidade *</label>
                      <input type="text" className="form-input" value={delivery.city} onChange={e => handleMask(e, 'city')} />
                      {deliveryErrors.city && <span className="form-error">{deliveryErrors.city}</span>}
                    </div>
                    <div className="form-group">
                      <label>Estado *</label>
                      <input type="text" className="form-input" placeholder="UF" maxLength={2} value={delivery.state} onChange={e => handleMask(e, 'state')} />
                      {deliveryErrors.state && <span className="form-error">{deliveryErrors.state}</span>}
                    </div>
                  </div>
                </div>

                <div className="checkout-actions">
                  <button className="btn-secondary" onClick={() => navigate('/cart')}>Voltar ao Carrinho</button>
                  <button className="btn-primary" onClick={goNext}>Continuar para Pagamento <ArrowRight size={18} style={{marginLeft: '0.5rem'}} /></button>
                </div>
              </div>
            )}

            {/* ETAPA 2 - PAGAMENTO */}
            {currentStep === 2 && (
              <div className="card">
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={24} color="var(--primary)" /> Método de Pagamento
                </h2>

                <div className="payment-methods">
                  <div className={`payment-method-card ${payment.method === 'pix' ? 'selected' : ''}`} onClick={() => setPayment(p => ({ ...p, method: 'pix' }))}>
                    <QrCode size={32} color={payment.method === 'pix' ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 500 }}>PIX</span>
                  </div>
                  <div className={`payment-method-card ${payment.method === 'credit_card' ? 'selected' : ''}`} onClick={() => setPayment(p => ({ ...p, method: 'credit_card' }))}>
                    <CreditCard size={32} color={payment.method === 'credit_card' ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 500 }}>Cartão de Crédito</span>
                  </div>
                </div>

                {payment.method === 'pix' ? (
                  <div className="pix-container fade-in">
                    <h3>Pagamento via PIX</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      Após o pagamento, seu pedido será confirmado em até 5 minutos.
                    </p>
                    <div className="pix-qr">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TechHub-PIX-FICTICIO-${orderTotal}`} alt="QR Code PIX" />
                    </div>
                    <p style={{ fontWeight: 500 }}>Total a pagar: {formatBRL(orderTotal)}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
                      Chave PIX: techhub@pagamentos.com.br
                    </p>
                  </div>
                ) : (
                  <div className="credit-card-container fade-in">
                    {/* Cartão animado */}
                    <div className={`credit-card-preview ${focusedCvv ? 'flipped' : ''}`}>
                      <div className="cc-front">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div className="cc-chip"></div>
                          <div style={{ fontWeight: 'bold', fontSize: '1.2rem', fontStyle: 'italic' }}>{payment.cardFlag}</div>
                        </div>
                        <div className="cc-number">
                          {payment.cardNumber || '•••• •••• •••• ••••'}
                        </div>
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

                    <div className="checkout-form-section">
                      <div className="form-group">
                        <label>Número do Cartão</label>
                        <input type="text" className="form-input" placeholder="0000 0000 0000 0000" value={payment.cardNumber} onChange={e => handleMask(e, 'cardNumber')} onFocus={() => setFocusedCvv(false)} />
                        {paymentErrors.cardNumber && <span className="form-error">{paymentErrors.cardNumber}</span>}
                      </div>

                      <div className="form-group">
                        <label>Nome Impresso no Cartão</label>
                        <input type="text" className="form-input" placeholder="João S. Silva" value={payment.cardName} onChange={e => handleMask(e, 'cardName')} onFocus={() => setFocusedCvv(false)} />
                        {paymentErrors.cardName && <span className="form-error">{paymentErrors.cardName}</span>}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Validade</label>
                          <input type="text" className="form-input" placeholder="MM/AA" value={payment.cardExpiry} onChange={e => handleMask(e, 'cardExpiry')} onFocus={() => setFocusedCvv(false)} />
                          {paymentErrors.cardExpiry && <span className="form-error">{paymentErrors.cardExpiry}</span>}
                        </div>
                        <div className="form-group">
                          <label>CVV</label>
                          <input type="text" className="form-input" placeholder="000" value={payment.cardCvv} onChange={e => handleMask(e, 'cardCvv')} onFocus={() => setFocusedCvv(true)} onBlur={() => setFocusedCvv(false)} />
                          {paymentErrors.cardCvv && <span className="form-error">{paymentErrors.cardCvv}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '4px', marginTop: '1.5rem' }}>
                    {submitError}
                  </div>
                )}

                <div className="checkout-actions">
                  <button className="btn-secondary" onClick={goBack} disabled={isSubmitting}>Voltar</button>
                  <button className="btn-primary" onClick={goNext} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="spinning" size={18} /> : 'Confirmar e Finalizar Pedido'}
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3 - CONFIRMAÇÃO */}
            {currentStep === 3 && (
              <div className="success-container fade-in">
                <div className="success-icon-wrapper">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h2>Pedido realizado com sucesso! 🎉</h2>
                <p>Nós recebemos o seu pedido e estamos processando as informações.</p>

                <div className="success-details">
                  <div className="success-details-row">
                    <span style={{ color: 'var(--text-muted)' }}>Pedido</span>
                    <span style={{ fontWeight: 500 }}>#{createdOrderId.substring(0, 8)}</span>
                  </div>
                  <div className="success-details-row">
                    <span style={{ color: 'var(--text-muted)' }}>Método</span>
                    <span style={{ fontWeight: 500 }}>{payment.method === 'pix' ? 'PIX' : 'Cartão de Crédito'}</span>
                  </div>
                  <div className="success-details-row">
                    <span style={{ color: 'var(--text-muted)' }}>Total Pago</span>
                    <span style={{ fontWeight: 500, color: 'var(--primary)' }}>{formatBRL(orderTotal)}</span>
                  </div>
                  <div className="success-details-row" style={{ marginTop: '1rem', borderTop: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', width: '100%' }}>
                      <Truck size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <div>
                        <p style={{ fontWeight: 500, margin: 0, fontSize: '0.9rem' }}>Entrega prevista em 3-5 dias úteis</p>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8rem', marginTop: '0.2rem' }}>
                          {delivery.address}, {delivery.number} - {delivery.city}/{delivery.state}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="success-actions">
                  <button className="btn-secondary" onClick={() => navigate('/')}>Ir para Início</button>
                  <button className="btn-primary" onClick={() => navigate('/products')}><ShoppingBag size={18} style={{marginRight: '0.5rem'}} /> Voltar para a loja</button>
                </div>
              </div>
            )}
          </div>

          {/* Resumo do Carrinho (Coluna Direita) */}
          <div className="checkout-summary-col">
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Resumo do Pedido</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                {currentStep < 3 && items.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      {item.quantity}x <span style={{ color: 'var(--text-main)', maxWidth: '170px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product.name}</span>
                    </span>
                    <span>{formatBRL(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-line">
                <span>Subtotal ({totalItems} itens)</span>
                <span>{formatBRL(totalPrice)}</span>
              </div>
              <div className="summary-line">
                <span>Frete</span>
                <span className={shippingFee === 0 ? 'shipping-free' : ''} style={{ color: shippingFee === 0 ? '#10b981' : 'inherit' }}>
                  {shippingFee === 0 ? 'Grátis' : formatBRL(shippingFee)}
                </span>
              </div>
              
              <div className="summary-divider" />
              
              <div className="summary-total">
                <span>Total</span>
                <span>{formatBRL(orderTotal)}</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
