import { Link } from "react-router";

export function NavBar() {
  return (
    <div className="bg-blue-500 flex justify-left">
      <div className="navbar-left">

      </div>
      <div className="m-2.5 p-2.5">
        <ul className="flex space-x-10 space-y-3.5">
          <li className="text-lg items-center justify-center">
            <Link to="/">Home</Link>
          </li>
          <li className="text-lg items-center justify-center">
            <Link to="/about">About</Link>
          </li>
          <li className="text-lg items-center justify-center">
            <Link to="/items">Items</Link>
          </li>
          <li className="text-lg items-center justify-center">
            <Link to="/members">Members</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}