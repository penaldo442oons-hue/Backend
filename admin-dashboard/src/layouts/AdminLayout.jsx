import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-dvh w-full">
      <Sidebar />
      <main className="min-h-dvh min-w-0 flex-1 overflow-x-auto pl-[240px] lg:pl-[260px]">
        <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
