import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface AnnouncementSettings {
  message: string;
  link: string;
  is_active: boolean;
}

const StoreSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'announcement_bar')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const val = data.value as AnnouncementSettings;
        setMessage(val.message);
        setLink(val.link);
        setIsActive(val.is_active);
      }
    } catch (err: any) {
      console.error('Erro ao buscar configurações:', err);
      setStatus({ type: 'error', text: 'Não foi possível carregar as configurações.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          key: 'announcement_bar',
          value: { message, link, is_active: isActive },
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setStatus({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } catch (err: any) {
      console.error('Erro detalhado ao salvar:', err);
      const errorMsg = err.message || 'Erro desconhecido';
      setStatus({ type: 'error', text: `Erro ao salvar: ${errorMsg}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader2 className="spinning" />
      </div>
    );
  }

  return (
    <div className="store-settings-form">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Settings size={24} color="var(--primary)" />
        <h2 style={{ margin: 0 }}>Configurações do Banner</h2>
      </div>

      <form onSubmit={handleSave}>
        <div className="admin-form-group">
          <label className="admin-label">Mensagem do Banner</label>
          <input
            type="text"
            className="admin-input"
            placeholder="Ex: Frete grátis acima de R$ 200!"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.4rem' }}>
            Este texto aparecerá na barra azul no topo do site.
          </p>
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Link de Destino</label>
          <input
            type="text"
            className="admin-input"
            placeholder="Ex: /products ou https://..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>

        <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
          <input
            type="checkbox"
            id="banner-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="banner-active" style={{ cursor: 'pointer', fontWeight: 500 }}>
            Banner Ativo (Exibir no site)
          </label>
        </div>

        {status.text && (
          <div className={`admin-alert ${status.type}`} style={{ margin: '1.5rem 0' }}>
            {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{status.text}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={saving}
          style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
        >
          {saving ? <Loader2 size={18} className="spinning" /> : <Save size={18} />}
          Salvar Configurações
        </button>
      </form>
    </div>
  );
};

export default StoreSettings;
