# AccessDenied

A full-stack Next.js App Router application built for security training purposes. This app demonstrates how a secure, modern web application handles authentication, database connections, and role-based access.

## How the Flow Works

1. **Frontend to Backend Separation:**
   - The application leverages **Next.js API Routes** (`/api/*`) located in `src/app/api/` as the active, real backend.
   - The frontend (React components) never connects to the database directly. It securely calls our API routes using standard HTTP requests.
   
2. **Authentication Flow:**
   - **Firebase Authentication** handles user login and session management securely via the client SDK.
   - Once a user is authenticated in Firebase, the app calls `POST /api/sync-user` to instantly mirror the user's data (like their unique UID) into our Neon PostgreSQL database.

3. **Database Integration:**
   - The primary source-of-truth is a **Neon PostgreSQL Database**.
   - Server-side API endpoints in `src/app/api/` handle all read/write operations (e.g., creating posts, deleting users, reading products) by connecting directly to the PostgreSQL instance. 
   - No sensitive database URIs (`DATABASE_URL`) are ever exposed to the client.
   
4. **Role-Based Access (Admin):**
   - Every registered user defaults to the role of `"user"` in the PostgreSQL `users` table.
   - When users try to access privileged features (like the `/admin` dashboard or deleting users), the backend API queries the Postgres database to verify if their `"role"` is strictly `"admin"`.

## Environment Setup
1. Create a `.env.local` file at the root of the project.
2. Define your Firebase config using `NEXT_PUBLIC_FIREBASE_*` variables.
3. In the same `.env.local`, set your Postgres connection string: `DATABASE_URL=...`
4. Optional: Run `npx tsx scripts/seed.ts` to automatically populate the `Products` table.

## Making the First Admin
To make an account (e.g., `pilotst@gmail.com`) an administrator manually, run:
```bash
npx tsx scripts/setup_roles.ts
```
This directly forces the role to `"admin"` inside the PostgreSQL database.

## Getting Started
Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to explore the app.
