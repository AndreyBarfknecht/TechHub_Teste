import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { OrderSummary } from '../../types/profile';

export default function OrderHistoryCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const getExpectedStatus = (createdAt: string): OrderSummary['status'] => {
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffMinutes = Math.floor((now - start) / 60000);

    if (diffMinutes >= 4) return 'delivered';
    if (diffMinutes >= 3) return 'out_for_delivery';
    if (diffMinutes >= 2) return 'shipped';
    if (diffMinutes >= 1) return 'paid';
    return 'pending';
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (data) {
      const initialOrders = (data as OrderSummary[]).map(order => {
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
    setLoading(false);
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

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', padding: '2rem'}}><Loader2 className="spinning" size={24} color="var(--primary)" /></div>;
  }

  return (
    <div className="saved-payment-cards" style={{width: '100%', maxWidth: '100%'}}>
      {orders.length === 0 ? (
         <div className="empty-state">
           <Package size={48} color="var(--border)" />
           <p>Você ainda não tem nenhum pedido.</p>
         </div>
      ) : (
        orders.map(order => (
          <div 
            key={order.id} 
            className="saved-card" 
            style={{justifyContent: 'space-between', padding: '1rem', cursor: 'pointer', transition: 'var(--transition)'}}
            onClick={() => navigate(`/orders?id=${order.id}`)}
          >
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
              <div className="card-flag-icon" style={{backgroundColor: 'var(--primary-light)', padding: '0.5rem', width: 'auto', height: 'auto'}}>
                <Package size={24} color="var(--primary)" />
              </div>
              <div className="card-info">
                <p className="card-number" style={{fontSize: '0.95rem'}}>Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="card-expiry">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem'}}>
               <p style={{fontWeight: 600}}>R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</p>
               <span className={`card-status ${statusColors[order.status] || 'badge-info'}`}>
                 {statusLabels[order.status] || order.status}
               </span>
            </div>
          </div>
        ))
      )}
      {orders.length > 0 && (
         <button 
           onClick={() => navigate('/orders')}
           className="btn-outline" 
           style={{width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'}}
         >
           Ver todos os pedidos <ExternalLink size={16} />
         </button>
      )}
    </div>
  );
}
