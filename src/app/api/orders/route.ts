import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    const userId = request.headers.get("x-user-id");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (role === "WORKER") {
      where.OR = [{ workerId: userId }, { workerId: null, status: "PENDING" }];
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { game: { contains: search, mode: "insensitive" } },
        { orderType: { contains: search, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { worker: { select: { id: true, username: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data order" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { game, orderType, customerName, harga, ownerCut, workerIncome, note, workerId } = body as {
      game: string;
      orderType: string;
      customerName: string;
      harga: number;
      ownerCut: number;
      workerIncome: number;
      note?: string;
      workerId?: string;
    };

    const order = await prisma.order.create({
      data: {
        game,
        orderType,
        customerName,
        harga: Number(harga),
        ownerCut: Number(ownerCut),
        workerIncome: Number(workerIncome),
        note,
        workerId: workerId || null,
      },
      include: { worker: { select: { id: true, username: true } } },
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat order" }, { status: 500 });
  }
}
