export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  image_urls: string[];
  specifications: Record<string, string> | null;
  is_featured: boolean;
  category_id: string;
  category: {
    name: string;
  };
  created_at: string;
}
