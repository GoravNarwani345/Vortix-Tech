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
| **Auth** | Signed HMAC session cookie (admin) |
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
DATABASE_URL="postgresql://user:pass@host:5432/vortix_tech"
GEMINI_API_KEY=your_gemini_api_key
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
EMAIL_USER=info@thevortixtech.com
EMAIL_PASS=your_hostinger_email_password
EMAIL_FROM=info@thevortixtech.com
CONTACT_EMAIL=info@thevortixtech.com
ADMIN_EMAIL=info@thevortixtech.com
ADMIN_PASSWORD=your_secure_password
ADMIN_SESSION_SECRET=your-long-random-session-secret
CRON_SECRET=your_cron_secret
```

See `.env.example` for the full list. `ADMIN_SESSION_SECRET` signs the admin
session cookie; `CRON_SECRET` protects `/api/cron/daily-blog`.

### Install & Run

```bash
# Install dependencies (runs prisma generate via postinstall)
bun install

# Push schema & seed starter content
bunx prisma db push
bunx prisma db seed

# Start development server
bun run dev
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

Build for production:

```bash
bun run build
bun run start
```

Set all environment variables (see `.env.example`). The PostgreSQL database
must be reachable at runtime; pages degrade gracefully with empty content if it
is unavailable. Schedule `/api/cron/daily-blog?key=$CRON_SECRET` daily to
auto-publish a blog post.

---

Built with ❤️ by the Vortix Tech team.
