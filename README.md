# AutoEdge Motors

A full-stack used car dealership website MVP: a public-facing inventory site plus a
password-protected admin dashboard for managing listings and inquiries.

> **"AutoEdge Motors" is a placeholder brand.** Every visible piece of branding (name,
> tagline, phone number, email, address, social links) lives in one file:
> [`client/src/config.js`](client/src/config.js). Edit that file to rebrand the whole
> site — nothing else needs to change.

## Tech Stack

- **Frontend:** React 18 + Vite, React Router, Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`), file-based, zero setup
- **Admin auth:** A single hardcoded password (env var) issuing a short-lived JWT — intentionally simple for an MVP, not meant for multi-user production use

## Project Structure

```
/client   React + Vite + Tailwind frontend (public site + admin dashboard)
/server   Express API + SQLite database
```

## Prerequisites

- Node.js 18+ and npm

## Setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env   # edit ADMIN_PASSWORD and JWT_SECRET before going live
npm run seed            # creates the SQLite DB and loads sample listings/inquiries
npm run dev              # starts the API on http://localhost:4000
```

### 2. Client

In a second terminal:

```bash
cd client
npm install
cp .env.example .env   # points the client at the API (defaults to localhost:4000)
npm run dev              # starts the site on http://localhost:5173
```

Open http://localhost:5173 for the public site, and http://localhost:5173/admin for
the admin dashboard (default password: `changeme123`, set in `server/.env`).

## Environment Variables

**`server/.env`**

| Variable | Description |
|---|---|
| `PORT` | API port (default `4000`) |
| `ADMIN_PASSWORD` | Hardcoded password for the admin dashboard |
| `JWT_SECRET` | Secret used to sign admin session tokens |
| `CLIENT_ORIGIN` | Allowed CORS origin(s) for the client, comma-separated |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the API (default `http://localhost:4000/api`) |

## Features

### Public Site
- Homepage with hero, search bar, and a featured listings carousel
- Inventory page with filters (make, price, year, mileage) and keyword search
- Vehicle detail page with a photo gallery, full specs, and a listing-specific contact form
- Sticky floating contact bar on every page (Call, Text/SMS, WhatsApp, Email modal)
- Financing calculator (price, down payment, term, APR → estimated monthly payment)
- Footer with contact info, social placeholders, and a link to `/admin`

### Admin Dashboard (`/admin`)
- Login screen (hardcoded password)
- Overview: active listings, sold listings, inquiries this week, unread inquiries
- Listings manager: add / edit / delete, up to 8 photo URLs per listing, active/sold toggle
- Inquiries inbox: buyer name, email, phone, message, vehicle reference, timestamp, mark read/unread

Mobile is treated as the primary experience throughout — the admin listings table
switches to a stacked card layout below the `sm` breakpoint, for example.

## Production Notes

This is an MVP. Before deploying for real:
- Set a strong, unique `ADMIN_PASSWORD` and `JWT_SECRET`
- Serve the client build (`npm run build` in `/client`) behind a real web server / CDN
- Put the API behind HTTPS and lock down CORS to your real domain
- Consider a hosted image bucket instead of raw photo URLs for listing photos
- The hardcoded single-password admin auth is fine for one operator; add real
  multi-user auth before handing dashboard access to a team
