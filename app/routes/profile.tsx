import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";

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
  return (
    <div>
      <h2>Welcome to profile page #{memberID}</h2>
      <h2>{groupID}</h2>
      <h2>First Name: {firstName}</h2>
      <h2>Middle Name: {middleName}</h2>
      <h2>Last Name: {lastName}</h2>
      <h2>Address: {address}</h2>
      <h1>Add more fields for birthday, balance, etc.</h1>
    </div>
  );
}
