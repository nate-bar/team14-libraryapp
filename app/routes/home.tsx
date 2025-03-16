import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";

export default function HomePage() {
  const { isLoggedIn, memberID } = useOutletContext<AuthData>();
  return (
    <div>
      <h2>Welcome to home page {memberID}</h2>
    </div>
  );
}
