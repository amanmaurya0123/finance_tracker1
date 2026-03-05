# Deployment Guide – Get Your Demo Link

This project has **two parts**: a **frontend** (React) and a **backend** (Node/Express + PostgreSQL + Redis). To get a public link:

1. Deploy the **backend** somewhere (e.g. Render, Railway).
2. Deploy the **frontend** to **Vercel** or **Netlify** and point it to your backend URL.

You will get your **demo link** from Vercel or Netlify after you deploy the frontend.

---

## Part 1: Deploy Backend (get backend URL)

The backend needs **Node.js**, **PostgreSQL**, and **Redis**. Free options:

### Option A: Render (recommended, free tier)

1. Go to [render.com](https://render.com) and sign up.
2. Create a **PostgreSQL** database: Dashboard → New → PostgreSQL. Note the **Internal Database URL** (or External if you want to connect from your PC).
3. Create a **Redis** instance: Dashboard → New → Redis (or use [Upstash Redis](https://upstash.com) free tier and get the Redis URL).
4. Create a **Web Service**: New → Web Service.
5. Connect your GitHub repo (push your `finance-tracker` code to GitHub first).
6. **Root Directory:** set to `backend` (so Render builds and runs the backend only).
7. **Build command:** `npm install`
8. **Start command:** `node server.js`
9. **Environment variables** (add in Render dashboard):

   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=<from Render Postgres host>
   DB_PORT=5432
   DB_NAME=finance_tracker
   DB_USER=<postgres user>
   DB_PASSWORD=<postgres password>
   DATABASE_URL=<full Postgres connection URL if Render provides it>
   REDIS_HOST=<Redis host>
   REDIS_PORT=6379
   REDIS_URL=<full Redis URL if using Upstash>
   JWT_SECRET=<generate a long random string>
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

   If Render gives you a single `DATABASE_URL`, use that and update your backend to read `DATABASE_URL` (see note below).

10. Deploy. Your backend URL will be like: **`https://your-app-name.onrender.com`**

11. Run the database schema and seed on the hosted Postgres (using the same `schema.sql` and `seed.js` logic, or run migrations via a one-off script).

**Important:** After the backend is live, set `CORS_ORIGIN` to your actual frontend URL (e.g. `https://your-project.vercel.app`).

### Option B: Railway

1. Go to [railway.app](https://railway.app) and sign up.
2. New Project → Add PostgreSQL and Redis from the catalog.
3. Add a **Service** from your GitHub repo, set root to `backend`.
4. Set the same env vars as above (Railway will inject `DATABASE_URL` and `REDIS_URL` if you use their Postgres/Redis).
5. Deploy and note the backend URL (e.g. **`https://your-app.up.railway.app`**).

---

## Part 2: Deploy Frontend to Vercel (get your demo link)

1. Push your project to **GitHub** (if not already).
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New → Project** and import your repo.
4. **Root Directory:** set to `frontend` (so Vercel builds only the frontend).
5. **Framework Preset:** Vite (auto-detected).
6. **Build Command:** `npm run build`
7. **Output Directory:** `dist`
8. **Environment variable** (important):

   - Name: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com/api` (use the real backend URL from Part 1, and add `/api` at the end)

9. Click **Deploy**.

When the build finishes, Vercel will show your **deployment link**, e.g.:

- **`https://your-project-name.vercel.app`**

That is your **demo link**. Share this URL; anyone can open it in a browser. Make sure your backend is deployed and `CORS_ORIGIN` includes this URL, and that you’ve run the schema and seed on the hosted database.

---

## Part 2 (alternative): Deploy Frontend to Netlify

1. Push your project to **GitHub**.
2. Go to [netlify.com](https://netlify.com) and sign in with GitHub.
3. **Add new site → Import an existing project** → choose your repo.
4. **Base directory:** `frontend`
5. **Build command:** `npm run build`
6. **Publish directory:** `frontend/dist`
7. **Environment variable:**
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com/api`
8. Deploy.

Your **demo link** will be like: **`https://random-name-12345.netlify.app`** (you can change the site name in Netlify settings).

---

## Summary

| Step | What you get |
|------|----------------|
| 1. Deploy backend (Render/Railway) | Backend URL, e.g. `https://finance-api.onrender.com` |
| 2. Set `VITE_API_URL` = Backend URL + `/api` | Frontend can call your API |
| 3. Deploy frontend (Vercel or Netlify) | **Demo link**, e.g. `https://your-project.vercel.app` |

**Your demo link = the Vercel or Netlify URL** after you complete the frontend deployment and set the env variable.

---

## Optional: Backend using DATABASE_URL

If your host (e.g. Render) only gives a single `DATABASE_URL`, you can support it in `backend/config/database.js` by using:

```js
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'finance_tracker',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
      }
);
```

Then set `DATABASE_URL` in the host’s env vars and leave individual DB_ vars unset if you prefer.
