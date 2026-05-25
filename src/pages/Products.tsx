import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/product';
import ProductCard from '../components/ui/ProductCard';
import './Products.css'; // Assumindo que existe ou criar se necessário

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || '';
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
        let query = supabase
          .from('products')
          .select('*, categories!inner(name)')
          .order('created_at', { ascending: false });

        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        if (categoryQuery) {
          query = query.eq('categories.name', categoryQuery);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Erro ao buscar produtos:", error);
        } else if (data) {
          setProducts(data as Product[]);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, categoryQuery]);

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

  const filteredProducts = products
    .filter(p => {
      const min = minPrice !== '' ? parseFloat(minPrice) : null;
      const max = maxPrice !== '' ? parseFloat(maxPrice) : null;
      if (min !== null && !isNaN(min) && p.price < min) return false;
      if (max !== null && !isNaN(max) && p.price > max) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.price - b.price;
      if (sortOrder === 'desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="container fade-in" style={{ padding: '4rem 1.5rem', minHeight: '60vh' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        {searchQuery ? `Resultados para "${searchQuery}"` : categoryQuery ? `Categoria: ${categoryQuery}` : 'Nossos Produtos'}
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
        {searchQuery || categoryQuery 
          ? `Encontramos ${filteredProducts.length} ${filteredProducts.length === 1 ? 'produto' : 'produtos'} correspondentes.`
          : 'Explore toda a nossa coleção de produtos premium.'}
      </p>

      {/* FILTRO DE PREÇO */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
        marginBottom: '1.5rem',
        padding: '1rem 1.25rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
          Filtrar por preço:
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>De</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="R$ mín"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            onKeyDown={(e) => {
              const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
              if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && e.key !== '.') {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              const text = e.clipboardData.getData('text');
              if (!/^\d*\.?\d*$/.test(text)) e.preventDefault();
            }}
            style={{
              width: '110px',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              color: 'var(--text-main)',
              background: 'var(--surface)',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>até</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="R$ máx"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            onKeyDown={(e) => {
              const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
              if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && e.key !== '.') {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              const text = e.clipboardData.getData('text');
              if (!/^\d*\.?\d*$/.test(text)) e.preventDefault();
            }}
            style={{
              width: '110px',
              padding: '0.75rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              color: 'var(--text-main)',
              background: 'var(--surface)',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Ordenar:</span>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'none' | 'asc' | 'desc')}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              color: 'var(--text-main)',
              background: 'var(--surface)',
              cursor: 'pointer',
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          >
            <option value="none">Relevância</option>
            <option value="asc">Menor preço</option>
            <option value="desc">Maior preço</option>
          </select>
        </div>

        {(minPrice !== '' || maxPrice !== '' || sortOrder !== 'none') && (
          <button
            onClick={() => { setMinPrice(''); setMaxPrice(''); setSortOrder('none'); }}
            style={{
              padding: '0.5rem 1rem',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'var(--transition)',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.borderColor = '#dc2626';
              (e.target as HTMLButtonElement).style.color = '#dc2626';
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.target as HTMLButtonElement).style.color = 'var(--text-muted)';
            }}
          >
            ✕ Limpar filtro
          </button>
        )}

        {(minPrice !== '' || maxPrice !== '' || sortOrder !== 'none') && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </span>
        )}
      </div>
      {/* FIM FILTRO DE PREÇO */}

      {filteredProducts.length === 0 && products.length > 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: '#666', fontStyle: 'italic', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Nenhum produto encontrado nessa faixa de preço.
          </p>
          <button
            onClick={() => { setMinPrice(''); setMaxPrice(''); setSortOrder('none'); }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.95rem' }}
          >
            Limpar filtro de preço
          </button>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: '#666', fontStyle: 'italic', fontSize: '1.1rem', marginBottom: '1rem' }}>
            {searchQuery 
              ? `Nenhum produto encontrado para "${searchQuery}".` 
              : categoryQuery 
                ? `Nenhum produto encontrado na categoria "${categoryQuery}".`
                : 'Nenhum produto cadastrado ainda.'}
          </p>
          {(searchQuery || categoryQuery) && (
            <button 
              onClick={() => {
                setProducts([]);
                window.location.href = '/products';
              }}
              style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Ver todos os produtos
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
