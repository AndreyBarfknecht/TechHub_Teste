import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ProductForm({ onProductAdded }: { onProductAdded: () => void }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);

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
      let image_url = null;

      if (imageFile) {
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

      const newId = crypto.randomUUID();

      const { error: insertError } = await supabase.from('products').insert({
        id: newId,
        name,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stock),
        category_id: categoryId,
        image_url,
        is_featured: isFeatured,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (insertError) throw new Error(`Erro ao salvar produto: ${insertError.message}`);

      setSuccess('Produto cadastrado com sucesso!');
      
      setName('');
      setDescription('');
      setPrice('');
      setStock('0');
      setImageFile(null);
      setIsFeatured(false);
      const fileInput = document.getElementById('imageFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      onProductAdded();
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
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

        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '12px', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Salvando...' : 'Cadastrar Produto'}
        </button>
      </form>
    </div>
  );
}
