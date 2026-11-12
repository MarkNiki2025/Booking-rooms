import { Outlet } from "react-router";

import Header from "./Header";
import Sidebar from "./Sidebar";

function MainLayout() {
  return (
    <>
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default MainLayout;