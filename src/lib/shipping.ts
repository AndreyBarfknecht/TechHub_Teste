import { supabase } from './supabase';

export interface ShippingRate {
  rate: number;
  deliveryDays: number;
  carrier: string;
  city?: string;
  state?: string;
}

/**
 * Fetches address details (city, state) from ViaCEP.
 */
export async function getAddressFromCep(cep: string) {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.erro) return null;
    return {
      city: data.localidade || '',
      state: data.uf || '',
      address: data.logradouro || ''
    };
  } catch (err) {
    console.error('Error fetching ViaCEP:', err);
    return null;
  }
}

/**
 * Calculates shipping rate based on CEP.
 * First tries the Supabase Edge Function, falls back to a mock calculation if it fails.
 */
export async function calculateShippingRate(cep: string): Promise<ShippingRate> {
  const cleanCep = cep.replace(/\D/g, '');

  if (cleanCep.length !== 8) {
    throw new Error('CEP deve ter 8 dígitos.');
  }

  // Fetch address info first (crucial for city confirmation)
  const addressInfo = await getAddressFromCep(cleanCep);
  
  if (!addressInfo) {
    throw new Error('CEP não encontrado. Verifique os números.');
  }

  try {
    // Attempt to use the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('get-shipping-rates', {
      body: { cep: cleanCep }
    });

    if (!error && data && typeof data.rate === 'number') {
      return {
        rate: data.rate,
        deliveryDays: data.delivery_days || 5,
        carrier: data.carrier || 'Melhor Envios',
        city: addressInfo.city,
        state: addressInfo.state
      };
    }

    // Fallback to mock logic ONLY for valid CEPs
    const mock = getMockShippingRate(cleanCep);
    return {
      ...mock,
      city: addressInfo.city,
      state: addressInfo.state
    };

  } catch (err) {
    console.error('Shipping calculation error:', err);
    const mock = getMockShippingRate(cleanCep);
    return {
      ...mock,
      city: addressInfo.city,
      state: addressInfo.state
    };
  }
}

/**
 * Fallback mock logic for school project/testing.
 * Generates a pseudo-random shipping rate based on the first digit of the CEP.
 */
function getMockShippingRate(cep: string): ShippingRate {
  const firstDigit = parseInt(cep[0]);

  // Deterministic mock rates based on Brazil's postal regions
  // 0-3: South/Southeast (Cheaper)
  // 4-9: North/Northeast/Midwest (More expensive)
  let rate = 15.90;
  let days = 3;
  let carrier = 'Correios (SEDEX)';

  if (firstDigit >= 4) {
    rate = 29.90;
    days = 7;
    carrier = 'Correios (PAC)';
  }

  if (firstDigit >= 7) {
    rate = 45.50;
    days = 12;
    carrier = 'Logística Express';
  }

  // Add some "randomness" based on the CEP itself
  const modifier = (parseInt(cep.slice(-2)) % 10);
  rate += modifier;
  days += Math.floor(modifier / 3);

  return {
    rate,
    deliveryDays: days,
    carrier
  };
}
