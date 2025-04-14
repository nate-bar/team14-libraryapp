import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import AddToCartButton from "~/components/buttons/addtocartbutton";
import { type AuthData } from "~/services/api";
import ProfilePage from "./profile";
interface Item {
  ItemID: number;
  Title: string;
  Status: string;
  Photo: string;
  TypeName: string;
  Authors?: string;
  Publisher?: string;
  PublicationYear?: number;
  Summary?: string;
  ISBN?: string;
  GenreName?: string;
  Language?: string;
  Director?: string;
  Leads?: string;
  ReleaseYear?: number;
  MediaID?: number;
  Format?: string;
  Rating?: number;
}

interface HoldItem {
  ItemID: number;
  Title: string;
  Status: string;
  MemberID: string;
  CreatedAt: string;
  HoldStatus: string;
  NextInLine: number;
  ItemData?: Item;
}

export default function Holds() {
  const authData = useOutletContext<AuthData>(); // Get auth data from router context
  const memberID = authData?.memberID || "";

  const [holdItems, setHoldItems] = useState<HoldItem[]>([]);

  useEffect(() => {
    if (memberID) {
      fetchHoldItems();
    }
  }, [memberID]);

  const fetchHoldItems = async () => {
    try {
      const response = await fetch(`/api/profile/holditems/${memberID}`);
      const data = await response.json();

      const itemsWithDetails: HoldItem[] = await Promise.all(
        data.map(async (item: HoldItem) => {
          const itemRes = await fetch(`/api/itemdetail/${item.ItemID}`);
          const itemData = await itemRes.json();
          return {
            ...item,
            ItemData: itemData,
          };
        })
      );

      // Filter to only show active holds
      const activeHoldsOnly = itemsWithDetails.filter(
        (item) => item.HoldStatus === "active"
      );

      setHoldItems(activeHoldsOnly);
    } catch (error) {
      console.error("Error fetching hold items:", error);
    }
  };

  const handleCancelHold = async (itemID: number) => {
    try {
      await fetch("/api/cancelhold", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemID, memberID }),
      });

      fetchHoldItems();
    } catch (error) {
      console.error("Error cancelling hold:", error);
    }
  };
  return (
    <div>
      <ProfilePage />
      <div className="container mx-auto p-6 bg-[#f4f8f7] min-h-screen rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-[#01497c] mb-6">My Holds</h1>
        {holdItems.length === 0 ? (
          <p className="text-gray-600">
            You don’t have any active hold requests.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-[#c2a86d] rounded-md shadow-sm">
              <thead className="bg-[#e4c9a8]">
                <tr>
                  <th className="p-3 border text-left text-[#01497c]">Title</th>
                  <th className="p-3 border text-left text-[#01497c]">
                    Status
                  </th>
                  <th className="p-3 border text-left text-[#01497c]">
                    Requested On
                  </th>
                  <th className="p-3 border text-left text-[#01497c]">
                    Next In Line
                  </th>
                  <th className="p-3 border text-left text-[#01497c]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {holdItems.map((item) => (
                  <tr
                    key={item.ItemID}
                    className="border-t hover:bg-[#f4f8f7] transition-colors duration-200"
                  >
                    <td className="p-3 border text-[#01497c] font-medium">
                      {item.Title}
                    </td>
                    <td className="p-3 border text-[#76c6de] font-semibold">
                      {item.ItemData?.Status || "Unknown"}
                    </td>
                    <td className="p-3 border text-[#01497c]">
                      {new Date(item.CreatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 border text-[#01497c]">
                      {item.NextInLine ? "✅ Yes" : "❌ No"}
                    </td>
                    <td className="p-3 border">
                      {item.NextInLine &&
                      item.ItemData?.Status?.toLowerCase() === "available" ? (
                        <AddToCartButton
                          item={item.ItemData}
                          onSuccess={async () => {
                            await fetch("/api/fulfillhold", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                itemID: item.ItemID,
                                memberID,
                              }),
                            });
                            fetchHoldItems();
                          }}
                        />
                      ) : (
                        <div>
                          <button
                            onClick={() => handleCancelHold(item.ItemID)}
                            className="px-4 py-2 bg-[#c2a86d] text-white rounded-md hover:bg-[#b2945b] transition"
                          >
                            Cancel
                          </button>
                          {!item.NextInLine &&
                            item.ItemData?.Status?.toLowerCase() ===
                              "available" && (
                              <p className="text-sm text-gray-500 mt-2 italic">
                                Waiting for your turn
                              </p>
                            )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
