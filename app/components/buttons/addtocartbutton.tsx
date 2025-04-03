import { type CartItem } from "~/services/api";

interface AddToCartButtonProps {
  item: {
    ItemID: number;
    Title: string;
    TypeName: string;
    Status: string;
  };
}

export default function AddToCartButton({ item }: AddToCartButtonProps) {
  const handleAction = (action: "In Cart" | "On Hold") => {
    try {
      // Get current cart or initialize empty array
      let cart: CartItem[] = [];
      const cartData = sessionStorage.getItem("shoppingCart");

      if (cartData) {
        cart = JSON.parse(cartData);
        console.log("Existing cart loaded:", cart);
      }

      // Check if item already exists
      if (!cart.some((cartItem) => cartItem.ItemID === item.ItemID)) {
        // Create a simplified item object
        const newItem: CartItem = {
          ItemID: item.ItemID,
          Title: item.Title,
          TypeName: item.TypeName,
          Status: item.Status,
          Category: action,
        };

        cart.push(newItem);
        const newCartString = JSON.stringify(cart);
        sessionStorage.setItem("shoppingCart", newCartString);
        window.dispatchEvent(new Event("cartUpdated"));
        console.log("Item added, new cart:", cart);
        alert(`${item.Title} added to ${action}`);
      } else {
        alert(`${item.Title} is already in the cart`);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      alert("There was an error adding the item to cart");
    }
  };

  if (item.Status === "Available") {
    return (
      <button 
        className="btn btn-primary" 
        onClick={() => handleAction("In Cart")}
      >
        Add to Cart
      </button>
    );
  } else if (item.Status === "Checked Out") {
    return (
      <button 
        className="btn btn-warning" 
        onClick={() => handleAction("On Hold")}
      >
        Place on Hold
      </button>
    );
  } else {
    return (
      <button className="btn btn-disabled" disabled>
        Unavailable
      </button>
    );
  }
}