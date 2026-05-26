import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Importado para navegação
import { supabase } from '../../lib/supabase';
import type { Product } from './types';
import { Edit2, Trash2, PackageSearch, Eye, ToggleLeft, ToggleRight, CheckCircle2, XCircle } from 'lucide-react';

interface ProductListProps {
  refreshTrigger: number;
  onEdit: (product: Product) => void;
  onDelete: () => void;
}

export default function ProductList({ refreshTrigger, onEdit, onDelete }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setProducts(data);
        setLoading(false);
      });
  }, [refreshTrigger]);

  const handleToggleActive = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) throw error;
      
      // Update local state for immediate feedback
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, is_active: !p.is_active } : p
      ));
    } catch (err) {
      console.error('Error toggling product status:', err);
      alert('Erro ao alterar status do produto. Verifique se a coluna is_active existe no banco de dados.');
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Atenção: Tem a certeza que deseja eliminar "${product.name}"?\nEsta ação não pode ser desfeita.`)) return;

    try {
      if (product.image_urls && product.image_urls.length > 0) {
        for (const url of product.image_urls) {
          const filename = url.split('/').pop();
          if (filename) {
            await supabase.storage.from('product-images').remove([filename]);
          }
        }
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      onDelete();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      alert(`Erro ao remover produto: ${message}`);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>A carregar catálogo...</div>;

  if (products.length === 0) {
    return (
      <div className="admin-section" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <PackageSearch size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Catálogo Vazio</h3>
        <p style={{ color: 'var(--text-muted)' }}>Ainda não registou nenhum produto na sua loja.</p>
      </div>
    );
  }

  const getStockStatus = (qty: number) => {
    if (qty === 0) return <span className="item-stock stock-out">Esgotado</span>;
    if (qty < 5) return <span className="item-stock stock-low">Baixo: {qty} un</span>;
    return <span className="item-stock stock-good">Stock: {qty} un</span>;
  };

  return (
    <div className="product-list-container">
      {products.map(product => (
        <div key={product.id} className={`product-list-item ${!product.is_active ? 'item-disabled' : ''}`}>
          
          <div className="item-info-group">
            <div style={{ position: 'relative' }}>
              {product.image_urls && product.image_urls.length > 0 ? (
                <img src={product.image_urls[0]} alt={product.name} className="item-thumb" />
              ) : (
                <div className="item-thumb-empty">S/ Img</div>
              )}
              {!product.is_active && (
                <div className="item-status-overlay">
                  <XCircle size={14} /> Inativo
                </div>
              )}
            </div>
            
            <div className="item-details">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3>{product.name}</h3>
                {product.is_active ? (
                  <CheckCircle2 size={14} color="#059669" title="Ativo" />
                ) : (
                  <XCircle size={14} color="#dc2626" title="Inativo" />
                )}
              </div>
              <span className="item-category">{product.category?.name || 'Sem categoria'}</span>
            </div>
          </div>
          
          <div className="item-stats">
            <div className="item-price">
              {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            {getStockStatus(product.stock_quantity)}
          </div>

          <div className="item-actions">
            {/* BOTÃO DE STATUS (ATIVAR/DESATIVAR) */}
            <button
              onClick={() => handleToggleActive(product)}
              className={`btn-icon ${product.is_active ? 'active' : 'inactive'}`}
              title={product.is_active ? "Desativar Produto" : "Ativar Produto"}
              style={{
                border: product.is_active ? "1px solid #d1fae5" : "1px solid #fee2e2",
                color: product.is_active ? "#059669" : "#dc2626"
              }}
            >
              {product.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            </button>

            {/* BOTÃO: VER PRODUTO NA LOJA */}
            <Link 
              to={`/product/${product.id}`} 
              className="btn-icon" 
              style={{ color: '#059669', border: '1px solid #d1fae5' }}
              title="Ver na Loja"
            >
              <Eye size={16} />
            </Link>

            <button
              onClick={() => onEdit(product)}
              className="btn-icon btn-edit"
              title="Editar Produto"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(product)}
              className="btn-icon btn-delete"
              title="Eliminar Produto"
            >
              <Trash2 size={16} />
            </button>
          </div>
          
        </div>
      ))}
    </div>
  );
}
