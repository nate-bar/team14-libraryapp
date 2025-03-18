import { useState, useEffect } from "react";
import "../routes/CartStyle.css";

interface CartItem {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
  Category: "Bookmark" | "Check Out" | "On Hold";
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("shoppingCart") || "[]");
    setCartItems(cart);
  }, []);

  const removeFromCart = (itemId: number) => {
    const updatedCart = cartItems.filter((item) => item.ItemID !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
  };

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>

      <div className="cart-section">
        <h2>Bookmarked</h2>
        {cartItems.filter(item => item.Category === "Bookmark").length ? (
          cartItems.filter(item => item.Category === "Bookmark").map(item => (
            <div key={item.ItemID} className="cart-item">
              <p>{item.Title} ({item.TypeName})</p>
              <button className="btn btn-danger" onClick={() => removeFromCart(item.ItemID)}>Remove</button>
            </div>
          ))
        ) : (
          <p>No bookmarks</p>
        )}
      </div>

      <div className="cart-section">
        <h2>Checked Out</h2>
        {cartItems.filter(item => item.Category === "Check Out").length ? (
          cartItems.filter(item => item.Category === "Check Out").map(item => (
            <div key={item.ItemID} className="cart-item">
              <p>{item.Title} ({item.TypeName})</p>
              <button className="btn btn-danger" onClick={() => removeFromCart(item.ItemID)}>Remove</button>
            </div>
          ))
        ) : (
          <p>No checked out items</p>
        )}
      </div>

      <div className="cart-section">
        <h2>On Hold</h2>
        {cartItems.filter(item => item.Category === "On Hold").length ? (
          cartItems.filter(item => item.Category === "On Hold").map(item => (
            <div key={item.ItemID} className="cart-item">
              <p>{item.Title} ({item.TypeName})</p>
              <button className="btn btn-danger" onClick={() => removeFromCart(item.ItemID)}>Remove</button>
            </div>
          ))
        ) : (
          <p>No items on hold</p>
        )}
      </div>
    </div>
  );
}
