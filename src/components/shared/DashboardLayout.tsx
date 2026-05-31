import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import type { Role } from "@/types";

interface DashboardLayoutProps {
  role: Role;
  username: string;
  children: React.ReactNode;
}

export default function DashboardLayout({ role, username, children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <div className="hidden lg:flex">
        <Sidebar role={role} username={username} />
      </div>
      <MobileSidebar role={role} username={username} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
