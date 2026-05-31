import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [totalOrders, activeOrders, completedOrders, cancelOrders, totalWorkers, activeWorkers, revenueData, recentOrders] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "PROSES" } }),
        prisma.order.count({ where: { status: "SELESAI" } }),
        prisma.order.count({ where: { status: "CANCEL" } }),
        prisma.user.count({ where: { role: "WORKER" } }),
        prisma.user.count({ where: { role: "WORKER", isActive: true } }),
        prisma.order.aggregate({ where: { status: "SELESAI" }, _sum: { harga: true } }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { worker: { select: { username: true } } },
        }),
      ]);
    return { totalOrders, activeOrders, completedOrders, cancelOrders, totalWorkers, activeWorkers, totalRevenue: revenueData._sum.harga ?? 0, recentOrders };
  } catch {
    return { totalOrders: 0, activeOrders: 0, completedOrders: 0, cancelOrders: 0, totalWorkers: 0, activeWorkers: 0, totalRevenue: 0, recentOrders: [] };
  }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

const statusBadge: Record<string, string> = {
  PENDING: "badge-pending",
  PROSES: "badge-proses",
  SELESAI: "badge-selesai",
  CANCEL: "badge-cancel",
};

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { label: "Total Order", value: stats.totalOrders.toLocaleString("id-ID"), icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Order Aktif", value: stats.activeOrders.toLocaleString("id-ID"), icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Order Selesai", value: stats.completedOrders.toLocaleString("id-ID"), icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Total Pendapatan", value: formatCurrency(stats.totalRevenue), icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Worker Aktif", value: `${stats.activeWorkers}/${stats.totalWorkers}`, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Order Cancel", value: stats.cancelOrders.toLocaleString("id-ID"), icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-red-400", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Dashboard</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Ringkasan performa AnzzzJoki</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>
              <span className="text-[#94A3B8] text-sm">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-[#F8FAFC]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="font-semibold text-[#F8FAFC]">Order Terbaru</h2>
            <Link href="/admin/orders" className="text-[#2563EB] text-sm hover:text-blue-400 transition-colors">
              Lihat semua →
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {stats.recentOrders.length === 0 ? (
              <div className="py-12 text-center text-[#94A3B8] text-sm">Belum ada order</div>
            ) : (
              stats.recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/2 transition-colors">
                  <div>
                    <p className="text-[#F8FAFC] text-sm font-medium">{o.customerName}</p>
                    <p className="text-[#94A3B8] text-xs mt-0.5">{o.game} · {o.orderType}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#F8FAFC] text-sm font-medium">{formatCurrency(o.harga)}</span>
                    <span className={statusBadge[o.status] ?? "badge-pending"}>{o.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-[#F8FAFC] mb-6">Aksi Cepat</h2>
          <div className="space-y-3">
            {[
              { href: "/admin/orders", label: "Tambah Order Baru", desc: "Buat order untuk customer", icon: "M12 4v16m8-8H4" },
              { href: "/admin/workers", label: "Tambah Worker", desc: "Daftarkan worker baru", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" },
              { href: "/admin/statistics", label: "Lihat Statistik", desc: "Analisis performa lengkap", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-[#F8FAFC] text-sm font-medium">{action.label}</p>
                  <p className="text-[#94A3B8] text-xs">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
