# Workyn

Workyn is an AI-powered SaaS platform for teams that need chat, CRM, resume workflows, clinic operations, analytics, collaboration, and smart rule-based automation in one product. The platform is built as a production-oriented monorepo with a React client, Express API, PostgreSQL persistence, Socket.io realtime features, Stripe billing, Cloudinary uploads, and an in-house AI engine with no external AI API dependency.

## Core Features

- Secure authentication with bcrypt password hashing, JWT auth, HTTP-only cookies, validation, sanitization, rate limiting, and role-based access control
- Realtime workspace chat with typing states, message history, file attachments, quick replies, and notifications
- CRM with lead management, filters, pagination, assignment, follow-up tracking, and AI-driven automation prompts
- Resume builder with live preview, PDF export, AI suggestions, and saved workspace context
- Clinic and patient workflows with appointment tracking, follow-up suggestions, and activity history
- Team collaboration with multi-user workspaces, invitations, role assignment, workspace switching, and shared data boundaries
- Monetization with subscription plans, Stripe checkout wiring, plan gates, and a billing dashboard
- Analytics, activity logs, notifications, global search, toast feedback, skeleton states, and motion-enhanced UI
- Docker, GitHub Actions CI, formatting, unit tests, API smoke tests, and deployment-ready environment templates

## Tech Stack

- Frontend: React, Vite, Material UI, React Router, Axios, Framer Motion, Recharts, Socket.io Client
- Backend: Node.js, Express, Socket.io, PostgreSQL, JWT, bcrypt, express-validator, Helmet, Morgan, Nodemailer
- Storage and billing: Cloudinary, Stripe
- AI layer: in-house behavior tracking, pattern detection, rules, and suggestions
- Tooling: Docker, Docker Compose, Jest, Supertest, Vitest, Testing Library, Prettier, GitHub Actions

## Project Structure

```text
.
├── client
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── modules
│   │   ├── pages
│   │   └── services
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── server
│   ├── ai-engine
│   ├── cache
│   ├── config
│   ├── controllers
│   ├── db
│   ├── middleware
│   ├── repositories
│   ├── routes
│   ├── services
│   ├── sockets
│   ├── tests
│   ├── validators
│   ├── Dockerfile
│   └── .env.example
├── .github/workflows
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Production Enhancements Included

- Security: Helmet, CORS allow-listing, request validation, recursive payload sanitization, auth and API rate limiting, secure cookie handling, and role checks
- Performance: in-memory caching, pagination, indexed PostgreSQL tables, debounced search, route-level lazy loading, and tuned Socket.io configuration
- SaaS features: workspace memberships, notifications, activity logs, global search, billing controls, analytics dashboards, and plan-based feature gating
- DevOps: Dockerfiles, compose setup, CI workflow, environment templates, build scripts, and structured logging

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Optional for Pro features: Cloudinary account, Stripe account, SMTP provider

### 1. Install dependencies

```bash
npm install
```

### 2. Create local env files

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Create the PostgreSQL database

```bash
createdb workyn
```

The backend boot process applies the schema in `server/db/schema.sql` automatically.

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment Variables

The complete variable reference lives in [`.env.example`](/Users/surajsingh/Desktop/Workyn/.env.example), [`server/.env.example`](/Users/surajsingh/Desktop/Workyn/server/.env.example), and [`client/.env.example`](/Users/surajsingh/Desktop/Workyn/client/.env.example).

### Backend essentials

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `CLIENT_URL`: primary frontend URL
- `CLIENT_URLS`: comma-separated allowed origins for CORS and Socket.io
- `COOKIE_NAME`: auth cookie name
- `BCRYPT_ROUNDS`: password hashing cost
- `AI_ANALYSIS_INTERVAL_MS`: AI background analysis interval

### Optional backend integrations

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_PRO_PRICE_MONTHLY`
- `MAX_UPLOAD_BYTES`
- `SOCKET_MAX_BUFFER_BYTES`

### Frontend

- `VITE_API_URL`
- `VITE_SOCKET_URL`

## Scripts

- `npm run dev`: run server and client in development
- `npm run build`: build the frontend bundle
- `npm run start`: start the production API server
- `npm run test`: run backend and frontend tests
- `npm run verify`: run backend syntax checks, tests, and frontend production build
- `npm run format`: format the repo with Prettier
- `npm run format:check`: verify formatting

## Testing

### Backend

- Jest + Supertest API smoke coverage
- Route validation regression checks

### Frontend

- Vitest + Testing Library component coverage

Run everything with:

```bash
npm run verify
```

## Billing and File Uploads

- Stripe is wired for subscription checkout and webhook-based workspace plan updates
- Cloudinary is used for profile images and chat file uploads
- If Stripe or Cloudinary credentials are not configured, the core product still runs, but those paid or upload-specific paths remain disabled

## Docker

Run the full stack locally with Docker:

```bash
docker compose up --build
```

This starts:

- `client` on port `5173`
- `server` on port `5000`
- `postgres` on port `5432`

## Deployment Notes

### Frontend

- Deploy the `client` app to Vercel or any static host
- Set `VITE_API_URL` and `VITE_SOCKET_URL` to the public backend URL

### Backend

- Deploy the `server` app to Render, Railway, Fly.io, or a container host
- Provide `DATABASE_URL`, `JWT_SECRET`, CORS origins, Stripe keys, and Cloudinary keys through the platform secret manager

### PostgreSQL

- Use managed PostgreSQL in production
- Run with SSL-enabled connection settings if required by your provider

## Screenshots

- Dashboard screenshot placeholder
- Chat and notifications screenshot placeholder
- CRM and analytics screenshot placeholder
- Team and billing screenshot placeholder
- Resume and clinic screenshot placeholder

## Future Improvements

- Add end-to-end browser tests for authenticated multi-user flows
- Move cache and background analysis jobs to Redis-backed workers
- Add S3 as an alternative storage provider
- Extend billing with invoices, seat-based pricing, and plan trials
- Add admin moderation tools and deeper audit analytics
