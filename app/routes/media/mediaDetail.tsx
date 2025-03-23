import { useParams } from "react-router";
import { useEffect, useState } from "react";
import "../ItemStyle.css";

interface Media {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
}

export default function MediaDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const [media, setMedia] = useState<Media | null>(null);

  useEffect(() => {
    fetch(`/api/items/${itemId}`)
      .then((response) => response.json())
      .then((data) => setMedia(data))
      .catch((error) => console.error("Error fetching media:", error));
  }, [itemId]);

  if (!media) {
    return (
      <div className="item-container">
        <h2>Loading media details...</h2>
      </div>
    );
  }

  return (
    <div className="item-container">
      <h1 className="item-title">{media.Title}</h1>
      <div className="item-info">
        <p>
          <strong>Type:</strong> {media.TypeName}
        </p>
        <p>
          <strong>Status:</strong> {media.Status}
        </p>
      </div>
    </div>
  );
}
