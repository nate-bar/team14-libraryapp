//note to self - FIGURE OUT WHAT THE FUCK IS WRONG W CREATING A FOLDER UGH

import "./dashboard.css";
import { type AuthData } from "~/services/api"; // import these for authdata
import { useOutletContext } from "react-router"; // import these for auth data passed from outlet context

export default function Dashboard() {
  // so two ways to do it
  const authData = useOutletContext<AuthData>(); // [1]
  // const { firstName, lastName } = useOutletContext<AuthData>(); [2]

  return (
    <div>
      <h2>Welcome to your profile {authData.firstName}</h2>
    </div>
  );
}
