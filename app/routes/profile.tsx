import { useState, useEffect } from "react";
import { type Items } from "~/services/api";
import { useOutletContext } from "react-router";
import { Link, useNavigate } from "react-router"; // Using React Router
import {type AuthData } from "~/services/api";
import {Outlet} from "react-router";
import "./profile.css";

//define item type 
type Item = {
  itemID: number;
  title: string;
  dueDate: string;
}
export function navbar3() {
  const [isLoggedIn, memberID, groupID, firstName] = AuthData();
  const [items, setItems] = useState<Items[]>([]); //store fetched items
  const [overdueCount, setOverdueCount] = useState(0);
  const navigate = useNavigate(); //enables programmatic navigation

//fetch items from API
useEffect(() => {
  if (isLoggedIn && memberID) {
    fetch(`/api/items?userId=${memberID.id}`) // Fetch only the logged-in user's items
      .then((response) => response.json())
      .then((data) => {
        setItems(data);
        calculateOverdueItems(data);
      })
      .catch((error) => console.error("Error fetching items:", error));
  }
}, [isLoggedIn, memberID]);

// Count overdue items
const calculateOverdueItems = (items: Item[]) => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const overdue = items.filter((item) => item.dueDate < today).length;
  setOverdueCount(overdue);
};
}

export default function ProfilePage() {
  const {
    isLoggedIn,
    memberID,
    groupID,
    firstName,
    lastName,
    middleName,
    address,
  } = useOutletContext<AuthData>();
  const navigate = useNavigate();
  return (
    <div className="bg-nav3" > 
      <div className="navbar-left w-full flex justify-between items-center">
        <ul className="flex space-x-10">
          <li className="text-nav3">
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li className="text-nav3">
            <Link to="/myitems">My Items</Link>
          </li>
          <li className="mailbox-nav3">
             <Link to="/mailbox">✉️
             </Link>
          </li>
          <li className="settings-nav3">
            <Link to="/settings">⚙️</Link>
          </li>
        </ul>
        <Outlet />
      </div>
    </div>
  );

}
