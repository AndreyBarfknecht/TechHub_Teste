import { useEffect, useState } from 'react';
import { ArrowRight, Star, TrendingUp, ShieldCheck, Truck } from 'lucide-react';
import './Home.css';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .limit(4);
        
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };
    
    fetchProducts();
  }, []);

  return (
    <div className="home fade-in">
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Descubra <span className="text-primary">Premium</span> Quality Products
            </h1>
            <p className="hero-subtitle">
              Shop the latest trends with exclusive deals. Fast shipping, guaranteed satisfaction, and top-tier customer service.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn-primary">Shop Now</Link>
              <button className="btn-secondary">View Trendy Products</button>
            </div>
            
            <div className="features">
              <div className="feature-item">
                <Truck className="feature-icon" size={20} />
                <span>Free Shipping</span>
              </div>
              <div className="feature-item">
                <ShieldCheck className="feature-icon" size={20} />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
          
          <div className="hero-image-wrapper">
            <div className="hero-image-placeholder">
              <Star className="hero-icon" size={64} />
              <p>Premium Collection</p>
            </div>
            <div className="floating-badge">
              <TrendingUp size={16} />
              <span>Trending Now</span>
            </div>
          </div>
        </div>
      </section>

      <section className="trending container">
        <div className="section-header">
          <h2>Trending Products</h2>
          <Link to="/products" className="view-all">View All <ArrowRight size={16} /></Link>
        </div>
        <div className="categories-grid">
          {loading ? (
            <p>Carregando produtos...</p>
          ) : products.length > 0 ? (
            products.map(item => (
              <div key={item.id} className="category-card card" style={{ padding: 0, overflow: 'hidden' }}>
                <div 
                  className="category-image" 
                  style={{ 
                    backgroundImage: `url(${item.image_url})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center', 
                    height: '200px',
                    width: '100%'
                  }}
                ></div>
                <div className="category-info" style={{ padding: '1.5rem', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>{item.name}</h3>
                  <p style={{ color: '#666', margin: '0 0 1rem 0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    {item.description}
                  </p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)', margin: 0 }}>
                    R$ {item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
             <p>Nenhum produto em destaque encontrado.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
