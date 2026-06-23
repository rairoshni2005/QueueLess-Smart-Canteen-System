import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('queueless_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart items', e);
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('queueless_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item, quantity = 1) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((i) => i.foodId === item._id);
      if (existing) {
        return prevItems.map((i) =>
          i.foodId === item._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prevItems, { foodId: item._id, name: item.name, price: item.price, image: item.image, quantity }];
    });
  };

  const removeFromCart = (foodId) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((i) => i.foodId === foodId);
      if (existing && existing.quantity > 1) {
        return prevItems.map((i) =>
          i.foodId === foodId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prevItems.filter((i) => i.foodId !== foodId);
    });
  };

  const removeProductCompletely = (foodId) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.foodId !== foodId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        removeProductCompletely,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
