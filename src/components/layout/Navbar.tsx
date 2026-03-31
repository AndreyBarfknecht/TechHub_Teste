import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, signOut } = useAuth();
  
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
          
          <button className="icon-btn cart-btn" aria-label="Cart">
            <ShoppingCart size={24} />
            <span className="cart-badge">3</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
