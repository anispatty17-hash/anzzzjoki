# AnzzzJoki

Platform manajemen joki game profesional.

## Stack

- **Framework**: Next.js 14 App Router
- **Database**: Neon PostgreSQL
- **ORM**: Prisma ORM
- **Auth**: JWT + Cookie httpOnly
- **Styling**: Tailwind CSS
- **Bahasa**: TypeScript (strict)
- **Deploy**: Vercel

## Setup

### 1. Clone & Install

```bash
git clone <repo>
cd anzzzjoki
npm install
```

### 2. Environment Variables

Buat file `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Data (akun awal)

```bash
npx tsx prisma/seed.ts
```

Atau manual create admin lewat Prisma Studio:
```bash
npx prisma studio
```

### 5. Jalankan Development

```bash
npm run dev
```

Buka `http://localhost:3000`

## Akun Default (setelah seed)

| Role   | Username   | Password        |
|--------|------------|-----------------|
| ADMIN  | anzzzjoki  | shiinamahiru17  |
| WORKER | worker01   | worker123       |

**Ganti password setelah login pertama!**

## Deploy ke Vercel

1. Push ke GitHub
2. Import repo di Vercel
3. Set environment variables:
   - `DATABASE_URL` → Neon PostgreSQL connection string
   - `JWT_SECRET` → string panjang yang aman
4. Deploy

Vercel akan otomatis menjalankan `prisma generate && next build`.

## Struktur Project

```
src/
├── app/
│   ├── (auth)/login/    # Login page
│   ├── admin/           # Admin dashboard
│   │   ├── dashboard/   # Overview & stats
│   │   ├── orders/      # CRUD orders
│   │   ├── workers/     # Manage workers
│   │   └── statistics/  # Charts & analytics
│   ├── worker/          # Worker dashboard
│   │   ├── dashboard/   # Overview worker
│   │   └── orders/      # Worker order management
│   └── api/             # API routes
│       ├── auth/        # Login, logout
│       ├── orders/      # Order CRUD
│       ├── workers/     # Worker CRUD
│       ├── admin/       # Admin stats, export
│       └── public/      # Public stats
├── components/
│   ├── ui/              # Reusable UI components
│   └── shared/          # Sidebar, layout
├── lib/                 # Prisma, JWT, Auth utils
├── types/               # TypeScript types
└── middleware.ts        # JWT middleware (Edge Runtime)
```

## Fitur

### Admin
- Dashboard dengan statistik lengkap
- Manajemen order (CRUD + filter + search + pagination)
- Manajemen worker (tambah, aktif/nonaktif, hapus)
- Statistik & chart pendapatan
- Export Excel (xlsx)

### Worker
- Dashboard dengan statistik personal
- Lihat dan ambil order PENDING
- Update status order (Proses → Selesai/Cancel)
- Pantau penghasilan

### Public
- Halaman publik dengan statistik platform
- Riwayat order terbaru
- Real-time dari database

## Auth Flow

1. Login → POST `/api/auth/login`
2. Server generate JWT → set cookie `anzzzjoki_token` (httpOnly)
3. Middleware baca cookie/Authorization header
4. Verifikasi JWT (Edge Runtime kompatibel dengan `jose`)
5. Redirect berdasarkan role (ADMIN → /admin, WORKER → /worker)
6. Logout → DELETE cookie

## Cookie

- **Nama**: `anzzzjoki_token`
- **httpOnly**: ya
- **secure**: ya (production)
- **maxAge**: 7 hari
- **sameSite**: lax
