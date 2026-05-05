import React, { useState } from "react";
import { MapPin, Truck, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { calculateShippingRate, type ShippingRate } from "../../lib/shipping";
import "./FreightSimulator.css";

export const FreightSimulator: React.FC = () => {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShippingRate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCep(formatCEP(e.target.value));
  };

  const handleCalculateFreight = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setError('CEP inválido. Por favor, verifique.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await calculateShippingRate(cleanCep);
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao calcular frete.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculateFreight();
    }
  };

  return (
    <div className="freight-simulator">
      <h3><MapPin size={18} /> Calcular Frete e Prazo</h3>
      <div className="freight-input-group">
        <input 
          type="text" 
          placeholder="00000-000" 
          value={cep}
          onChange={handleCepChange}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button type="button" onClick={handleCalculateFreight} disabled={loading}>
          {loading ? <Loader2 size={16} className="spin" /> : 'Calcular'}
        </button>
      </div>
      
      {error && (
        <div className="freight-result error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {result && !error && (
        <div className="freight-result">
          <CheckCircle2 size={18} />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {result.city && (
              <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600, marginBottom: '2px' }}>
                {result.city} - {result.state}
              </span>
            )}
            <span style={{ fontWeight: 600 }}>{result.carrier} — {result.rate.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Entrega em aproximadamente {result.deliveryDays} dias úteis.</span>
          </div>
          <Truck size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </div>
      )}
    </div>
  );
};
