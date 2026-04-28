
// src/components/layout/Navbar.tsx
// MUDANÇAS FEITAS NESSE ARQUIVO:
// 1. Importado useCart
// 2. Badge do carrinho agora mostra o número real de itens
// 3. Botão do carrinho navega para /cart

import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';       // NOVO
import './Navbar.css';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();                        // NOVO

  return (
    <nav className="navbar glass">
      <div className="container nav-content">
        <div className="nav-brand">
          <Menu className="menu-icon" size={24} />
          <Link to="/">
            <h2>Tech<span className="text-primary">Hub</span></h2>
          </Link>
        </div>

        <div className="nav-search hidden-mobile">
          <input type="text" placeholder="Search for products..." />
          <Search className="search-icon" size={20} />
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              {user.email === 'admin@gmail.com' && (
                <Link to="/admin" className="icon-btn hidden-mobile" aria-label="Admin" title="Admin">
                  <User size={24} />
                </Link>
              )}
              <button className="icon-btn hidden-mobile" aria-label="Logout" onClick={signOut} title="Sair">
                <LogOut size={24} />
              </button>
            </>
          ) : (
            <Link to="/login" className="icon-btn hidden-mobile" aria-label="Login" title="Entrar">
              <User size={24} />
            </Link>
          )}

          {/* MODIFICADO: agora é um Link para /cart e badge usa totalItems real */}
          <Link to="/cart" className="icon-btn cart-btn" aria-label="Carrinho">
            <ShoppingCart size={24} />
            {totalItems > 0 && (                           // só mostra badge se tiver itens
              <span className="cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;