import React from 'react';
import { Star } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

const reviews: Review[] = [
  { id: 1, name: "Ana Silva", rating: 5, comment: "Produtos incríveis e entrega super rápida. Recomendo a todos!", date: "2 dias atrás" },
  { id: 2, name: "Marcos Souza", rating: 4, comment: "Ótima qualidade, o notebook superou minhas expectativas.", date: "1 semana atrás" },
  { id: 3, name: "Julia Costa", rating: 5, comment: "Atendimento excelente e produtos originais. Nota 10!", date: "2 semanas atrás" },
];

const Testimonials: React.FC = () => {
  return (
    <section className="testimonials container">
      <div className="section-header text-center">
        <h2>O que nossos clientes dizem</h2>
        <p className="section-subtitle">Descubra por que a TechHub é a loja preferida de tecnologia</p>
      </div>
      <div className="testimonials-grid">
        {reviews.map(review => (
          <div key={review.id} className="testimonial-card">
            <div className="testimonial-quote-icon">"</div>
            <div className="testimonial-rating">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < review.rating ? "var(--primary)" : "transparent"}
                  color={i < review.rating ? "var(--primary)" : "var(--border)"}
                />
              ))}
            </div>
            <p className="testimonial-text">{review.comment}</p>
            <div className="testimonial-author border-t pt-4 mt-auto">
              <div>
                <span className="author-name d-block">{review.name}</span>
                <span className="author-date">{review.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
