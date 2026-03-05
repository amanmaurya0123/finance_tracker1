# Personal Finance Tracker

A production-ready full-stack application for tracking personal income and expenses with role-based access, analytics, and JWT authentication.

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Axios, Recharts
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Caching:** Redis
- **Authentication:** JWT
- **API Docs:** Swagger (OpenAPI 3)

## Project Structure

```
finance-tracker/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   ├── config/
│   ├── utils/
│   ├── scripts/
│   ├── app.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── hooks/
│       ├── services/
│       ├── utils/
│       └── App.jsx
├── database/
│   ├── schema.sql
│   └── seed.sql
├── docker/
├── docker-compose.yml
└── README.md
```

## Run Locally (No Docker)

Use this if you are **not** using Docker. You need Node.js, PostgreSQL, and Redis installed on your machine.

### 1. Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** 14+ (running on your machine)
- **Redis** 6+ (running on your machine)

### 2. Start PostgreSQL and Redis

- Make sure **PostgreSQL** is running (default port 5432).
- Make sure **Redis** is running (default port 6379).  
  On Windows you can use [Redis for Windows](https://github.com/microsoftarchive/redis/releases) or WSL.

### 3. Create database and tables

Open a terminal in the project root (`finance-tracker`):

```bash
# Create the database (use your PostgreSQL user if not 'postgres')
psql -U postgres -c "CREATE DATABASE finance_tracker;"

# Apply the schema (run from finance-tracker folder)
psql -U postgres -d finance_tracker -f database/schema.sql
```

If the database already exists, skip the `CREATE DATABASE` line.

### 4. Backend setup and run

```bash
cd backend
# Windows (PowerShell): Copy-Item .env.example .env
# Windows (CMD) / Mac / Linux: copy .env.example .env   or   cp .env.example .env
copy .env.example .env
```

Edit `backend/.env` and set your PostgreSQL password (and anything else you changed):

```env
DB_PASSWORD=your_postgres_password
JWT_SECRET=any-long-random-string
```

Then:

```bash
npm install
node scripts/seed.js
npm run dev
```

Backend runs at **http://localhost:5000**. Leave this terminal open.

### 5. Frontend setup and run

Open a **new terminal** in the project root, then:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**.

### 6. Use the app

- Open **http://localhost:3000** in your browser.
- Log in with one of the demo accounts (see [Demo credentials](#demo-credentials) below).

---

## Environment Variables (Backend)

Create a `.env` file in the `backend` directory (or copy from `.env.example`):

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_tracker
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# CORS (frontend origin)
CORS_ORIGIN=http://localhost:3000
```

Adjust `DB_USER`, `DB_PASSWORD`, and ports if your local setup is different.

### API Documentation

With the backend running, open **http://localhost:5000/api-docs** for Swagger UI.

---

## Docker

Run the full stack with Docker Compose:

```bash
# From finance-tracker directory
docker-compose up -d
```

- **Frontend:** http://localhost (port 80)
- **Backend:** http://localhost:5000
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

After first run, seed demo users by executing the seed script inside the backend container or against the DB:

```bash
docker-compose exec backend node scripts/seed.js
```

(Ensure the backend container has the seed script and DB connection to the postgres service.)

---

## Demo Credentials

| Role     | Email              | Password   |
|----------|--------------------|------------|
| Admin    | admin@example.com  | admin123   |
| User     | user@example.com   | user123    |
| Read-only| readonly@example.com | readonly123 |

---

## Features

- **Auth:** Register, login, JWT, protected routes
- **Roles:** `admin`, `user`, `read-only`
  - Admin: full access, manage users, all transactions
  - User: CRUD own transactions, view analytics
  - Read-only: view transactions and analytics only
- **Transactions:** Add, edit, delete (by permission), search, filter by category/type, pagination
- **Analytics:** Monthly overview, category breakdown, income vs expense (charts)
- **Security:** Helmet, CORS, express-validator, rate limiting
- **Caching:** Redis for analytics (15 min) and categories (1 hr); cache invalidation on transaction changes

## License

MIT
