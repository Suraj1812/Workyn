# Workyn

Workyn is an AI-powered SaaS platform that brings chat, CRM, resume building, and clinic operations into one modular workspace. It includes an in-house automation and suggestion engine with no external AI API dependency.

## Features

- JWT-based authentication with protected routes and HTTP-only cookies
- Real-time chat with Socket.io, typing indicators, timestamps, and quick replies
- CRM pipeline with lead CRUD, follow-up suggestions, and inactivity detection
- Resume builder with live preview and PDF export
- Clinic and patient management with appointments and AI-driven reminders
- In-house AI engine for behavior tracking, rule-based automations, and smart suggestions
- PostgreSQL-backed persistence with repository-based server architecture

## Tech Stack

- Frontend: React, Vite, Material UI, React Router, Axios, Socket.io Client
- Backend: Node.js, Express, Socket.io, JWT, bcrypt
- Database: PostgreSQL
- AI Layer: Custom rule engine, pattern detection, and behavior tracking

## Project Structure

```text
.
├── client
│   ├── src
│   ├── .env.example
│   └── package.json
├── server
│   ├── ai-engine
│   ├── config
│   ├── controllers
│   ├── db
│   ├── middleware
│   ├── repositories
│   ├── routes
│   ├── sockets
│   ├── .env.example
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+

### Install

1. Install dependencies from the repository root:
   ```bash
   npm install
   ```
2. Copy the environment templates:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```
3. Create the PostgreSQL database:
   ```bash
   createdb workyn
   ```
4. Start the development servers:
   ```bash
   npm run dev
   ```
5. Open the app at [http://localhost:5173](http://localhost:5173).

The backend ensures the schema in `server/db/schema.sql` on startup.

## Scripts

- `npm run dev`: starts the client and server in development mode
- `npm run build`: builds the frontend for production
- `npm run start`: starts the production server
- `npm run verify`: runs backend syntax checks and the frontend production build
- `npm run format`: formats the repository with Prettier

## Environment Variables

### Backend

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: signing secret for JWT authentication
- `CLIENT_URL`: allowed frontend origin for CORS and sockets
- `PORT`: backend port
- `COOKIE_NAME`: auth cookie name
- `AI_ANALYSIS_INTERVAL_MS`: background AI analysis interval

### Frontend

- `VITE_API_URL`: frontend API base URL
- `VITE_SOCKET_URL`: Socket.io server URL

A consolidated reference file is available at `.env.example`.

## Production Notes

- Keep `JWT_SECRET` and `DATABASE_URL` in your deployment secret manager
- Set `NODE_ENV=production` so auth cookies use secure settings
- Build the frontend before serving it through your preferred hosting platform
- Point `CLIENT_URL`, `VITE_API_URL`, and `VITE_SOCKET_URL` to your deployed domains

## Screenshots

- Dashboard screenshot placeholder
- Chat module screenshot placeholder
- CRM module screenshot placeholder
- Resume builder screenshot placeholder
- Clinic module screenshot placeholder

## Basic Verification Checklist

- Auth register/login/logout flow
- Chat message creation and socket delivery path
- CRM lead create/update/delete APIs
- Clinic patient create/update APIs
- Resume save and PDF export UI path
- AI suggestion retrieval and response flows

## Future Improvements

- Add automated integration and end-to-end tests
- Introduce route-level code splitting to shrink the main frontend bundle
- Add audit logging dashboards and admin roles
- Support file attachments in chat and richer resume templates
- Add background job persistence for long-running automation workflows
