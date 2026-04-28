// src/context/CartContext.tsx
// Esse arquivo cria o "estado global" do carrinho.
// Pensa nele como um armário que qualquer tela do app pode abrir e usar.

import { createContext, useContext, useReducer, useEffect } from 'react';
import type { Product } from '../types/product';

// ----- TIPOS -----
// CartItem = um produto + quantos o usuário quer comprar
export interface CartItem {
  product: Product;
  quantity: number;
}

// Tudo que o contexto vai expor para o app
interface CartContextType {
  items: CartItem[];
  totalItems: number;       // soma de quantidades (ex: 3 produtos = 3)
  totalPrice: number;       // valor total do carrinho
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// ----- AÇÕES DO REDUCER -----
// Um "reducer" é uma função que recebe o estado atual + uma ação e devolve o novo estado.
// É como um controlador de tráfego: cada ação tem um destino certo.
type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_FROM_STORAGE'; items: CartItem[] };

// ----- REDUCER -----
function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {

    case 'LOAD_FROM_STORAGE':
      return action.items;

    case 'ADD_ITEM': {
      // Verifica se o produto já está no carrinho
      const existingIndex = state.findIndex(item => item.product.id === action.product.id);

      if (existingIndex >= 0) {
        // Já existe: soma a quantidade, mas não ultrapassa o estoque
        const updatedItems = [...state];
        const newQty = updatedItems[existingIndex].quantity + action.quantity;
        const maxQty = action.product.stock_quantity;
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: Math.min(newQty, maxQty),
        };
        return updatedItems;
      }

      // Não existe ainda: adiciona como item novo
      return [...state, { product: action.product, quantity: action.quantity }];
    }

    case 'REMOVE_ITEM':
      return state.filter(item => item.product.id !== action.productId);

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        // Se quantidade for 0 ou negativa, remove o item
        return state.filter(item => item.product.id !== action.productId);
      }
      return state.map(item =>
        item.product.id === action.productId
          ? { ...item, quantity: Math.min(action.quantity, item.product.stock_quantity) }
          : item
      );
    }

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
}

// ----- CRIAÇÃO DO CONTEXTO -----
// Aqui criamos o "armário" em si. Começa vazio.
const CartContext = createContext<CartContextType | null>(null);

// ----- PROVIDER -----
// O Provider é o componente que "envolve" o app e disponibiliza o carrinho pra todos.
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  // Ao iniciar o app, carrega o carrinho salvo no localStorage (persiste entre refreshes)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('techhub_cart');
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        dispatch({ type: 'LOAD_FROM_STORAGE', items: parsed });
      }
    } catch {
      // Se o JSON estiver corrompido, ignora
    }
  }, []);

  // Sempre que o carrinho mudar, salva no localStorage
  useEffect(() => {
    localStorage.setItem('techhub_cart', JSON.stringify(items));
  }, [items]);

  // Funções que serão usadas pelos componentes
  const addToCart = (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', product, quantity });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Calcula totais automaticamente sempre que items mudar
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// ----- HOOK PERSONALIZADO -----
// Isso facilita o uso: ao invés de importar CartContext em todo lugar,
// qualquer componente só chama: const { addToCart } = useCart()
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart precisa estar dentro de <CartProvider>');
  }
  return context;
}