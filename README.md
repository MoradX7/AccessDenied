This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment setup (Firebase)

The app uses Firebase Authentication, Firestore, and Storage. Configuration is read from environment variables.

1. **Create `.env.local`** in the project root with your Firebase Web SDK config. Example (replace with your project values from [Firebase Console](https://console.firebase.google.com) > Project settings > Your apps):

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXX
   ```

2. **Restart the dev server** after changing `.env.local` so Next.js picks up the new values.

If these variables are missing, the client falls back to built-in defaults for the AccessDenied project so the app can run; for a different Firebase project, set `.env.local` accordingly.

## Architecture & Database Migration (Neon PostgreSQL)

This application strictly separates Authentication from Database logic for maximum security:
- **Firebase Authentication** is exclusively used for logging users in and managing sessions.
- **Neon PostgreSQL** acts as the singular source-of-truth database for all application state. 
- Client-side database connections are intentionally disabled to prevent malicious tampering. All database connections are handled strictly Server-Side via Next.js API Routes.

### Database Setup
1. Create a Neon Serverless PostgreSQL Database.
2. Provide the `DATABASE_URL` in `.env.local` alongside your `NEXT_PUBLIC_FIREBASE_*` variables.
3. Run `npm run seed` or `npx tsx scripts/seed.ts` to automatically populate the Products table and initialize the Users architecture.

## Auth Flow & Role-Based Access

- **Register/Login:** Upon successful authentication via Firebase, the client securely queries `/api/sync-user` to instantly synchronize or create the user in the PostgreSQL database.
- **Profile (`/profile`)**: Users can update their avatar and display name. All image files are strictly validated (< 5MB constraint) and uploaded to Firebase Storage, then the PostgreSQL database is populated with the resultant `avatar_url`. 
- **Admin Panel (`/admin`)**: Fully functional administrative dashboard. 
  - The client securely verifies if the currently logged-in user possesses `role: "admin"` in the Postgres database. Non-admins are blocked and redirected to the homepage.
  - Admins can dynamically query, view, and permanently delete any user directly from the PostgreSQL backend integration.

### Making the first admin

By default, the `users` SQL table assigns `role: 'user'` to every new registering member.
To make a user (e.g., `pilotst02@gmail.com`) an administrator, you must run the background script:
```bash
npx tsx scripts/setup_roles.ts
```
This forces the role to `"admin"` inside the PostgreSQL database for the requested email. When that user logs in, they will be given access to `/admin`.

### Verification emails not arriving?

1. Check your **spam/junk** folder.
2. In [Firebase Console](https://console.firebase.google.com) > **Authentication** > **Settings** > **Authorized domains**, ensure your app’s domain is listed (e.g. `localhost` for local dev, or your production domain). The link in the email redirects to this app; if the domain isn’t authorized, the flow can fail.
3. Use **Resend verification email** on the login page to send another link.

### Making the first admin

To make `pilotst@gmail.com` (or any user) an administrator:

1. Have that user register and verify their email at least once.
2. In [Firebase Console](https://console.firebase.google.com) > Firestore Database, open the `users` collection.
3. Find the document whose ID is the user’s UID (you can identify it by the `email` field).
4. Edit the document and set the field `role` to `"admin"` (type string).

After that, when that user logs in, they will be redirected to `/admin` instead of `/profile`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Manual Deployment
1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "Add New Project" and import your repository
4. Vercel will automatically detect it's a Next.js project and configure the build settings
5. Make sure the following settings are configured:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Development Command: `npm run dev`
6. Click "Deploy"

### CLI Deployment
1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts to link to your Git repository or deploy directly

Your application will be deployed and accessible via a unique URL. For subsequent updates, simply push to your Git repository and Vercel will automatically deploy the changes.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
