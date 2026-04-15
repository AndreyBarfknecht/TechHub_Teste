export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export interface ReviewSubmission {
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
}
