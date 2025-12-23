# PostgreSQL Setup Guide for SARSYC VI Platform

## Prerequisites
- PostgreSQL 14+ installed and running
- Node.js 18+
- npm/yarn package manager

## Database Setup

### 1. Create PostgreSQL Database and User

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE sarsyc_db;

-- Create user
CREATE USER sarsyc_user WITH PASSWORD 'katuruza';

-- Grant privileges
ALTER ROLE sarsyc_user SET client_encoding TO 'utf8';
ALTER ROLE sarsyc_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE sarsyc_user SET default_transaction_deferrable TO on;
ALTER ROLE sarsyc_user SET default_time_zone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE sarsyc_db TO sarsyc_user;

-- Exit
\q
```

### 2. Environment Configuration

Create `.env.local` file in the project root:

```
DATABASE_URL=postgresql://sarsyc_user:your_secure_password@localhost:5432/sarsyc_db
NODE_ENV=development
```

Copy from `.env.example` and update with your PostgreSQL credentials.

## Dependencies Installed

✅ **Database & ORM:**
- `pg@8.11.0` - PostgreSQL client
- `postgres@3.4.0` - PostgreSQL query builder

✅ **Web Framework:**
- `next@14.0.0` - React meta-framework
- `react@18.2.0` - UI library
- `express@4.18.0` - Backend server

✅ **Security:**
- `bcrypt@5.1.1` - Password hashing
- `dotenv@16.3.0` - Environment variables

✅ **Forms & Validation:**
- `react-hook-form@7.48.0` - Form management
- `zod@3.22.0` - Schema validation

✅ **Utilities:**
- `axios@1.6.0` - HTTP client
- `date-fns@3.0.0` - Date utilities
- `nodemailer@7.0.12` - Email service
- `sharp@0.33.0` - Image processing

✅ **UI Components:**
- `framer-motion@10.16.0` - Animations
- `react-icons@5.0.0` - Icon library
- `swiper@11.0.0` - Carousel component
- `@hookform/resolvers@3.3.0` - Form resolvers

## Verify Installation

```bash
# Check all dependencies are installed
npm list

# Check Node version
node --version

# Check PostgreSQL connection
psql -U sarsyc_user -d sarsyc_db -h localhost
```

## Start Development Server

```bash
# Install all dependencies (already done)
npm install

# Run development server
npm run dev

# The app will be available at http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run generate:types` - Generate TypeScript types

## Next Steps

1. Configure PostgreSQL database
2. Update `.env.local` with your database credentials
3. Create database schema/migrations
4. Run `npm run dev` to start the application
5. Access the admin panel at `/admin`

## Troubleshooting

**PostgreSQL Connection Error:**
- Verify PostgreSQL service is running: `sudo service postgresql status`
- Check DATABASE_URL is correct in `.env.local`
- Verify user permissions with: `psql -U sarsyc_user -d sarsyc_db`

**Port 3000 Already in Use:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (Windows, replace PID)
taskkill /PID <PID> /F
```

**Missing Dependencies:**
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```
