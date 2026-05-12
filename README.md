# Event Registration

Next.js app for event registration with user submissions, supporting documents, reference-code lookup, admin review, and name tag PDF download.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Registrations are stored in PostgreSQL using the `PG_*` values from `.env.local` or `.env`. Uploaded files are stored in `uploads/`.

The app creates the `registrations` table automatically on first database access.
