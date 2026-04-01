import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product } from './types';
import { Edit, Trash2 } from 'lucide-react';

interface ProductListProps {
  refreshTrigger: number;
  onEdit: (product: Product) => void;
  onDelete: () => void;
  onDeleteError?: (error: string) => void;
}

export default function ProductList({ refreshTrigger, onEdit, onDelete, onDeleteError }: ProductListProps) {
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

  const handleDelete = async (product: Product) => {
    if (!confirm(`Tem certeza que deseja remover "${product.name}"?`)) return;

    try {
      // Delete from storage if image exists
      if (product.image_url) {
        const filename = product.image_url.split('/').pop();
        if (filename) {
          const { error: storageError } = await supabase.storage.from('product-images').remove([filename]);
          if (storageError) console.error('Storage delete error:', storageError);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      onDelete();
    } catch (err: unknown) {
      console.error('Delete error:', err);
      onDeleteError?.(err instanceof Error ? err.message : 'Erro ao remover produto');
    }
  };

  if (loading) return <div>Carregando produtos...</div>;

  if (products.length === 0) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
        Nenhum produto cadastrado ainda.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {products.map(product => (
        <div key={product.id} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Sem img</span>
              </div>
            )}
            
            <div>
              <h3 style={{ fontSize: '16px', margin: 0 }}>{product.name}</h3>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{product.category?.name || 'Sem categoria'}</p>
          </div>
          </div>
          
          <div style={{ textAlign: 'right', minWidth: '140px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div style={{ fontSize: '12px', color: product.stock_quantity > 0 ? '#059669' : '#dc2626' }}>
              Estoque: {product.stock_quantity}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onEdit(product)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #4F46E5',
                background: 'transparent',
                color: '#4F46E5',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              title="Editar"
            >
              <Edit size={14} />
              Editar
            </button>
            <button
              onClick={() => handleDelete(product)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #DC2626',
                background: 'transparent',
                color: '#DC2626',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              title="Remover"
            >
              <Trash2 size={14} />
              Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
