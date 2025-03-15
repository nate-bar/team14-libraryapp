// src/routes/layout.tsx
import { Outlet, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { NavBar } from "~/components/navbar";
import { getAuthData } from "~/utils/auth";
import { type AuthData } from "~/services/api";

export function loader({ context }: LoaderFunctionArgs): AuthData {
  // Use the centralized auth utility
  return getAuthData(context);
}

export default function Layout() {
  const authData = useLoaderData() as AuthData;

  return (
    <div>
      <NavBar
        isLoggedIn={authData.isLoggedIn}
        memberID={authData.memberID}
        groupID={authData.groupID}
      />
      <main>
        <Outlet context={authData} />
      </main>
    </div>
  );
}
