// src/routes/layout.tsx
import { Outlet, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { NavBar } from "~/components/navbar";
import { NavBar2 } from "~/components/Navbar2";
import { getAuthData } from "~/utils/auth";
import { type AuthData } from "~/services/api";
import { Footer } from "~/components/footer";
import { CartProvider } from "~/context/CartContext";

export function loader({ context }: LoaderFunctionArgs): AuthData {
  //debug
  console.log("Context in loader:", context);
  // Use the centralized auth utility
  return getAuthData(context);
}

export default function Layout() {
  const authData = useLoaderData() as AuthData;

  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <NavBar
          isLoggedIn={authData.isLoggedIn}
          memberID={authData.memberID}
          groupID={authData.groupID}
          firstName={authData.firstName}
          lastName={authData.lastName}
          email={authData.email}
        />
        <NavBar2 />
        <main className="flex-grow">
          <Outlet context={authData} />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
