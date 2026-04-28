import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ShippingCalculatorProps {
  onShippingRateChange: (rate: number) => void;
}

export function ShippingCalculator({ onShippingRateChange }: ShippingCalculatorProps) {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingRate, setShippingRate] = useState<number | null>(null);

  const calculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cep.length !== 8) {
      setError('CEP inválido. Insira 8 dígitos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // This calls the Supabase Edge Function proxy to avoid exposing the Melhor Envios token
      const { data, error: apiError } = await supabase.functions.invoke('get-shipping-rates', {
        body: { cep }
      });

      if (apiError) throw apiError;
      if (!data || !data.rate) throw new Error('Não foi possível calcular o frete para este CEP.');

      const rateValue = data.rate;
      setShippingRate(rateValue);
      onShippingRateChange(rateValue);
    } catch (err: any) {
      setError(err.message || 'Erro ao calcular frete.');
      setShippingRate(null);
      onShippingRateChange(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <form onSubmit={calculateShipping} style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="00000-000"
            value={cep}
            onChange={e => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
            style={{
              width: '100%',
              padding: '10px 10px 10px 35px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ padding: '10px 16px', fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? <Loader2 size={16} className="spin" /> : 'Calcular'}
        </button>
      </form>

      {error && <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>}

      {shippingRate !== null && !error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '13px', color: '#166534' }}>Melhor Opção de Frete:</span>
          <span style={{ fontWeight: 'bold', color: '#166534' }}>
            {shippingRate.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      )}
    </div>
  );
}
