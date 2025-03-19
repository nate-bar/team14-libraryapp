import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";

export default function ProfilePage() {
  const { isLoggedIn, memberID } = useOutletContext<AuthData>();
  return (
    <div>
      <h2>Welcome to profile page {memberID}</h2>
    </div>
  );
}
