# Event Registration

Next.js app for event registration with user submissions, supporting documents, reference-code lookup, admin review, and name tag PDF download.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Registrations and uploaded document files are stored in PostgreSQL using the `PG_*` values from `.env.local` or `.env`.

The app creates the `registrations` and `registration_documents` tables automatically on first database access.
