import { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) return;
    try {
      const res = await api.getCart();
      if (res && res.success) {
        setCartItems(res.cart.cart_items || []);
      }
    } catch (err) {
      console.error('Lỗi tải giỏ hàng:', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addItemToCart = async (productId, quantity = 1) => {
    if (!user) {
      alert('Vui lòng đăng nhập trước khi mua hàng!');
      return false;
    }
    try {
      const res = await api.addToCart(productId, quantity);
      if (res && res.success) {
        await fetchCart();
        return true;
      } else {
        alert(res.errors || 'Kho hàng không đủ đáp ứng!');
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      const res = await api.updateCartItem(cartItemId, newQuantity);
      if (res && res.success) {
        await fetchCart();
      } else {
        alert(res.errors || 'Cập nhật số lượng thất bại!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const res = await api.removeCartItem(cartItemId);
      if (res && res.success) {
        await fetchCart();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearCartState = () => {
    setCartItems([]);
  };

  const getCartCount = () => cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const getCartTotal = () => cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addItemToCart, 
      updateQuantity, 
      removeItem, 
      getCartCount, 
      getCartTotal, 
      fetchCart,
      clearCartState
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
