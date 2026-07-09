# TaskHub MVP

TaskHub is a production-oriented MVP for verified daily task work:

- React + Vite + TypeScript frontend
- Flask + SQLAlchemy + JWT backend
- Supabase PostgreSQL database
- Supabase Storage-ready upload service
- User and admin role flows

## Project Structure

```text
frontend/   React, Vite, Tailwind CSS
backend/    Flask API, SQLAlchemy models, JWT auth
database/   Supabase/PostgreSQL schema
docs/       Deployment notes
uploads/    Local development upload fallback
```

## Local Setup

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
flask init-db
flask seed-admin
flask run --host 0.0.0.0 --port 5000
```

Frontend build for single-port Flask serving:

```bash
cd frontend
pnpm install
copy .env.example .env
pnpm build
```

Then run only the backend:

```bash
cd backend
flask run --host 0.0.0.0 --port 5000
```

Open `http://localhost:5000`. Flask serves both the API and the built React app from the same port.

## Production Notes

Set these backend variables on Render or Railway:

- `SECRET_KEY`
- `JWT_SECRET_KEY`
- `DATABASE_URL`
- `FRONTEND_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

For single-port deployment, set this frontend variable before building:

- `VITE_API_URL`

Run `flask init-db` once against the Supabase database, then run `flask seed-admin` to create the first admin.
