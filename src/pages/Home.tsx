import { ArrowRight } from 'lucide-react';
import './Home.css';
import { Link } from 'react-router-dom';
import Hero from '../components/home/Hero';
import CategoryGrid from '../components/home/CategoryGrid';
import Testimonials from '../components/home/Testimonials';
import ProductCard from '../components/ui/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import { useTrendingProducts } from '../hooks/useTrendingProducts';

const Home = () => {
  const { trendingProducts, loading } = useTrendingProducts();

  return (
    <div className="home fade-in">
      <Hero />

      <CategoryGrid />

      <section className="trending container">
        <div className="section-header text-center">
          <h2>Mais Vendidos da Semana</h2>
          <p className="section-subtitle">Equipamentos selecionados com o melhor custo-benefício</p>
        </div>
        <div className="categories-grid">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))
          ) : trendingProducts.length > 0 ? (
            trendingProducts.map(item => (
              <ProductCard key={item.id} product={item} />
            ))
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', padding: '2rem' }}>Nenhum produto encontrado.</p>
          )}
        </div>
        <div className="text-center mt-4">
          <Link to="/products" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            Explorar Todos <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Testimonials />
    </div>
  );
};

export default Home;
