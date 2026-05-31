"use client";

import { useEffect, useState } from "react";
import { PageLoader } from "@/components/ui/LoadingSpinner";

interface StatsData {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelOrders: number;
  totalWorkers: number;
  activeWorkers: number;
  totalRevenue: number;
  totalOwnerCut: number;
  totalWorkerIncome: number;
  chartData: { date: string; revenue: number; orders: number }[];
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/admin/stats");
      const data = await res.json() as { success: boolean; data: StatsData };
      if (data.success) setStats(data.data);
      setLoading(false);
    };
    void fetchStats();
  }, []);

  if (loading) return <PageLoader />;
  if (!stats) return <div className="text-[#94A3B8]">Gagal memuat statistik</div>;

  const maxRevenue = Math.max(...stats.chartData.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...stats.chartData.map((d) => d.orders), 1);
  const last14 = stats.chartData.slice(-14);

  const successRate = stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Statistik</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Analisis performa 30 hari terakhir</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Pendapatan", value: formatCurrency(stats.totalRevenue), sub: "dari order selesai", color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Bagian Owner", value: formatCurrency(stats.totalOwnerCut), sub: "total keuntungan owner", color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Bagian Worker", value: formatCurrency(stats.totalWorkerIncome), sub: "total penghasilan worker", color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Tingkat Sukses", value: `${successRate}%`, sub: `${stats.completedOrders} dari ${stats.totalOrders} order`, color: "text-yellow-400", bg: "bg-yellow-500/10" },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
              <div className={`w-2 h-2 rounded-full ${s.color.replace("text-", "bg-")}`} />
            </div>
            <p className="text-2xl font-bold text-[#F8FAFC] mb-1">{s.value}</p>
            <p className="text-[#94A3B8] text-xs">{s.label}</p>
            <p className="text-[#94A3B8]/60 text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-[#F8FAFC] mb-6">Pendapatan 14 Hari Terakhir</h3>
          {last14.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[#94A3B8] text-sm">Belum ada data</div>
          ) : (
            <div className="flex items-end gap-1.5 h-48">
              {last14.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute bottom-full mb-2 bg-[#0F172A] border border-white/10 rounded-lg px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {d.date}<br />{formatCurrency(d.revenue)}
                  </div>
                  <div
                    className="w-full bg-[#2563EB]/80 hover:bg-[#2563EB] rounded-t-md transition-all cursor-default"
                    style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 4 : 0)}%` }}
                  />
                  <span className="text-[10px] text-[#94A3B8] -rotate-45 origin-top-left translate-y-1 truncate" style={{ fontSize: "9px" }}>
                    {d.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-[#F8FAFC] mb-6">Order 14 Hari Terakhir</h3>
          {last14.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[#94A3B8] text-sm">Belum ada data</div>
          ) : (
            <div className="flex items-end gap-1.5 h-48">
              {last14.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute bottom-full mb-2 bg-[#0F172A] border border-white/10 rounded-lg px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {d.date}<br />{d.orders} order
                  </div>
                  <div
                    className="w-full bg-purple-500/70 hover:bg-purple-500 rounded-t-md transition-all cursor-default"
                    style={{ height: `${Math.max((d.orders / maxOrders) * 100, d.orders > 0 ? 4 : 0)}%` }}
                  />
                  <span className="text-[10px] text-[#94A3B8] -rotate-45 origin-top-left translate-y-1 truncate" style={{ fontSize: "9px" }}>
                    {d.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total Order", value: stats.totalOrders },
          { label: "Order Aktif", value: stats.activeOrders },
          { label: "Order Selesai", value: stats.completedOrders },
          { label: "Order Cancel", value: stats.cancelOrders },
          { label: "Total Worker", value: stats.totalWorkers },
          { label: "Worker Aktif", value: stats.activeWorkers },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-[#94A3B8] text-sm mb-2">{s.label}</p>
            <p className="text-3xl font-bold text-[#F8FAFC]">{s.value.toLocaleString("id-ID")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
