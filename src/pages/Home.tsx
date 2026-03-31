import { useEffect, useState } from 'react';
import { ArrowRight, Star, TrendingUp, ShieldCheck, Truck } from 'lucide-react';
import './Home.css';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/product';

const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (!error && data) {
        setTrendingProducts(data);
      }
      setLoading(false);
    };
    
    fetchTrending();
  }, []);

  return (
    <div className="home fade-in">
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Descubra <span className="text-primary">Produtos</span> de Alta Qualidade
            </h1>
            <p className="hero-subtitle">
             Explore nosso catálogo de eletrônicos de alta qualidade, cuidadosamente selecionados para atender às suas necessidades tecnológicas.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn-primary">Compre</Link>
              <button className="btn-secondary">Ajuda</button>
            </div>
            
            <div className="features">
              <div className="feature-item">
                <Truck className="feature-icon" size={20} />
                <span>Entrega Segura</span>
              </div>
              <div className="feature-item">
                <ShieldCheck className="feature-icon" size={20} />
                <span>Segurança na Compra</span>
              </div>
            </div>
          </div>
          
          <div className="hero-image-wrapper">
            <div className="hero-image-placeholder">
              <Star className="hero-icon" size={64} />
              <p></p>
            </div>
            <div className="floating-badge">
              <TrendingUp size={16} />
              <span>Eletrônico mais visto</span>
            </div>
          </div>
        </div>
      </section>

      <section className="trending container">
        <div className="section-header">
          <h2>Produtos mais Vistos</h2>
          <Link to="/products" className="view-all">Veja Todos <ArrowRight size={16} /></Link>
        </div>
        <div className="categories-grid">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={`skeleton-${i}`} className="category-card card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: '200px', background: '#f0f0f0', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40, background: '#e0e0e0', borderRadius: '50%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ height: 20, background: '#f0f0f0', borderRadius: 4, width: '80%', marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: 16, background: '#f0f0f0', borderRadius: 4, width: '60%', marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: 24, background: '#f0f0f0', borderRadius: 4, width: '40%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))
          ) : trendingProducts.length > 0 ? (
            trendingProducts.map(item => (
              <div key={item.id} className="category-card card" style={{ padding: 0, overflow: 'hidden' }}>
                <div 
                  className="category-image" 
                  style={{ 
                    backgroundImage: item.image_url ? `url(${item.image_url})` : 'none',
                    backgroundColor: item.image_url ? 'transparent' : '#f5f5f5',
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center', 
                    height: '200px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {!item.image_url && <div style={{ width: 80, height: 80, background: '#e0e0e0', borderRadius: 12 }} />}
                </div>
                <div className="category-info" style={{ padding: '1.5rem', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>{item.name}</h3>
                  <p style={{ color: '#666', margin: '0 0 1rem 0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    {item.description || 'Sem descrição disponível'}
                  </p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)', margin: 0 }}>
                    {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', padding: '2rem' }}>Nenhum produto encontrado.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
