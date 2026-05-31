import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalOrders, completedOrders, activeWorkers, recentOrders] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "SELESAI" } }),
        prisma.user.count({ where: { role: "WORKER", isActive: true } }),
        prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { worker: { select: { id: true, username: true } } },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        activeWorkers,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Public stats error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}
