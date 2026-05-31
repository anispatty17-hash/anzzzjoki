import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}
function formatDate(d: Date | string | null | undefined) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default async function WorkerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [myOrders, completed, active, income, recentOrders, availableOrders] = await Promise.all([
    prisma.order.count({ where: { workerId: user.userId } }),
    prisma.order.count({ where: { workerId: user.userId, status: "SELESAI" } }),
    prisma.order.count({ where: { workerId: user.userId, status: "PROSES" } }),
    prisma.order.aggregate({ where: { workerId: user.userId, status: "SELESAI" }, _sum: { workerIncome: true } }),
    prisma.order.findMany({
      where: { workerId: user.userId },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where: { status: "PENDING", workerId: null } }),
  ]);

  const stats = [
    { label: "Order Saya", value: myOrders.toLocaleString("id-ID"), icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Sedang Proses", value: active.toLocaleString("id-ID"), icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Selesai", value: completed.toLocaleString("id-ID"), icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Total Penghasilan", value: formatCurrency(income._sum.workerIncome ?? 0), icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Halo, {user.username}</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Selamat datang di dashboard worker Anda</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
              <svg className={`w-5 h-5 ${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[#F8FAFC]">{s.value}</p>
            <p className="text-[#94A3B8] text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {availableOrders > 0 && (
        <div className="card p-5 border-l-4 border-l-[#2563EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#F8FAFC] font-medium">
                Ada <span className="text-[#2563EB] font-bold">{availableOrders}</span> order tersedia
              </p>
              <p className="text-[#94A3B8] text-sm">Order yang belum diambil worker</p>
            </div>
            <Link href="/worker/orders" className="btn-primary text-sm">Ambil Order</Link>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="font-semibold text-[#F8FAFC]">Order Terbaru Saya</h2>
          <Link href="/worker/orders" className="text-[#2563EB] text-sm hover:text-blue-400 transition-colors">
            Lihat semua →
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-[#94A3B8] text-sm">
              <p>Belum ada order yang diambil</p>
              <Link href="/worker/orders" className="text-[#2563EB] hover:text-blue-400 transition-colors mt-2 inline-block">
                Cari order tersedia →
              </Link>
            </div>
          ) : recentOrders.map((o) => (
            <div key={o.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/2 transition-colors">
              <div>
                <p className="text-[#F8FAFC] text-sm font-medium">{o.customerName}</p>
                <p className="text-[#94A3B8] text-xs mt-0.5">{o.game} · {o.orderType}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#F8FAFC] text-sm font-medium hidden sm:block">{formatCurrency(o.workerIncome)}</span>
                <StatusBadge status={o.status} />
                <span className="text-[#94A3B8] text-xs hidden md:block">{formatDate(o.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
