import { Link } from "react-router";

export function NavBar() {
  return (
    <div className="bg-blue-500 flex">
      <div className="navbar-left">
        {/* Left side content */}
      </div>
      <div className="m-2.5 p-2.5">
        <ul className="flex space-x-10">
          <li className="text-lg flex items-center justify-center">
            <Link to="/">Home</Link>
          </li>
          <li className="text-lg flex items-center justify-center">
            <Link to="/about">About</Link>
          </li>
          <li className="text-lg flex items-center justify-center">
            <Link to="/items">Items</Link>
          </li>
          <li className="text-lg flex items-center justify-center">
            <Link to="/members">Members</Link>
          </li >
          <li  className="text-lg flex items-center justify-center">
          <Link to="/search">Search</Link>
             </li>
        </ul>
      </div>
    </div>
  );
}