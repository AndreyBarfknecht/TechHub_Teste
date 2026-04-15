import React, { useState } from "react";
import { MapPin, Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import "./FreightSimulator.css";

export const FreightSimulator: React.FC = () => {
  const [cep, setCep] = useState('');
  const [freightResult, setFreightResult] = useState<{message: string, isError: boolean} | null>(null);

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCep(formatCEP(e.target.value));
  };

  const handleCalculateFreight = () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setFreightResult({ message: 'Frete Grátis — Entrega em 5 a 7 dias úteis.', isError: false });
    } else {
      setFreightResult({ message: 'CEP inválido. Por favor, verifique.', isError: true });
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
        />
        <button type="button" onClick={handleCalculateFreight}>Calcular</button>
      </div>
      
      {freightResult && (
        <div className={`freight-result ${freightResult.isError ? 'error' : ''}`}>
          {freightResult.isError ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          <span>{freightResult.message}</span>
          {!freightResult.isError && <Truck size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
        </div>
      )}
    </div>
  );
};
