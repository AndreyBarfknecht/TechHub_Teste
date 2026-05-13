import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, CreditCard } from "lucide-react";
import type { Product } from "../../types/product";
import { useAuth } from "../../context/AuthContext";
import "./ProductPurchaseActions.css";

interface ProductPurchaseActionsProps {
  product: Product;
  onAddToCart: (quantity: number) => void;
}

export const ProductPurchaseActions: React.FC<ProductPurchaseActionsProps> = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();

  const maxQuantity = product.stock_quantity || 10;
  const increaseQuantity = () => setQuantity(prev => Math.min(prev + 1, maxQuantity));
  const decreaseQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  const handleAddToCart = () => {
    onAddToCart(quantity);
  };

  const handleBuyNow = () => {
    onAddToCart(quantity);
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="product-actions">
      <div className="quantity-selector">
        <label>Quantidade</label>
        <div className="qty-controls">
          <button 
            onClick={decreaseQuantity}
            className="qty-btn"
            disabled={quantity <= 1 || product.stock_quantity === 0}
            type="button"
          >
            <Minus size={18} />
          </button>
          <span className="qty-value">{quantity}</span>
          <button 
            onClick={increaseQuantity}
            className="qty-btn"
            disabled={quantity >= maxQuantity || product.stock_quantity === 0}
            type="button"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="purchase-buttons">
        <button 
          disabled={product.stock_quantity === 0}
          className={`btn-add ${product.stock_quantity === 0 ? 'disabled' : ''}`}
          onClick={handleAddToCart}
          type="button"
          style={{ opacity: product.stock_quantity === 0 ? 0.6 : 1, cursor: product.stock_quantity === 0 ? 'not-allowed' : 'pointer' }}
        >
          <ShoppingCart size={20} />
          {product.stock_quantity === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
        </button>
        <button 
          disabled={product.stock_quantity === 0}
          className={`btn-buy ${product.stock_quantity === 0 ? 'disabled' : ''}`}
          onClick={handleBuyNow}
          type="button"
          style={{ opacity: product.stock_quantity === 0 ? 0.6 : 1, cursor: product.stock_quantity === 0 ? 'not-allowed' : 'pointer' }}
        >
          <CreditCard size={20} />
          {product.stock_quantity === 0 ? 'Esgotado' : 'Comprar Agora'}
        </button>
      </div>
    </div>
  );
};
