import { createContext, useContext, useState, ReactNode } from 'react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
  stock_quantity: number;
  dietary_info: any;
  prep_time_minutes: number;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  tableNumber: string;
  setTableNumber: React.Dispatch<React.SetStateAction<string>>;
  addToCart: (item: MenuItem, quantity: number, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, newQuantity: number) => void;
  getTotalAmount: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState('');

  const addToCart = (menuItem: MenuItem, quantity: number, notes?: string) => {
    const existingItemIndex = cart.findIndex(item => 
      item.menuItem.id === menuItem.id && item.notes === notes
    );
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, { menuItem, quantity, notes }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.menuItem.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(cart.map(item => 
      item.menuItem.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        setCart, 
        tableNumber, 
        setTableNumber, 
        addToCart, 
        removeFromCart, 
        updateCartQuantity, 
        getTotalAmount, 
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};