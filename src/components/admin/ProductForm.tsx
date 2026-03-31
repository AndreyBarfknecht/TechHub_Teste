import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product } from './types';

interface ProductFormProps {
  onProductAdded: () => void;
  editingProduct: Product | null;
  onCancelEdit: () => void;
  onProductUpdated: () => void;
}

export default function ProductForm({ onProductAdded, editingProduct, onCancelEdit, onProductUpdated }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  interface Category {
    id: string;
    name: string;
  }

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setDescription(editingProduct.description || '');
      setPrice(editingProduct.price.toString());
      setStock(editingProduct.stock_quantity.toString());
      setCategoryId(editingProduct.category_id);
      setIsFeatured(editingProduct.is_featured);
      setImageFile(null);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setStock('0');
      setCategoryId('');
      setIsFeatured(false);
      setImageFile(null);
    }
  }, [editingProduct]);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data) {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let image_url = editingProduct?.image_url || null;

      if (imageFile) {
        // Delete old image if editing
        if (editingProduct?.image_url) {
          const oldFilename = editingProduct.image_url.split('/').pop();
          if (oldFilename) {
            const { error: deleteError } = await supabase.storage.from('product-images').remove([oldFilename]);
            if (deleteError) console.error('Old image delete error:', deleteError);
          }
        }

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);

        if (uploadError) throw new Error(`Erro no upload da imagem: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        image_url = publicUrlData.publicUrl;
      }

      const productData = {
        name,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stock),
        category_id: categoryId,
        image_url,
        is_featured: isFeatured,
        updated_at: new Date().toISOString()
      };

      if (editingProduct) {
        // Update
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (updateError) throw new Error(`Erro ao atualizar produto: ${updateError.message}`);

        setSuccess('Produto atualizado com sucesso!');
        onProductUpdated();
      } else {
        // Create
        const newId = crypto.randomUUID();

        const { error: insertError } = await supabase.from('products').insert({
          ...productData,
          id: newId,
          created_at: new Date().toISOString()
        });

        if (insertError) throw new Error(`Erro ao salvar produto: ${insertError.message}`);

        setSuccess('Produto cadastrado com sucesso!');
        onProductAdded();
      }
      
      // Reset form
      const fileInput = document.getElementById('imageFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setImageFile(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancelEdit();
  };

  return (
        <div className="card" style={{ padding: '32px' }}>
          {success && (
            <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
              {success}
            </div>
          )}
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Nome do Produto</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
            </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Descrição</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Preço (R$)</label>
            <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Estoque</label>
            <input required type="number" step="1" value={stock} onChange={e => setStock(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Categoria</label>
          <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Imagem do Produto</label>
          <input required id="imageFile" type="file" accept="image/jpeg, image/png, image/webp" onChange={e => setImageFile(e.target.files?.[0] || null)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: '18px', height: '18px' }} />
          <label htmlFor="isFeatured" style={{ fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>Produto em Destaque</label>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button type="submit" disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Salvando...' : editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
          </button>
          {editingProduct && (
            <button type="button" onClick={handleCancel} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #6b7280', background: 'white', cursor: 'pointer' }}>
              Cancelar Edição
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
