import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck } from 'lucide-react';
import { useTrendingProducts } from '../../hooks/useTrendingProducts';
import './Hero.css';

const Hero: React.FC = () => {
  const { trendingProducts } = useTrendingProducts();
  const featuredProduct = trendingProducts?.[0];

  return (
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
            <Link to="/products" className="btn-primary">Compre Agora</Link>
            <button className="btn-secondary">Saiba Mais</button>
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
          <div className="hero-image-composite">
            <div className="main-image" style={featuredProduct?.image_url ? { background: 'white' } : {}}>
              {featuredProduct?.image_url ? (
                <img src={featuredProduct.image_url} alt={featuredProduct.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div className="image-fallback">Tecnologia de Ponta</div>
              )}
            </div>
            <div className="floating-badge" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="badge-icon">🔥</div>
                <span>Produto Destaque</span>
              </div>
              {featuredProduct && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                  {featuredProduct.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
