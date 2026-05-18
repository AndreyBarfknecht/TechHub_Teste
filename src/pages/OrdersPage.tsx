import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, ArrowLeft, ChevronDown, ChevronUp, Clock, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { OrderDetail } from '../types/profile';
import './ProfilePage.css'; // Reusing profile styles

const OrdersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const orderRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!authLoading && !user) navigate('/login?redirect=/orders');
    
    // Auto-expand if ID is present in URL
    const orderId = searchParams.get('id');
    if (orderId) {
      setExpandedOrders(prev => ({ ...prev, [orderId]: true }));
    }
  }, [user, authLoading, navigate, searchParams]);

  // Scroll to expanded order once orders are loaded
  useEffect(() => {
    const orderId = searchParams.get('id');
    if (orderId && !loading && orders.length > 0) {
      setTimeout(() => {
        const element = orderRefs.current[orderId];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300); // Small delay to ensure rendering is complete
    }
  }, [loading, orders, searchParams]);

  const getExpectedStatus = (createdAt: string): OrderDetail['status'] => {
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffMinutes = Math.floor((now - start) / 60000);

    if (diffMinutes >= 4) return 'delivered';
    if (diffMinutes >= 3) return 'out_for_delivery';
    if (diffMinutes >= 2) return 'shipped';
    if (diffMinutes >= 1) return 'paid';
    return 'pending';
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      const interval = setInterval(() => {
        setOrders(currentOrders => {
          let hasChanges = false;
          const updatedOrders = currentOrders.map(order => {
            if (order.status === 'canceled' || order.status === 'delivered') return order;
            
            const expected = getExpectedStatus(order.created_at);
            const statusHierarchy = ['pending', 'paid', 'shipped', 'out_for_delivery', 'delivered'];
            const currentIndex = statusHierarchy.indexOf(order.status);
            const expectedIndex = statusHierarchy.indexOf(expected);

            if (expectedIndex > currentIndex) {
              hasChanges = true;
              supabase.from('orders').update({ status: expected }).eq('id', order.id).then();
              return { ...order, status: expected };
            }
            return order;
          });
          return hasChanges ? updatedOrders : currentOrders;
        });
      }, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              name,
              image_urls
            )
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const initialOrders = (data as OrderDetail[]).map(order => {
          if (order.status === 'canceled' || order.status === 'delivered') return order;
          const expected = getExpectedStatus(order.created_at);
          
          const statusHierarchy = ['pending', 'paid', 'shipped', 'out_for_delivery', 'delivered'];
          const currentIndex = statusHierarchy.indexOf(order.status);
          const expectedIndex = statusHierarchy.indexOf(expected);

          if (expectedIndex > currentIndex) {
            supabase.from('orders').update({ status: expected }).eq('id', order.id).then();
            return { ...order, status: expected };
          }
          return order;
        });
        setOrders(initialOrders);
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const statusColors: Record<string, string> = {
    pending: 'badge-warning',
    paid: 'badge-info',
    shipped: 'badge-info',
    out_for_delivery: 'badge-warning',
    delivered: 'badge-success',
    canceled: 'badge-danger'
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pedido Feito',
    paid: 'Pagamento Aprovado',
    shipped: 'Em Transporte',
    out_for_delivery: 'Saiu para Entrega',
    delivered: 'Entregue',
    canceled: 'Cancelado'
  };

  if (loading || authLoading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <Loader2 className="spinning" size={32} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
      <button onClick={() => navigate('/profile')} className="btn-outline" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', padding: 0, background: 'none', color: 'var(--primary)', fontWeight: 600 }}>
        <ArrowLeft size={18} /> Voltar para o Perfil
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.75rem', borderRadius: '12px' }}>
          <Package size={28} color="var(--primary)" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>Meus Pedidos</h1>
          <p style={{ color: 'var(--text-muted)' }}>Histórico completo de suas compras</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Package size={64} color="var(--border)" style={{ marginBottom: '1rem' }} />
          <h3>Você ainda não realizou nenhum pedido</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Que tal explorar nossos produtos e fazer sua primeira compra?</p>
          <button onClick={() => navigate('/products')} className="btn-primary">Ver Produtos</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => (
            <div 
              key={order.id} 
              className="card" 
              style={{ padding: 0, overflow: 'hidden' }}
              ref={el => { orderRefs.current[order.id] = el; }}
            >
              <div 
                onClick={() => toggleExpand(order.id)}
                style={{ 
                  padding: '1.5rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  backgroundColor: expandedOrders[order.id] ? 'var(--surface-alt)' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div className="card-info">
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>PEDIDO</p>
                    <p style={{ fontWeight: 700, fontSize: '1rem' }}>#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="card-info">
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>DATA</p>
                    <p style={{ fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="card-info">
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TOTAL</p>
                    <p style={{ fontWeight: 700, color: 'var(--primary)' }}>R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`card-status ${statusColors[order.status] || 'badge-info'}`} style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {statusLabels[order.status] || order.status}
                  </span>
                  {expandedOrders[order.id] ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                </div>
              </div>

              {expandedOrders[order.id] && (
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                        <MapPin size={16} /> Endereço de Entrega
                      </h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{order.shipping_address}</p>
                    </div>
                    <div>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                        <CreditCard size={16} /> Pagamento
                      </h4>
                      <p style={{ fontSize: '0.95rem', textTransform: 'capitalize' }}>{order.payment_method.replace('_', ' ')}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total: R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                        <Clock size={16} /> Resumo
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                        <span>Subtotal:</span>
                        <span>R$ {Number(order.subtotal).toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        <span>Frete:</span>
                        <span>R$ {Number(order.shipping_fee).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>

                  <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Itens do Pedido</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {order.order_items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--surface-alt)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <div style={{ width: '50px', height: '50px', backgroundColor: 'white', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            {item.product?.image_urls?.[0] ? (
                              <img src={item.product.image_urls[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Package size={20} color="var(--border)" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.product?.name || 'Produto Removido'}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quantidade: {item.quantity}</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 600 }}>R$ {Number(item.unit_price * item.quantity).toFixed(2).replace('.', ',')}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Un: R$ {Number(item.unit_price).toFixed(2).replace('.', ',')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
