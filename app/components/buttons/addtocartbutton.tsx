import React, { useState } from "react";
import { useCart } from "~/context/CartContext";

type CartableItem = {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
};

interface AddToCartButtonProps {
  item: CartableItem;
  onSuccess?: () => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  item,
  onSuccess,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, isItemInCart } = useCart();

  const handleAddToCart = () => {
    setIsAdding(true);

    try {
      const added = addToCart(item);

      if (added) {
        if (onSuccess) onSuccess();
        alert("Item added to cart");
      } else {
        alert("Item is already in your cart");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      alert("Failed to add item to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      className="btn btn-primary"
      onClick={handleAddToCart}
      disabled={isAdding || isItemInCart(item.ItemID)}
    >
      {isItemInCart(item.ItemID)
        ? "In Cart"
        : isAdding
        ? "Adding..."
        : "Add to Cart"}
    </button>
  );
};

export default AddToCartButton;
