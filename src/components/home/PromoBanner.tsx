import React from 'react';
import { ShieldCheck, Truck, Clock } from 'lucide-react';

const PromoBanner: React.FC = () => {
  return (
    <section className="promo-banner container">
      <div className="promo-content card">
        <div className="promo-text">
          <h3>Por que comprar com a TechHub?</h3>
          <p>Oferecemos a melhor experiência com produtos originais e suporte especializado.</p>
        </div>
        <div className="promo-features">
          <div className="promo-feature">
            <Truck size={32} className="promo-icon" />
            <div>
              <h4>Frete Grátis</h4>
              <p>Para todo o Brasil</p>
            </div>
          </div>
          <div className="promo-feature">
            <ShieldCheck size={32} className="promo-icon" />
            <div>
              <h4>Garantia Total</h4>
              <p>Compra 100% segura</p>
            </div>
          </div>
          <div className="promo-feature">
            <Clock size={32} className="promo-icon" />
            <div>
              <h4>Suporte 24/7</h4>
              <p>Atendimento rápido</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
