import React, { useState } from 'react';
import { Save, Loader2, X } from 'lucide-react';
import type { Address, ViaCepResponse, ServiceResponse } from '../../types/profile';

interface AddressFormProps {
  initialData?: Address | null;
  onSave: (data: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'> | Partial<Address>) => Promise<ServiceResponse>;
  onCancel: () => void;
  fetchCep: (cep: string) => Promise<ViaCepResponse | null>;
}

export default function AddressForm({ initialData, onSave, onCancel, fetchCep }: AddressFormProps) {
  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [formData, setFormData] = useState({
    alias: initialData?.alias || '',
    zip_code: initialData?.zip_code || '',
    street: initialData?.street || '',
    number: initialData?.number || '',
    complement: initialData?.complement || '',
    neighborhood: initialData?.neighborhood || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    is_default: initialData ? initialData.is_default : false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleCepBlur = async () => {
    const cleanCep = formData.zip_code.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      const data = await fetchCep(cleanCep);
      setLoadingCep(false);
      if (data) {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await onSave({
      ...formData,
      zip_code: formData.zip_code.replace(/\D/g, '')
    });
    setSaving(false);
    if (!error) {
       onCancel(); 
    } else {
       alert('Erro ao salvar endereço.');
    }
  };

  return (
    <div className="card" style={{padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border)'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
        <h4 style={{margin: 0, fontFamily: 'var(--font-heading)'}}>{initialData ? 'Editar Endereço' : 'Novo Endereço'}</h4>
        <button type="button" onClick={onCancel} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'}}>
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="profile-form" style={{maxWidth: '100%'}}>
        <div className="form-row">
          <div className="form-group" style={{flex: 1}}>
            <label>Apelido (ex: Casa)</label>
            <input type="text" name="alias" className="form-input" value={formData.alias} onChange={handleChange} placeholder="Trabalho" required />
          </div>
          <div className="form-group" style={{flex: 1}}>
            <label>CEP {loadingCep && <Loader2 size={12} className="spinning" style={{display: 'inline-block'}} />}</label>
            <input type="text" name="zip_code" className="form-input" value={formData.zip_code} onChange={handleChange} onBlur={handleCepBlur} placeholder="00000-000" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{flex: 2}}>
            <label>Rua / Logradouro</label>
            <input type="text" name="street" className="form-input" value={formData.street} onChange={handleChange} required />
          </div>
          <div className="form-group" style={{flex: 1}}>
            <label>Número</label>
            <input type="text" name="number" className="form-input" value={formData.number} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{flex: 1}}>
            <label>Complemento</label>
            <input type="text" name="complement" className="form-input" value={formData.complement} onChange={handleChange} />
          </div>
          <div className="form-group" style={{flex: 1}}>
            <label>Bairro</label>
            <input type="text" name="neighborhood" className="form-input" value={formData.neighborhood} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{flex: 2}}>
            <label>Cidade</label>
            <input type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} required />
          </div>
          <div className="form-group" style={{flex: 1}}>
            <label>Estado (UF)</label>
            <input type="text" name="state" className="form-input" value={formData.state} onChange={handleChange} required maxLength={2} />
          </div>
        </div>
        {!initialData?.is_default && (
            <div className="form-group" style={{flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem'}}>
                <input type="checkbox" id="is_default" name="is_default" checked={formData.is_default} onChange={handleChange} style={{accentColor: 'var(--primary)', cursor: 'pointer', width: '18px', height: '18px'}} />
                <label htmlFor="is_default" style={{margin: 0, cursor: 'pointer', paddingBottom: '0'}}>Definir como endereço principal</label>
            </div>
        )}
        <div className="form-actions" style={{marginTop: '1rem'}}>
          <button type="button" className="btn-outline" onClick={onCancel} style={{marginRight: '1rem'}}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Loader2 size={18} className="spinning" /> : <Save size={18} style={{marginRight: '0.5rem'}} />} Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
