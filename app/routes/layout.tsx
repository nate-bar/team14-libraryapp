import { Outlet } from 'react-router';
import { NavBar } from '~/components/navbar'; // Adjust the import path as needed

// Layout for having the Navigation Bar rendered on every page
// Outlet is where all the child routes in routes.ts render


export default function Layout() {
  return (
    <div>
      <NavBar />
      <main>
        <Outlet /> 
      </main>
    </div>
  );
}