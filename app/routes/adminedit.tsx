import React, { useEffect, useState } from "react";

interface Book {
  photo: string;
  title: string;
  isbn: string;
}

export default function AdminEditPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    try {
      const res = await fetch("/api/admin/books");
      const { books } = await res.json();
      setBooks(books);
    } catch (error) {
      console.error("Error loading books:", error);
    }
  }

  async function handleDelete(isbn: string) {
    if (!window.confirm("Delete this book?")) return;
    try {
      const res = await fetch(`/api/admin/delete-book/${isbn}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        setMessage("Book deleted.");
        loadBooks();
      } else {
        setMessage(result.error || "Delete failed.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("Error deleting book.");
    }
  }

  return (
    <div>
      <h1>Admin Edit Page</h1>
      {message && <p>{message}</p>}
      <table border={1} cellPadding={5} cellSpacing={0}>
        <thead>
          <tr>
            <th>Photo</th>
            <th>Title</th>
            <th>ISBN</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.isbn}>
              <td>
                <img
                  src={`data:image/jpeg;base64,${book.photo}`} // Ensure Base64 encoding is handled
                  alt={book.title}
                  style={{ width: "80px", height: "auto", objectFit: "cover" }} // Increased size
                />
              </td>
              <td>{book.title}</td>
              <td>{book.isbn}</td>
              <td>
                <button onClick={() => handleDelete(book.isbn)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}