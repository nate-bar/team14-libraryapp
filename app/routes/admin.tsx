import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import { Navigate } from "react-router";

export default function AdminPage() {
  const { isLoggedIn, memberID, groupID } = useOutletContext<AuthData>();
  const isAdmin = groupID === "Administrator";

  // if user is not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  // if user is logged in but not admin
  if (isLoggedIn && !isAdmin) {
    return <Navigate to="/" />;
  }
  return (
    <div>
      <h1>Welcome to Admin portal</h1>
    </div>
  );
}
