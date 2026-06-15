import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Github } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-section">
          <h3 className="footer-title">TechStore</h3>
          <p className="footer-description">
            Sua loja de confiança para os melhores eletrônicos e gadgets do mercado.
            Qualidade garantida e entrega rápida.
          </p>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Twitter size={20} /></a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="Github"><Github size={20} /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Links Rápidos</h4>
          <ul className="footer-links">
            <li><Link to="/">Início</Link></li>
            <li><Link to="/products">Produtos</Link></li>
            <li><Link to="/login">Minha Conta</Link></li>
            <li><Link to="/info/contact">FAQ</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Suporte</h4>
          <ul className="footer-links">
            <li><Link to="/info/shipping">Política de Frete</Link></li>
            <li><Link to="/info/returns">Trocas e Devoluções</Link></li>
            <li><Link to="/info/privacy">Privacidade</Link></li>
            <li><Link to="/info/contact">Contato</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>&copy; {currentYear} TechStore. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
