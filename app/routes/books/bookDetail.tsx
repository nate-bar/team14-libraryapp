import { useParams } from "react-router";
import { useEffect, useState } from "react";
import "../ItemStyle.css";

interface Book {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
}

export default function BookDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    fetch(`/api/items/${itemId}`)
      .then((response) => response.json())
      .then((data) => setBook(data))
      .catch((error) => console.error("Error fetching book:", error));
  }, [itemId]);

  if (!book) {
    return <div className="item-container"><h2>Loading book details...</h2></div>;
  }

  return (
    <div className="item-container">
      <h1 className="item-title">{book.Title}</h1>
      <div className="item-info">
        <p><strong>Type:</strong> {book.TypeName}</p>
        <p><strong>Status:</strong> {book.Status}</p>
      </div>
    </div>
  );
}
