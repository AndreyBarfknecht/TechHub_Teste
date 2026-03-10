
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, Search, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar glass">
      <div className="container nav-content">
        <div className="nav-brand">
          <Menu className="menu-icon" size={24} />
          <Link to="/">
            <h2>Econo<span className="text-primary">Store</span></h2>
          </Link>
        </div>
        
        <div className="nav-search hidden-mobile">
          <input type="text" placeholder="Search for products..." />
          <Search className="search-icon" size={20} />
        </div>

        <div className="nav-actions">
          <button className="icon-btn hidden-mobile" aria-label="Account">
            <User size={24} />
          </button>
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
