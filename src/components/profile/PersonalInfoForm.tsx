import React, { useState } from 'react';
import { Save, Loader2, Edit2 } from 'lucide-react';
import type { Profile, ServiceResponse } from '../../types/profile';
import { useAuth } from '../../context/AuthContext';

interface PersonalInfoFormProps {
  profile: Profile;
  onSave: (updates: Partial<Profile>) => Promise<ServiceResponse>;
}

export default function PersonalInfoForm({ profile, onSave }: PersonalInfoFormProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    cpf: profile.cpf || '',
    phone: profile.phone || '',
  });

  const formatCPF = (val: string) => {
    return val.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').slice(0, 14);
  };
  
  const formatPhone = (val: string) => {
    return val.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
  };

  const getMaskedCpf = (cpfStr: string) => {
    const raw = cpfStr.replace(/\D/g, '');
    if (raw.length === 11) {
      return `***.***.***-${raw.substring(9, 11)}`;
    }
    return cpfStr;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === 'full_name') value = value.replace(/[0-9]/g, '');
    if (name === 'cpf') value = formatCPF(value);
    if (name === 'phone') value = formatPhone(value);
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await onSave({
      full_name: formData.full_name,
      cpf: formData.cpf.replace(/\D/g, ''),
      phone: formData.phone.replace(/\D/g, '')
    });
    setSaving(false);
    if (!error) {
      setIsEditing(false);
    } else {
      alert('Erro ao salvar dados.');
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name || '',
      cpf: profile.cpf ? formatCPF(profile.cpf) : '',
      phone: profile.phone ? formatPhone(profile.phone) : '',
    });
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSave} className="profile-form">
      <div className="form-group">
        <label>E-mail</label>
        <input type="email" className="form-input" value={user?.email || ''} readOnly disabled />
      </div>
      <div className="form-group">
        <label>Nome Completo</label>
        <input type="text" name="full_name" className="form-input" value={formData.full_name} onChange={handleChange} disabled={!isEditing} required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>CPF</label>
          <input type="text" name="cpf" className="form-input" 
                 value={isEditing ? formData.cpf : getMaskedCpf(formData.cpf)} 
                 onChange={handleChange} disabled={!isEditing} required />
        </div>
        <div className="form-group">
          <label>Telefone</label>
          <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} disabled={!isEditing} required />
        </div>
      </div>
      
      <div className="form-actions">
        {!isEditing ? (
          <button type="button" className="btn-secondary" onClick={() => setIsEditing(true)}>
            <Edit2 size={18} style={{marginRight: '0.5rem'}} /> Editar Dados
          </button>
        ) : (
          <>
            <button type="button" className="btn-outline" onClick={handleCancel} disabled={saving} style={{marginRight: '1rem'}}>
               Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 size={18} className="spinning" /> : <><Save size={18} style={{marginRight: '0.5rem'}} /> Salvar Dados</>}
            </button>
          </>
        )}
      </div>
    </form>
  );
}
