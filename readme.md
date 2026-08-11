# 🛍️ Kathyayani Boutique - Full Stack E-Commerce Platform

A modern, full-stack e-commerce web application built for **Kathyayani Boutique**. Features an Express.js & TypeScript API powered by PostgreSQL & Drizzle ORM, integrated with a Next.js 16 frontend styled with TailwindCSS v4.

---

## 📁 Repository & Folder Structure

Here is a breakdown of all files and directories in the repository:

```text
kathyayani-botique/
├── client/                      # Next.js 16 Frontend application
│   ├── src/
│   │   ├── app/                 # Next.js App Router (pages & API routes)
│   │   ├── components/          # UI components
│   │   ├── lib/                 # Utilities, API client configuration
│   │   └── providers/           # React Query & Context providers
│   ├── package.json             # Frontend dependencies & scripts
│   ├── next.config.ts           # Next.js configuration
│   └── tsconfig.json            # Frontend TypeScript configuration
├── drizzle/                     # Drizzle Kit generated migrations & schema snapshots
│   ├── schema.ts                # Introspected/Generated schema definitions
│   └── relations.ts             # Introspected/Generated database relations
├── src/                         # Backend source code
│   └── db/                      # Drizzle ORM Database Schemas & Models
│       ├── schema.ts            # Central database schema export
│       ├── user.ts              # User authentication schema
│       ├── product.ts           # Product schema definition
│       ├── product-variant.ts   # Product variants (size, color, price)
│       ├── cart.ts              # User cart schema
│       ├── cart-item.ts         # Cart items schema
│       ├── order.ts             # Customer order schema
│       ├── order-item.ts        # Items within an order
│       ├── address.ts           # Delivery address schema
│       ├── wishlist.ts          # Customer wishlist schema
│       ├── verification-token.ts# Email verification & password reset tokens
│       ├── enums.ts             # Database enums (e.g. order status, roles)
│       └── relations.ts         # ORM relations between entities
├── .env                         # Environment variables (Database URL, JWT, OAuth, S3/R2)
├── .gitignore                   # Files excluded from git
├── drizzle.config.ts            # Drizzle Kit configuration file
├── errors.md                    # Log of known issues and bug fixes
├── google-auth.controller.ts    # Google OAuth 2.0 controller handler
├── main.ts                      # Express REST API Server entry point
├── package.json                 # Backend dependencies & npm scripts
├── pnpm-workspace.yaml          # Monorepo workspace configuration
├── r2Client.ts                  # Cloudflare R2 / AWS S3 Object Storage Client
├── readme.md                    # Project documentation
└── tsconfig.json                # Backend TypeScript configuration
```

---

## ⚡ Tech Stack

### **Backend (API Server)**
- **Runtime & Framework**: Node.js, Express.js (TypeScript)
- **Database & ORM**: PostgreSQL, Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Authentication**: JWT (`jsonwebtoken`), Password Hashing (`bcrypt`), Google OAuth 2.0 (`passport-google-oauth20`)
- **File & Image Storage**: Cloudflare R2 / AWS S3 (`@aws-sdk/client-s3`) with local `/uploads` disk fallback
- **Email Service**: Nodemailer (SMTP / Gmail)

### **Frontend (Web App)**
- **Framework**: Next.js 16 (App Router, React 19)
- **Styling**: TailwindCSS v4
- **State & Data Fetching**: TanStack React Query v5, Axios
- **Icons**: Lucide React

---

## 🛠️ Environment Variables Configuration (`.env`)

Create a `.env` file in the root folder with the following variables:

```env
# Database Connection
DATABASE_URL=postgresql://user:password@localhost:5432/kathyayani_db?sslmode=require

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# Server & Application URLs
PORT=3000
FRONTEND_URL=http://localhost:3001

# Cloudflare R2 / AWS S3 Object Storage (Optional for image uploads)
R2_ACCESS_KEY=your_r2_access_key
R2_SECRET_KEY=your_r2_secret_key
R2_BUCKET_NAME=kathyayani
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_PUBLIC_DOMAIN=https://your-custom-domain-or-r2-public-url

# Google OAuth 2.0 (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# SMTP Email Configuration (Optional for password reset & verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```

---

## 🚀 How to Run the Project

### **Prerequisites**
- **Node.js**: v18.x or v20+ installed
- **npm** or **pnpm** installed
- **PostgreSQL**: A running PostgreSQL instance (Local or hosted like Render, Neon, Supabase)

---

### **Step 1: Install Dependencies**

1. Install root/backend dependencies:
   ```bash
   npm install
   ```

2. Install frontend (`client/`) dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

---

### **Step 2: Database Migration & Setup**

Push the Drizzle ORM schema to your PostgreSQL database:

```bash
# Push database schema directly to PostgreSQL database
npm run db:push
```

*(Optional)* You can also view and manage database tables via Drizzle Studio GUI:
```bash
npm run db:studio
```

---

### **Step 3: Run the Backend API Server**

Start the Express backend API server in development mode:

```bash
npm run dev
```
> The API server will start on **`http://localhost:3000`**.

---

### **Step 4: Run the Frontend Application**

In a separate terminal window, start the Next.js frontend application:

```bash
cd client
npm run dev
```
> The Next.js web app will start on **`http://localhost:3001`** (or `http://localhost:3000` if port 3000 is open).

---

## 📜 Available NPM Scripts

### **Root Directory (`/`)**

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `tsx main.ts` | Runs the Express API backend server with live reload |
| `npm run start` | `tsx src/db/index.ts` | Runs database initialization script |
| `npm run typecheck` | `tsc --noEmit` | Runs TypeScript type checking for backend |
| `npm run db:push` | `drizzle-kit push` | Pushes current schema to target database |
| `npm run db:generate` | `drizzle-kit generate` | Generates SQL migration files |
| `npm run db:migrate` | `drizzle-kit migrate` | Applies generated SQL migrations to database |
| `npm run db:pull` | `drizzle-kit pull` | Introspects existing database into Drizzle schema |
| `npm run db:studio` | `drizzle-kit studio` | Starts Drizzle Studio web GUI for database management |

### **Client Directory (`/client`)**

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `next dev` | Starts Next.js development server |
| `npm run build` | `next build` | Builds optimized production bundle |
| `npm run start` | `next start` | Runs production server after build |
| `npm run lint` | `eslint` | Runs ESLint code quality checks |

---

## 🌐 API Overview

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/google`
- **Products**: `/api/products`, `/api/products/:id`
- **Cart & Wishlist**: `/api/cart`, `/api/wishlist`
- **Orders & Address**: `/api/orders`, `/api/addresses`
- **File Upload**: `POST /api/upload` (Supports R2/S3 & Local Storage)
