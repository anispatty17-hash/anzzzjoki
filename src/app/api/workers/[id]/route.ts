import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const body = await request.json() as { password?: string; isActive?: boolean };
    const updateData: { password?: string; isActive?: boolean } = {};

    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 12);
    }
    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    const worker = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, username: true, role: true, isActive: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: worker });
  } catch {
    return NextResponse.json({ success: false, error: "Gagal mengupdate worker" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "Worker dihapus" });
  } catch {
    return NextResponse.json({ success: false, error: "Gagal menghapus worker" }, { status: 500 });
  }
}
