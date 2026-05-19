export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  image_url?: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface ReviewSubmission {
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  image_url?: string;
}
