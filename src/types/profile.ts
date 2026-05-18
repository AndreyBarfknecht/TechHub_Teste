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

export interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export interface ServiceResponse {
  error: string | null;
}

export interface OrderSummary {
  id: string;
  status: 'pending' | 'paid' | 'shipped' | 'out_for_delivery' | 'delivered' | 'canceled';
  total_amount: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: {
    name: string;
    image_urls: string[];
  };
}

export interface OrderDetail extends OrderSummary {
  user_id: string;
  subtotal: number;
  shipping_fee: number;
  shipping_address: string;
  payment_method: string;
  order_items: OrderItem[];
}
