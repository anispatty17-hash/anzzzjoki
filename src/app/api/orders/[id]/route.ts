import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { worker: { select: { id: true, username: true } } },
    });
    if (!order) return NextResponse.json({ success: false, error: "Order tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true, data: order });
  } catch {
    return NextResponse.json({ success: false, error: "Gagal mengambil order" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const role = request.headers.get("x-user-role");
    const userId = request.headers.get("x-user-id");
    const body = await request.json() as Record<string, unknown>;

    const existing = await prisma.order.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ success: false, error: "Order tidak ditemukan" }, { status: 404 });

    if (role === "WORKER") {
      const allowedFields = ["status", "workerId", "startDate", "finishDate", "note"];
      const updateData: Record<string, unknown> = {};

      for (const field of allowedFields) {
        if (field in body) updateData[field] = body[field];
      }

      if (updateData.status === "PROSES" && !existing.workerId) {
        updateData.workerId = userId;
        updateData.startDate = new Date();
      }
      if (updateData.status === "SELESAI") {
        updateData.finishDate = new Date();
      }

      const order = await prisma.order.update({
        where: { id: params.id },
        data: updateData,
        include: { worker: { select: { id: true, username: true } } },
      });
      return NextResponse.json({ success: true, data: order });
    }

    if (role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    const fields = ["game","orderType","customerName","harga","ownerCut","workerIncome","status","note","workerId","startDate","finishDate"];
    for (const field of fields) {
      if (field in body) updateData[field] = body[field];
    }
    if ("harga" in updateData) updateData.harga = Number(updateData.harga);
    if ("ownerCut" in updateData) updateData.ownerCut = Number(updateData.ownerCut);
    if ("workerIncome" in updateData) updateData.workerIncome = Number(updateData.workerIncome);

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: { worker: { select: { id: true, username: true } } },
    });
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Order PATCH error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengupdate order" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    await prisma.order.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "Order dihapus" });
  } catch {
    return NextResponse.json({ success: false, error: "Gagal menghapus order" }, { status: 500 });
  }
}
