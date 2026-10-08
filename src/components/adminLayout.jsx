import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      <Sidebar />
      <main className="flex-1 w-full min-w-0 overflow-x-clip px-4 pb-8 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
