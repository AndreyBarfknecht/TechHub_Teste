import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Github } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-section">
          <h3 className="footer-title">Willian Store</h3>
          <p className="footer-description">
            Sua loja de confiança para os melhores eletrônicos e gadgets do mercado.
            Qualidade garantida e entrega rápida.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" aria-label="Github"><Github size={20} /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Links Rápidos</h4>
          <ul className="footer-links">
            <li><Link to="/">Início</Link></li>
            <li><Link to="/products">Produtos</Link></li>
            <li><Link to="/login">Minha Conta</Link></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Suporte</h4>
          <ul className="footer-links">
            <li><a href="#shipping">Política de Frete</a></li>
            <li><a href="#returns">Trocas e Devoluções</a></li>
            <li><a href="#privacy">Privacidade</a></li>
            <li><a href="#contact">Contato</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>&copy; {currentYear} Willian Store. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
