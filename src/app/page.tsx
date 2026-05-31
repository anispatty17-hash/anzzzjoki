import { prisma } from "@/lib/prisma";
import type { Order } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPublicStats() {
  try {
    const [totalOrders, completedOrders, activeWorkers, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "SELESAI" } }),
      prisma.user.count({ where: { role: "WORKER", isActive: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { worker: { select: { id: true, username: true } } },
      }),
    ]);
    return { totalOrders, completedOrders, activeWorkers, recentOrders };
  } catch {
    return { totalOrders: 0, completedOrders: 0, activeWorkers: 0, recentOrders: [] };
  }
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default async function PublicPage() {
  const { totalOrders, completedOrders, activeWorkers, recentOrders } = await getPublicStats();
  const pendingOrders = recentOrders.filter((o) => o.status === "PENDING").length;
  const successRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <header className="border-b border-white/5 bg-[#111827]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <span className="text-white font-bold text-xs">AJ</span>
            </div>
            <span className="text-white font-semibold">AnzzzJoki</span>
          </div>
          <Link href="/login" className="btn-primary text-sm py-2 px-4 rounded-xl">
            Login
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] text-xs font-medium mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
          Platform Joki Profesional
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#F8FAFC] mb-4 leading-tight">
          AnzzzJoki
        </h1>
        <p className="text-[#94A3B8] text-lg max-w-xl mx-auto">
          Layanan joki game profesional, cepat, dan terpercaya. Monitor pesanan Anda secara real-time.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Order", value: totalOrders.toLocaleString("id-ID"), icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-blue-400" },
            { label: "Order Selesai", value: completedOrders.toLocaleString("id-ID"), icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-green-400" },
            { label: "Worker Aktif", value: activeWorkers.toLocaleString("id-ID"), icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "text-purple-400" },
            { label: "Tingkat Sukses", value: `${successRate}%`, icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "text-yellow-400" },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <svg className={`w-5 h-5 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
                <span className="text-[#94A3B8] text-sm">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-[#F8FAFC]">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold text-[#F8FAFC]">Riwayat Order Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#94A3B8]">
                <svg className="w-12 h-12 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>Belum ada order</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-[#94A3B8] border-b border-white/5">
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Game</th>
                    <th className="px-6 py-3 font-medium hidden sm:table-cell">Tipe</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium hidden md:table-cell">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(recentOrders as unknown as (Order & { worker?: { id: string; username: string } | null })[]).map((order) => (
                    <tr key={order.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 text-[#F8FAFC] font-medium text-sm">{order.customerName}</td>
                      <td className="px-6 py-4 text-[#94A3B8] text-sm">{order.game}</td>
                      <td className="px-6 py-4 text-[#94A3B8] text-sm hidden sm:table-cell">{order.orderType}</td>
                      <td className="px-6 py-4"><StatusBadge status={order.status as "PENDING" | "PROSES" | "SELESAI" | "CANCEL"} /></td>
                      <td className="px-6 py-4 text-[#94A3B8] text-sm hidden md:table-cell">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-[#94A3B8] text-sm">
          <p>© {new Date().getFullYear()} AnzzzJoki. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
