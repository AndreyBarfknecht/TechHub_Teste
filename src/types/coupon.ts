export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;   // null = ilimitado
  usage_count: number;
  is_active: boolean;
  created_at: string;
}
