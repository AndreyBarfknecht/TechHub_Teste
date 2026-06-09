import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { calculateShippingRate, type ShippingRate } from '../../lib/shipping';

interface ShippingCalculatorProps {
  onShippingRateChange: (rate: number) => void;
}

export function ShippingCalculator({ onShippingRateChange }: ShippingCalculatorProps) {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ShippingRate | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Remove a máscara antes de enviar para a API
      const cleanCep = cep.replace(/\D/g, '');
      const data = await calculateShippingRate(cleanCep);
      setResult(data);
      onShippingRateChange(data.rate);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao calcular frete.';
      setError(message);
      setResult(null);
      onShippingRateChange(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    setCep(value.substring(0, 9));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <form onSubmit={handleCalculate} style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="00000-000"
            value={cep}
            onChange={handleCepChange}
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

      {result && !error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {result.city && (
            <div style={{ fontSize: '12px', color: '#15803d', marginBottom: '4px', borderBottom: '1px solid #bbf7d0', paddingBottom: '4px' }}>
              📍 <strong>{result.city}, {result.state}</strong>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#166534', fontWeight: 500 }}>{result.carrier}</span>
            <span style={{ fontWeight: 'bold', color: '#166534' }}>
              {result.rate.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#15803d' }}>
            Prazo de entrega: aproximadamente {result.deliveryDays} dias úteis.
          </span>
        </div>
      )}
    </div>
  );
}
