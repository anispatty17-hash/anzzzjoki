import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const [totalOrders, activeOrders, completedOrders, cancelOrders, totalWorkers, activeWorkers, revenueData, last30Days] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "PROSES" } }),
        prisma.order.count({ where: { status: "SELESAI" } }),
        prisma.order.count({ where: { status: "CANCEL" } }),
        prisma.user.count({ where: { role: "WORKER" } }),
        prisma.user.count({ where: { role: "WORKER", isActive: true } }),
        prisma.order.aggregate({
          where: { status: "SELESAI" },
          _sum: { harga: true, ownerCut: true, workerIncome: true },
        }),
        prisma.order.findMany({
          where: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
          select: { createdAt: true, harga: true, status: true },
          orderBy: { createdAt: "asc" },
        }),
      ]);

    const dailyData: Record<string, { date: string; revenue: number; orders: number }> = {};
    for (const order of last30Days) {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!dailyData[date]) dailyData[date] = { date, revenue: 0, orders: 0 };
      dailyData[date].orders++;
      if (order.status === "SELESAI") dailyData[date].revenue += order.harga;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        activeOrders,
        completedOrders,
        cancelOrders,
        totalWorkers,
        activeWorkers,
        totalRevenue: revenueData._sum.harga ?? 0,
        totalOwnerCut: revenueData._sum.ownerCut ?? 0,
        totalWorkerIncome: revenueData._sum.workerIncome ?? 0,
        chartData: Object.values(dailyData),
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil statistik" }, { status: 500 });
  }
}
