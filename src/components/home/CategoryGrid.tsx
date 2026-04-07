import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Watch, Headphones } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const categories: Category[] = [
  { id: '1', name: 'Smartphones', icon: <Smartphone size={24} /> },
  { id: '2', name: 'Notebooks', icon: <Laptop size={24} /> },
  { id: '3', name: 'Smartwatches', icon: <Watch size={24} /> },
  { id: '4', name: 'Áudios', icon: <Headphones size={24} /> },
];

const CategoryGrid: React.FC = () => {
  return (
    <section className="categories container">
      <div className="section-header text-center">
        <h2>Explore Nossas Categorias</h2>
        <p className="section-subtitle">Encontre tudo o que você precisa no nosso catálogo completo</p>
      </div>
      <div className="category-cards">
        {categories.map(cat => (
          <Link key={cat.id} to={`/products?category=${cat.name}`} className="category-link-card">
            <div className="cat-icon-wrapper">{cat.icon}</div>
            <span className="cat-text">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
