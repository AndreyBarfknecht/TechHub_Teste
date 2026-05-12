export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  cpf: string | null;
  cep: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  id: string;
  user_id: string;
  alias: string;
  zip_code: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OrderSummary {
  id: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled';
  total_amount: number;
  created_at: string;
}
