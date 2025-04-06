import { useState } from "react";
import { type Items } from "~/services/api";
import { Outlet, useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";

interface ItemActionButtonsProps {
  item: Items;
}

export default function ItemActionButtons({ item }: ItemActionButtonsProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const authData = useOutletContext<AuthData>();

  const handleAddToCart = () => {
    // check if user is logged in
    if (!authData.isLoggedIn) {
      alert("Please login first");
      return;
    }

    const cart = JSON.parse(sessionStorage.getItem("shoppingCart") || "[]");
    const existingItemIndex = cart.findIndex(
      (cartItem: any) => cartItem.ItemID === item.ItemID
    );

    // check if item already exists in cart
    if (existingItemIndex >= 0) {
      alert("Item is already in your cart");
      return;
    }

    const itemWithCategory = {
      ...item,
      Category: "In Cart",
    };

    const updatedCart = [...cart, itemWithCategory];
    sessionStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));

    alert("Item added to cart");
  };

  const handleHoldRequest = () => {
    if (!authData.isLoggedIn) {
      alert("Please login first");
      return;
    }

    setIsSubmitting(true);

    fetch("/api/holdrequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemid: item.ItemID,
        memberid: authData.memberID,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          // error 409 is returned by the server if user already has book on hold
          if (response.status === 409) {
            throw new Error(
              data.error || "You already have a hold request for this item"
            );
          }
          throw new Error(
            data.error || `HTTP error! Status: ${response.status}`
          );
        }

        return data;
      })
      .then((data) => {
        alert("Hold request submitted successfully");
        console.log("Server response:", data);
        setIsSubmitting(false);
      })
      .catch((error) => {
        console.error("Error submitting hold request:", error);
        alert(error.message);
        setIsSubmitting(false);
      });
  };

  return (
    <div className="item-actions">
      {/* add to cart button - only shown for Available items */}
      {item.Status === "Available" && (
        <button
          className="btn btn-primary"
          onClick={handleAddToCart}
          disabled={isSubmitting}
        >
          Add to Cart
        </button>
      )}

      {/* hold request button - only shown for Checked Out items */}
      {item.Status === "Checked Out" && (
        <button
          className="btn btn-secondary hold-button"
          onClick={handleHoldRequest}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Place Hold Request"}
        </button>
      )}
    </div>
  );
}
