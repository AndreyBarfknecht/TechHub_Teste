// src/components/layout/Navbar.tsx
// MUDANÇAS FEITAS NESSE ARQUIVO:
// 1. Importado useCart
// 2. Badge do carrinho agora mostra o número real de itens
// 3. Botão do carrinho navega para /cart

import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, Search, User, UserCog, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';       // NOVO
import './Navbar.css';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsMenuOpen(false);
    } else {
      navigate('/products');
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <>
      <nav className="navbar glass">
        <div className="container nav-content">
          <div className="nav-brand">
            <Menu className="menu-icon" size={24} onClick={toggleMenu} />
            <Link to="/" onClick={closeMenu}>
              <h2>Tech<span className="text-primary">Hub</span></h2>
            </Link>
          </div>

          <form className="nav-search hidden-mobile" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Procure produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Search className="search-icon" size={20} onClick={handleSearch} style={{ cursor: 'pointer' }} />
          </form>

          <div className="nav-actions">
            {user ? (
              <>
                {user.email === 'admin@gmail.com' && (
                  <Link to="/admin" className="icon-btn hidden-mobile" aria-label="Admin" title="Admin">
                    <UserCog size={24} color="var(--text-main)" />
                  </Link>
                )}
                <Link to="/profile" className="icon-btn hidden-mobile" aria-label="Perfil" title="Meu Perfil">
                  <User size={24} />
                </Link>
                <button className="icon-btn hidden-mobile" aria-label="Logout" onClick={signOut} title="Sair">
                  <LogOut size={24} />
                </button>
              </>
            ) : (
              <Link to="/login" className="icon-btn hidden-mobile" aria-label="Login" title="Entrar">
                <User size={24} />
              </Link>
            )}

            <Link to="/cart" className="icon-btn cart-btn" aria-label="Carrinho" onClick={closeMenu}>
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu} />
      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <h2>Menu</h2>
            <button className="close-btn" onClick={closeMenu}>&times;</button>
          </div>

          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="mobile-search-icon" size={20} onClick={handleSearch} />
          </form>

          <div className="mobile-nav-links">
            <Link to="/products" onClick={closeMenu} className="mobile-link">
              Todos os Produtos
            </Link>

            <div className="mobile-divider" />

            {user ? (
              <>
                <div className="user-info-brief">
                  <User size={20} />
                  <span>{user.email}</span>
                </div>

                {user.email === 'admin@gmail.com' && (
                  <Link to="/admin" onClick={closeMenu} className="mobile-link admin-link">
                    <UserCog size={20} /> Painel Admin
                  </Link>
                )}

                <Link to="/profile" onClick={closeMenu} className="mobile-link">
                  <User size={20} /> Meu Perfil
                </Link>

                <button className="mobile-link logout-btn" onClick={() => { signOut(); closeMenu(); }}>
                  <LogOut size={20} /> Sair
                </button>
              </>
            ) : (
              <Link to="/login" onClick={closeMenu} className="mobile-link">
                <User size={20} /> Entrar / Cadastrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;