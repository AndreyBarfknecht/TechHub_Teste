import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Watch, Headphones, Gamepad2, MousePointer2, Cpu, LayoutGrid, Tv, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CategoryDB {
  id: string;
  name: string;
}

const iconMap: Record<string, React.ReactNode> = {
  'Smartphones e Wearables': <Smartphone size={24} />,
  'Informática e Hardware': <Cpu size={24} />,
  'Periféricos Gamers': <MousePointer2 size={24} />,
  'Áudio': <Headphones size={24} />,
  'TVs e Vídeo': <Tv size={24} />,
  'Games': <Gamepad2 size={24} />,
  'Smartphones': <Smartphone size={24} />,
  'Notebooks': <Laptop size={24} />,
  'Smartwatches': <Watch size={24} />,
  'Hardware': <Cpu size={24} />,
};

const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<CategoryDB[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('id, name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="categories container">
      <div className="section-header text-center">
        <h2>Explore Nossas Categorias</h2>
        <p className="section-subtitle">Encontre tudo o que você precisa no nosso catálogo completo</p>
      </div>

      <div className="category-slider-wrapper">
        <button className="slider-btn prev" onClick={() => scroll('left')}>
          <ChevronLeft size={24} />
        </button>

        <div className="category-scroll-container" ref={scrollContainerRef}>
          {categories.map(cat => (
            <Link key={cat.id} to={`/products?category=${cat.name}`} className="category-link-card slider-item">
              <div className="cat-icon-wrapper">
                {iconMap[cat.name] || <LayoutGrid size={24} />}
              </div>
              <span className="cat-text">{cat.name}</span>
            </Link>
          ))}

          {categories.length === 0 && Array(6).fill(0).map((_, i) => (
            <div key={i} className="category-link-card slider-item loading-skeleton">
              <div className="cat-icon-wrapper skeleton-circle"></div>
              <div className="skeleton-text"></div>
            </div>
          ))}
        </div>

        <button className="slider-btn next" onClick={() => scroll('right')}>
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default CategoryGrid;
