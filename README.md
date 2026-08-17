# 🚀 Vortix Tech — AI-Powered Digital Solutions

> Production website for **Vortix Tech**, a full-service AI-first development agency.

**Live:** [vortixtech.com](https://vortixtech.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Frontend** | React 19, Framer Motion, Lucide Icons |
| **Styling** | Tailwind CSS 4 |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js v5 |
| **AI** | Google Gemini API (chat widget + blog generation) |
| **Email** | Nodemailer (contact form) |
| **Deployment** | Vercel |

## Features

- **Landing Page** — Hero with rotating text, services preview, tech stack, testimonials, CTA
- **Services Page** — 8 services with category filtering
- **Portfolio** — Dynamic projects from database with category filter & hover previews
- **About Page** — Team profiles, company values, timeline, mission/vision
- **Blog** — AI-powered CMS with Gemini for topic suggestion, article generation, and image creation
- **Contact Modal** — Slide-in drawer with email delivery via Nodemailer
- **AI Chat Widget** — Gemini-powered customer support bot
- **Admin Panel** — Blog CMS, portfolio management, feedback dashboard, auth-protected
- **Auto Blog Cron** — Daily auto-generated blog post at 5 AM
- **Cookie Consent** — GDPR-compliant with granular preferences
- **Analytics** — Microsoft Clarity integration (heatmaps + session recordings)
- **SEO** — OpenGraph, Twitter Cards, meta tags, sitemap.xml, robots.txt

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Gemini API key
- Gmail App Password (for contact form)

### Environment Setup

Copy `.env` and fill in real values:

```env
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=techvortix@gmail.com
EMAIL_PASS=your_gmail_app_password
DATABASE_URL="postgresql://user:pass@host:5432/vortix_tech"
NEXTAUTH_SECRET=your-secure-random-secret
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=techvortix@gmail.com
ADMIN_PASSWORD=your_secure_password
```

### Install & Run

```bash
# Install dependencies
npm install

# Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Admin Panel

Navigate to `/admin/login` and sign in with your admin credentials to:
- Create/edit/delete blog posts (or use AI to generate them)
- Manage portfolio projects
- View and respond to feedback submissions

## Project Structure

```
src/
├── app/
│   ├── about/           # About page
│   ├── admin/           # Admin panel (blog, portfolio, feedback)
│   ├── api/             # API routes (chat, contact, cron, admin CRUD)
│   ├── blog/            # Blog listing & article pages
│   ├── contact/         # Contact page
│   ├── portfolio/       # Portfolio page
│   ├── privacy-policy/  # Privacy policy
│   ├── services/        # Services page
│   ├── terms-of-service/# Terms of service
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   ├── sitemap.ts       # Dynamic sitemap
│   └── robots.ts        # Robots.txt
├── components/
│   ├── chat/            # AI chat widget
│   ├── effects/         # Visual effects
│   ├── home/            # Home page sections
│   └── layout/          # Navbar, Footer, Contact Modal, Cookie Consent
├── hooks/               # Custom React hooks
├── lib/                 # Prisma client, utilities
└── types/               # TypeScript types
```

## Deployment

Deploy to Vercel:

```bash
npm run build
```

Set all environment variables in Vercel dashboard. The PostgreSQL database should be accessible from Vercel's network.

---

Built with ❤️ by the Vortix Tech team.
