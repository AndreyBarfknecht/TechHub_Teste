
import { ArrowRight, Star, TrendingUp, ShieldCheck, Truck } from 'lucide-react';
import './Home.css';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home fade-in">
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Discover <span className="text-primary">Premium</span> Quality Products
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
          <h2>Trending Categories</h2>
          <Link to="/products" className="view-all">View All <ArrowRight size={16} /></Link>
        </div>
        <div className="categories-grid">
          {[1, 2, 3, 4].map(item => (
            <div key={item} className="category-card card">
              <div className="category-image"></div>
              <div className="category-info">
                <h3>Category {item}</h3>
                <p>Explore Collection</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
