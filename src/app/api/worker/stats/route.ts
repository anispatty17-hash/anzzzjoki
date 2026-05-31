import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const [myOrders, completed, active, income] = await Promise.all([
      prisma.order.count({ where: { workerId: userId } }),
      prisma.order.count({ where: { workerId: userId, status: "SELESAI" } }),
      prisma.order.count({ where: { workerId: userId, status: "PROSES" } }),
      prisma.order.aggregate({
        where: { workerId: userId, status: "SELESAI" },
        _sum: { workerIncome: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalOrders: myOrders,
        completedOrders: completed,
        activeOrders: active,
        totalIncome: income._sum.workerIncome ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Gagal mengambil statistik" }, { status: 500 });
  }
}
