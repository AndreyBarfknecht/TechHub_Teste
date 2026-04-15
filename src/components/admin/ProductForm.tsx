import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product } from './types';
import { Plus, Trash2, Image as ImageIcon, PackageOpen, LayoutList } from 'lucide-react';

interface ProductFormProps {
  onProductAdded: () => void;
  editingProduct: Product | null;
  onCancelEdit: () => void;
  onProductUpdated: () => void;
}

export default function ProductForm({ onProductAdded, editingProduct, onCancelEdit, onProductUpdated }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

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
  const [isFeatured, setIsFeatured] = useState(false);
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  const [specs, setSpecs] = useState<{ key: string, value: string }[]>([]);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setDescription(editingProduct.description || '');
      setPrice(editingProduct.price.toString());
      setStock(editingProduct.stock_quantity.toString());
      setCategoryId(editingProduct.category_id);
      setIsFeatured(editingProduct.is_featured);
      setCurrentImageUrls(editingProduct.image_urls || []);
      
      if (editingProduct.specifications) {
        const specsArray = Object.entries(editingProduct.specifications).map(([key, value]) => ({
          key,
          value: value as string
        }));
        setSpecs(specsArray);
      } else {
        setSpecs([]);
      }
      setImageFiles([]);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setStock('0');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setIsFeatured(false);
      setCurrentImageUrls([]);
      setSpecs([]);
      setImageFiles([]);
    }
  }, [editingProduct, categories]);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data) {
        setCategories(data);
        if (data.length > 0 && !editingProduct) setCategoryId(data[0].id);
      }
    });
  }, []);

  const addSpecRow = () => setSpecs([...specs, { key: '', value: '' }]);
  const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
  const removeCurrentImage = (url: string) => setCurrentImageUrls(currentImageUrls.filter(u => u !== url));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrls = [...currentImageUrls];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
          if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);

          const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
          finalImageUrls.push(publicUrlData.publicUrl);
        }
      }

      const specifications: Record<string, string> = {};
      specs.forEach(s => {
        if (s.key.trim() && s.value.trim()) specifications[s.key.trim()] = s.value.trim();
      });

      const productData = {
        name,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stock),
        category_id: categoryId,
        image_urls: finalImageUrls,
        specifications,
        is_featured: isFeatured,
        updated_at: new Date().toISOString()
      };

      if (editingProduct) {
        const { error: updateError } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (updateError) throw updateError;
        onProductUpdated();
      } else {
        const { error: insertError } = await supabase.from('products').insert({ ...productData, id: crypto.randomUUID() });
        if (insertError) throw insertError;
        onProductAdded();
      }
      
      if (!editingProduct) {
        setName(''); setDescription(''); setPrice(''); setStock('0'); setSpecs([]); setImageFiles([]); setCurrentImageUrls([]);
      }
      
      const fileInput = document.getElementById('imageFiles') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      
      <div className="admin-section">
        <h3 className="admin-section-title">
          <PackageOpen size={20} color="var(--primary)" /> 
          Informações Essenciais
        </h3>
        
        <div className="admin-form-group">
          <label className="admin-label">Nome do Produto</label>
          <input required type="text" className="admin-input" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Descrição (Suporta formato HTML)</label>
          <textarea 
            className="admin-input" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows={5} 
            style={{ resize: 'vertical', fontFamily: 'monospace' }} 
            placeholder="<p>Escreva aqui os detalhes do produto...</p>"
          />
        </div>
        
        <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
          <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: '18px', height: '18px' }} />
          <label htmlFor="isFeatured" style={{ fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>Destacar na página principal</label>
        </div>
      </div>

      <div className="admin-section">
        <h3 className="admin-section-title">
          <LayoutList size={20} color="var(--primary)" /> 
          Preço e Inventário
        </h3>
        
        <div className="grid-3-cols">
          <div className="admin-form-group">
            <label className="admin-label">Preço Final (€)</label>
            <input required type="number" step="0.01" className="admin-input" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Unidades em Stock</label>
            <input required type="number" step="1" className="admin-input" value={stock} onChange={e => setStock(e.target.value)} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Categoria</label>
            <select required className="admin-input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h3 className="admin-section-title">
          <ImageIcon size={20} color="var(--primary)" /> 
          Galeria de Imagens
        </h3>
        
        {currentImageUrls.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            {currentImageUrls.map((url, idx) => (
              <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={url} alt="Produto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={() => removeCurrentImage(url)}
                  style={{ position: 'absolute', top: '4px', right: '4px', background: '#ef4444', color: 'white', borderRadius: '4px', padding: '4px' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="admin-form-group">
          <label className="admin-label">Adicionar Novas Imagens</label>
          <input 
            id="imageFiles" 
            type="file" 
            className="admin-input" 
            multiple 
            accept="image/*" 
            onChange={e => setImageFiles(Array.from(e.target.files || []))} 
            style={{ padding: '2rem 1rem', borderStyle: 'dashed' }}
          />
        </div>
      </div>

      <div className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="admin-section-title" style={{ margin: 0 }}>Especificações Técnicas</h3>
          <button type="button" onClick={addSpecRow} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
            <Plus size={18} /> Adicionar Linha
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {specs.map((spec, index) => (
            <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input placeholder="Característica (ex: Cor)" className="admin-input" value={spec.key} onChange={e => updateSpec(index, 'key', e.target.value)} />
              <input placeholder="Valor (ex: Preto)" className="admin-input" value={spec.value} onChange={e => updateSpec(index, 'value', e.target.value)} />
              <button type="button" onClick={() => removeSpec(index)} style={{ color: '#ef4444', padding: '0.5rem' }}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {specs.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>Nenhuma especificação técnica definida.</p>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}>
          {loading ? 'A processar...' : editingProduct ? 'Guardar Alterações do Produto' : 'Criar Novo Produto'}
        </button>
        
        {editingProduct && (
          <button type="button" onClick={onCancelEdit} style={{ padding: '1rem 2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'white', fontWeight: 600 }}>
            Cancelar Edição
          </button>
        )}
      </div>

    </form>
  );
}
