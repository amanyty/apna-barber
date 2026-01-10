# 🪒 Apna Barber - Barber Shop Appointment Booking Platform

A professional two-sided marketplace where customers book barber appointments and shops manage their business efficiently.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)

## ✨ Features

### For Customers
- 🔍 Search barber shops by city
- 📅 Real-time appointment booking
- ✅ Offline payment confirmation
- 📊 Appointment history & management
- ⭐ Rate and review shops

### For Barber Shop Owners
- 🏪 Shop profile management
- 💇 Service catalog (add/edit/delete services)
- 📋 Appointment dashboard with status updates
- 💰 Revenue analytics
- ✅ Payment confirmation system

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TypeScript |
| Styling | Tailwind CSS, Custom Components |
| Backend | Next.js API Routes |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Hosting | Vercel (Free tier) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free)

### 1. Clone & Install

```bash
cd apna-barber
npm install
```

### 2. Setup Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run the SQL from `sql/schema.sql`
4. Go to **Settings > API** and copy your credentials

### 3. Configure Environment

```bash
cp env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
apna-barber/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Homepage
│   │   ├── login/           # Customer login
│   │   ├── register/        # Customer registration
│   │   ├── search/          # Shop search
│   │   ├── shop/[id]/       # Shop details & booking
│   │   ├── dashboard/       # Customer dashboard
│   │   └── barber/          # Barber pages
│   │       ├── register/    # Shop registration
│   │       └── dashboard/   # Barber dashboard
│   ├── components/          # React components
│   │   ├── ui/              # UI components (Button, Card, etc.)
│   │   └── AuthProvider.tsx # Auth context
│   ├── lib/                 # Utilities
│   │   ├── supabase.ts      # Database client & queries
│   │   └── utils.ts         # Helper functions
│   └── types/               # TypeScript definitions
├── sql/
│   └── schema.sql           # Database schema
└── env.example              # Environment template
```

## 🔒 Payment System

This platform uses **offline payment confirmation**:

1. Customer books appointment (payment pending)
2. Customer pays at shop (cash/UPI/card)
3. Both customer AND shop must confirm payment
4. Payment marked as complete when both confirm

## 🌐 Deployment to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy!

## 📄 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/shops` | Get all shops |
| `/api/shops/[id]` | Get shop details |
| `/api/appointments` | Manage appointments |
| `/api/reviews` | Submit/get reviews |

## 🔧 Configuration

### Supabase Auth Settings

In Supabase Dashboard > Authentication > Settings:
- Site URL: `http://localhost:3000` (dev) or your production URL
- Redirect URLs: Add your domain

## 📱 Screenshots

| Homepage | Shop Search | Booking |
|----------|-------------|---------|
| Premium landing | City filter | Service selection |

| Customer Dashboard | Barber Dashboard |
|--------------------|------------------|
| Appointments list | Analytics & management |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🙋 Support

For issues or questions, open a GitHub issue.

---

Built with ❤️ using Next.js and Supabase
