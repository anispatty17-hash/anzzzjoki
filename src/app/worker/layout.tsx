import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashboardLayout from "@/components/shared/DashboardLayout";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/admin/dashboard");

  return (
    <DashboardLayout role={user.role} username={user.username}>
      {children}
    </DashboardLayout>
  );
}
