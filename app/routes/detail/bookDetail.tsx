import { useParams } from "react-router";
import { useEffect, useState } from "react";
import "../ItemStyle.css";
import { type Book } from "~/services/api";
import { type CartItem } from "~/services/api";
import AddToCartButton from "~/components/buttons/addtocartbutton";

export default function BookDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/itemdetail/${itemId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setBook(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching book:", error);
        setError("Failed to load book details. Please try again.");
        setLoading(false);
      });
  }, [itemId]);

  if (loading) {
    return (
      <div className="item-container">
        <h2>Loading book details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="item-container">
        <h2>Error</h2>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="item-container">
        <h2>Book not found</h2>
      </div>
    );
  }

  return (
    <div className="item-container">
      <h1 className="item-title">{book.Title}</h1>

      <div className="item-info">
        <div className="info-section">
          {book.Photo ? (
            <img
              src={`data:image/jpeg;base64,${book.Photo}`}
              alt={book.Title}
              className="w-full h-48 object-contain rounded-lg mb-2"
            />
          ) : (
            <p className="text-gray-500">No Photo Available</p>
          )}
          <p>
            <strong>Author:</strong> {book.Authors}
          </p>
          <p>
            <strong>Publisher:</strong> {book.Publisher}
          </p>
          <p>
            <strong>Publication Year:</strong> {book.PublicationYear}
          </p>
          <p>
            <strong>ISBN:</strong> {book.ISBN}
          </p>
          <p>
            <strong>Genre:</strong> {book.GenreName}
          </p>
          <p>
            <strong>Language:</strong> {book.Language}
          </p>
        </div>
      </div>

      <div className="item-actions">
        <div className="item-actions">
          <AddToCartButton item={book} />
        </div>
      </div>
    </div>
  );
}
