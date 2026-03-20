## AccessDenied Firebase Backend

This backend implements Firebase Cloud Functions, Firestore, and Storage for the AccessDenied training app.

- HTTPS entrypoint: `exports.api` in `backend/functions/src/index.ts`.
- Routes are mounted under:
  - `/auth` – register, login, password reset.
  - `/profile` – get/update profile and avatar upload URL.
  - `/products` – list and get products.
  - `/orders` – create and list orders (auth required).
  - `/comments` – posts and comments (auth required for posting/deleting).
  - `/admin` – admin-only user management and logs.
  - `/vuln` – intentionally vulnerable training endpoints.

### Setup

1. Install dependencies (from the project root):

```bash
cd backend/functions
npm install
```

2. Ensure Firebase CLI is installed and you are logged in.

3. Deploy:

```bash
npm run build
firebase deploy --only functions
```

The deployed URL will look like:

```text
https://<region>-accessdenied-6bc25.cloudfunctions.net/api
```

For example, the registration endpoint will be:

```text
POST https://<region>-accessdenied-6bc25.cloudfunctions.net/api/auth/register
```

