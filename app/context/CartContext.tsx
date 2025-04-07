import React, { createContext, useContext, useState, useEffect } from "react";
import { type CartItem } from "~/services/api";

type CartableItem = {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartableItem) => boolean;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  isItemInCart: (itemId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from sessionStorage on initial render
  useEffect(() => {
    const storedCart = sessionStorage.getItem("shoppingCart");
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        const inCartItems = parsedCart.filter(
          (item: CartItem) => item.Category === "In Cart"
        );
        setCartItems(inCartItems);
      } catch (error) {
        console.error("Error parsing cart data:", error);
        setCartItems([]);
      }
    }
  }, []);

  // Update sessionStorage whenever cartItems changes
  useEffect(() => {
    sessionStorage.setItem("shoppingCart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: CartableItem): boolean => {
    // Check if item already exists in cart
    if (isItemInCart(item.ItemID)) {
      return false;
    }

    // Create a CartItem from the CartableItem
    const cartItem: CartItem = {
      ItemID: item.ItemID,
      Title: item.Title,
      TypeName: item.TypeName,
      Status: item.Status,
      Category: "In Cart",
    };

    setCartItems((prevItems) => [...prevItems, cartItem]);
    return true;
  };

  const removeFromCart = (itemId: number) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.ItemID !== itemId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isItemInCart = (itemId: number) => {
    return cartItems.some((item) => item.ItemID === itemId);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, isItemInCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
