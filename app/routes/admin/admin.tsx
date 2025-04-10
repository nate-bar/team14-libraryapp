import { Outlet, useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import { Link, useLocation } from "react-router";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import LoadingSpinner from "~/components/loadingspinner";

export default function Admin() {
  const authData = useOutletContext<AuthData>();
  const { isLoggedIn, groupID } = authData;
  const isAdmin = groupID === "Administrator";
  const location = useLocation();
  const navigate = useNavigate();

  // if user is not logged in or user is not administrator redirect
  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      navigate("/");
    }
  }, [isLoggedIn, isAdmin, navigate]);

  if (!isLoggedIn || !isAdmin) {
    return <LoadingSpinner />;
  }

  // Function to check if a link is active
  const isLinkActive = (path: string): boolean => {
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="px-6 py-2 flex justify-between items-center border-b">
        <div className="flex space-x-12">
          <Link
            to="/admin/reports"
            className={`text-xl font-bold ${
              isLinkActive("/admin/reports")
                ? "text-blue-800 border-b-2 border-blue-600"
                : "text-gray-800 hover:text-blue-500"
            }`}
          >
            Reports
          </Link>
          <Link
            to="/admin/insert"
            className={`text-xl font-bold ${
              isLinkActive("/admin/insert")
                ? "text-blue-800 border-b-2 border-blue-600"
                : "text-gray-800 hover:text-blue-500"
            }`}
          >
            Add Item
          </Link>
          <Link
            to="/admin/edit"
            className={`text-xl font-bold ${
              isLinkActive("/admin/edit")
                ? "text-blue-800 border-b-2 border-blue-600"
                : "text-gray-800 hover:text-blue-500"
            }`}
          >
            Edit
          </Link>
          <Link
            to="/admin/usermanagement"
            className={`text-xl font-bold ${
              isLinkActive("/admin/usermanagement")
                ? "text-blue-800 border-b-2 border-blue-600"
                : "text-gray-800 hover:text-blue-500"
            }`}
          >
            Users
          </Link>
        </div>
      </nav>
      <main className="p-4">
        <Outlet context={authData} />
      </main>
    </>
  );
}
