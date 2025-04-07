import React from "react";
import { Link } from "react-router";
import { useCart } from "~/context/CartContext";

interface CartIndicatorProps {
  isLoggedIn: boolean;
}

export const CartIndicator: React.FC<CartIndicatorProps> = ({ isLoggedIn }) => {
  const { cartItems } = useCart();

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Link
      to="/cart"
      className="flex items-center mx-2 relative hover:text-blue-600 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {cartItems.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {cartItems.length}
        </span>
      )}
      <span className="ml-1">Cart</span>
    </Link>
  );
};

export default CartIndicator;
