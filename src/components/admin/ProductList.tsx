import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function ProductList({ refreshTrigger }: { refreshTrigger: number }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setProducts(data);
        setLoading(false);
      });
  }, [refreshTrigger]);

  if (loading) return <div>Carregando produtos...</div>;

  if (products.length === 0) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
        Nenhum produto cadastrado ainda.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {products.map(product => (
        <div key={product.id} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Sem img</span>
            </div>
          )}
          
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', margin: 0 }}>{product.name}</h3>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{product.categories?.name || 'Sem categoria'}</p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
            </div>
            <div style={{ fontSize: '12px', color: product.stock_quantity > 0 ? '#059669' : '#dc2626' }}>
              Estoque: {product.stock_quantity}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
