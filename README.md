# SARSYC VI Conference Platform

Modern, high-performance conference website built with Next.js 14, Payload CMS, TypeScript, and Tailwind CSS.

## 🚀 Features

- ⚡ **Lightning Fast** - Next.js 14 with App Router and Server Components
- 🎨 **Modern UI** - Tailwind CSS with custom SARSYC branding
- 📝 **Easy Content Management** - Payload CMS with intuitive admin interface
- 🔐 **Secure** - Built-in authentication and authorization
- 📱 **Mobile-First** - Fully responsive design
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 🌍 **Multilingual** - Support for English, French, Portuguese
- 🎯 **SEO Optimized** - Server-side rendering and meta tags
- 📊 **Analytics Ready** - Google Analytics 4 integration
- 🔄 **Real-time** - Live updates for registrations and abstracts

## 📦 Tech Stack

- **Framework:** Next.js 14 (React 18)
- **CMS:** Payload CMS 2.x
- **Database:** MongoDB
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion
- **Icons:** React Icons
- **Email:** Nodemailer

## 🛠️ Prerequisites

Before you begin, ensure you have:

- Node.js 18.17.0 or higher
- MongoDB (local or Atlas cloud)
- npm or yarn package manager

## 📥 Installation

### 1. Clone the repository

```bash
cd sarsyc-platform
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/sarsyc

# Payload CMS Secret (generate a random string)
PAYLOAD_SECRET=your-super-secret-key-change-this

# Server URL
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@sarsyc.org
```

### 4. Generate Payload types

```bash
npm run generate:types
```

### 5. Start development server

```bash
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin

## 🗂️ Project Structure

```
sarsyc-platform/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (frontend)/         # Public-facing pages
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── about/          # About pages
│   │   │   ├── sarsyc-vi/      # Conference hub
│   │   │   ├── programme/      # Programme & speakers
│   │   │   ├── participate/    # Registration & abstracts
│   │   │   ├── news/           # News & media
│   │   │   ├── resources/      # Resource library
│   │   │   ├── partnerships/   # Partnerships
│   │   │   └── contact/        # Contact page
│   │   ├── api/                # API routes
│   │   └── admin/              # Admin panel (Payload)
│   ├── components/             # React components
│   │   ├── layout/             # Layout components
│   │   ├── ui/                 # UI components
│   │   ├── forms/              # Form components
│   │   └── sections/           # Page sections
│   ├── payload/                # Payload CMS configuration
│   │   ├── collections/        # Database collections
│   │   ├── globals/            # Global settings
│   │   ├── blocks/             # Reusable blocks
│   │   └── payload.config.ts   # Main config
│   ├── lib/                    # Utility functions
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🎨 Key Features

### For Visitors

- **Homepage** with countdown timer to conference
- **Conference Information** with detailed programme
- **Registration System** with multi-step form
- **Abstract Submission** with file upload
- **Resource Library** with advanced search
- **News & Updates** with categories
- **Speaker Profiles** with photos and bios
- **Partnership Information** with sponsorship packages

### For Administrators (SAYWHAT Team)

- **Intuitive Admin Dashboard** at `/admin`
- **Content Management** for all pages
- **User Management** with role-based access
- **Registration Management** with export to CSV
- **Abstract Review System** with status tracking
- **Email Templates** for automated communications
- **Analytics Dashboard** with key metrics
- **Media Library** for images and documents

## 🚀 Deployment

### Option 1: Vercel (Recommended for Frontend)

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Option 2: DigitalOcean/AWS

1. Set up Node.js server
2. Install dependencies
3. Build: `npm run build`
4. Start: `npm start`

### Option 3: Docker

```bash
docker build -t sarsyc-platform .
docker run -p 3000:3000 sarsyc-platform
```

## 📝 Default Admin Credentials

After first run, create an admin user at `/admin`

**Default settings:**
- Email: admin@sarsyc.org
- Password: (set during first setup)

**⚠️ IMPORTANT:** Change these immediately in production!

## 🔧 Configuration

### Database Collections

The platform includes these main collections:

- **Users** - Admin users and authenticated users
- **Registrations** - Conference registrations
- **Abstracts** - Abstract submissions
- **Speakers** - Speaker profiles
- **Sessions** - Conference sessions
- **Resources** - Downloadable resources
- **News** - News articles and announcements
- **Partners** - Sponsors and partners
- **FAQs** - Frequently asked questions

### Email Templates

Automated emails are sent for:
- Registration confirmation
- Abstract submission confirmation
- Abstract acceptance/rejection
- Conference reminders
- Newsletter subscriptions

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type checking
npm run type-check
```

## 📊 Performance

Target metrics:
- **PageSpeed Score:** >90 (desktop), >80 (mobile)
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **Largest Contentful Paint:** <2.5s

## 🔒 Security Features

- HTTPS enforcement
- CSRF protection
- XSS prevention
- SQL injection protection
- Rate limiting on API routes
- Secure password hashing (bcrypt)
- JWT-based authentication
- Role-based access control

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader compatible
- High contrast ratios
- Resizable text

## 🌍 Internationalization

Languages supported:
- English (default)
- French
- Portuguese

## 📞 Support

For issues or questions:
- **Email:** support@sarsyc.org
- **Documentation:** /docs
- **GitHub Issues:** [repository]/issues

## 📄 License

Copyright © 2025 SAYWHAT. All rights reserved.

## 🙏 Acknowledgments

Built for SARSYC VI - Southern African Regional Students and Youth Conference
Windhoek, Namibia | August 5-7, 2026

---

**Let's Align for Action! 🌍🚀**



