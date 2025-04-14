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
    return location.pathname === (path) || location.pathname.startsWith(`${path}/`);;
  };

  const adminTabs = [
    { name: "Reports", path: "/admin/reports" },
    { name: "Add Item", path: "/admin/insert" },
    { name: "Edit Item", path: "/admin/edit" },
    { name: "Create Event", path: "/admin/createevent" },
    { name: "Add Items to Event", path: "/admin/addeventitems" },
    { name: "Edit Event", path: "/admin/editevent" },
    { name: "Users", path: "/admin/usermanagement" },
  ];

  return (
    <>
      <nav className="px-6 py-2 flex justify-between items-center border-b">
        <div className="flex space-x-12">
          {adminTabs.map(({ name, path }) => (
            <Link
              key={name}
              to={path}
              className={`text-xl font-bold ${
                isLinkActive(path)
                  ? "text-blue-800 border-b-2 border-blue-600"
                  : "text-gray-800 hover:text-blue-500"
              }`}
            >
              {name}
            </Link>
          ))}
        </div>
      </nav>
      <main className="p-4">
        <Outlet context={authData} />
      </main>
    </>
  );
}