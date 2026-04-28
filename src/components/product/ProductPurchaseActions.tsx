import React, { useState } from "react";
import { Minus, Plus, ShoppingCart, CreditCard } from "lucide-react";
import type { Product } from "../../types/product";
import "./ProductPurchaseActions.css";

interface ProductPurchaseActionsProps {
  product: Product;
  onAddToCart: () => void;
}

export const ProductPurchaseActions: React.FC<ProductPurchaseActionsProps> = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const maxQuantity = product.stock_quantity || 10;
  const increaseQuantity = () => setQuantity(prev => Math.min(prev + 1, maxQuantity));
  const decreaseQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  const handleAddToCart = () => {
    onAddToCart();
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
          className="btn-add"
          onClick={handleAddToCart}
          type="button"
        >
          <ShoppingCart size={20} />
          Adicionar ao Carrinho
        </button>
        <button 
          disabled={product.stock_quantity === 0}
          className="btn-buy"
          type="button"
        >
          <CreditCard size={20} />
          Comprar Agora
        </button>
      </div>
    </div>
  );
};
