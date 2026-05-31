import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const workerPassword = await bcrypt.hash("worker123", 12);

  const admin = await prisma.user.upsert({
    where: { username: "anzzzjoki" },
    update: {},
    create: { username: "anzzzjoki", password: adminPassword, role: "ADMIN", isActive: true },
  });
  console.log("Admin created:", admin.username);

  const worker1 = await prisma.user.upsert({
    where: { username: "worker01" },
    update: {},
    create: { username: "worker01", password: workerPassword, role: "WORKER", isActive: true },
  });
  console.log("Worker created:", worker1.username);

  const worker2 = await prisma.user.upsert({
    where: { username: "worker02" },
    update: {},
    create: { username: "worker02", password: workerPassword, role: "WORKER", isActive: true },
  });
  console.log("Worker created:", worker2.username);

  const sampleOrders = [
    { game: "Mobile Legends", orderType: "Push Rank Mythic", customerName: "Budi Santoso", harga: 150000, ownerCut: 50000, workerIncome: 100000, status: "SELESAI" as const, workerId: worker1.id, finishDate: new Date() },
    { game: "PUBG Mobile", orderType: "Push Rank Conqueror", customerName: "Siti Rahayu", harga: 200000, ownerCut: 60000, workerIncome: 140000, status: "PROSES" as const, workerId: worker2.id, startDate: new Date() },
    { game: "Free Fire", orderType: "Booster Rank", customerName: "Andi Wijaya", harga: 80000, ownerCut: 25000, workerIncome: 55000, status: "PENDING" as const },
    { game: "Genshin Impact", orderType: "Resin Farm", customerName: "Dewi Kusuma", harga: 120000, ownerCut: 40000, workerIncome: 80000, status: "SELESAI" as const, workerId: worker1.id, finishDate: new Date() },
    { game: "Mobile Legends", orderType: "Push Rank Epic", customerName: "Rudi Hartono", harga: 75000, ownerCut: 25000, workerIncome: 50000, status: "PENDING" as const },
  ];

  for (const order of sampleOrders) {
    await prisma.order.create({ data: order });
  }
  console.log("Sample orders created:", sampleOrders.length);
  console.log("Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
