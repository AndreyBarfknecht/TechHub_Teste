import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/product';
import ProductCard from '../components/ui/ProductCard';
import './Products.css'; // Assumindo que existe ou criar se necessário

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
