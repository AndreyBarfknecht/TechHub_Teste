import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/product';
import { useCart } from '../context/CartContext';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container fade-in" style={{ padding: '4rem 1.5rem', minHeight: '60vh' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {Array(6).fill(0).map((_, i) => (
            <div key={`skeleton-${i}`} className="card" style={{ cursor: 'pointer' }}>
              <div style={{ height: '250px', background: '#f0f0f0', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 50, height: 50, background: '#e0e0e0', borderRadius: '50%', animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ height: 24, background: '#f0f0f0', borderRadius: 4, width: '70%', marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ height: 16, background: '#f0f0f0', borderRadius: 4, width: '50%', marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ height: 28, background: '#f0f0f0', borderRadius: 4, width: '40%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: 40, background: '#f0f0f0', borderRadius: 6, width: 120, animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ padding: '4rem 1.5rem', minHeight: '60vh' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Nossos Produtos</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
        Explore toda a nossa coleção de produtos premium.
      </p>

      {products.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '4rem 2rem', fontSize: '1.1rem' }}>
          Nenhum produto cadastrado ainda.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {products.map((prod) => (
            <div key={prod.id} className="card" style={{ cursor: 'pointer' }}>
                <div
                  className="product-image"
                  style={{
                    height: '250px',
                    backgroundImage: prod.image_url ? `url("${prod.image_url}")` : 'none',
                    backgroundColor: prod.image_url ? 'transparent' : '#f5f5f5',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
                  }}
                >
                {!prod.image_url && <div style={{ width: 100, height: 100, background: '#e0e0e0', borderRadius: 16 }} />}
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{prod.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {prod.description || 'Sem descrição disponível.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
                    {prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <button
                    className="btn-primary"
                    style={{ padding: '0.5rem 1rem' }}
                    onClick={() => addToCart(prod)}
                  >
                    Adicionar ao Carrinho
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
