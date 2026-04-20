# Glowy Skin 3D Commerce Starter

This repository contains an end-to-end starter for a 3D commerce experience:

- **Frontend**: Next.js + Tailwind + React Three Fiber + GSAP scaffold.
- **Backend**: FastAPI + SQLAlchemy + JWT auth scaffold with DB-backed cart/order/payment primitives.
- **Docs**: MVP API contract and sprint plan.

## Project structure

```text
.
├─ web/          # Next.js storefront + 3D sections
├─ api/          # FastAPI service
├─ docs/         # architecture + execution docs
└─ docker-compose.yml  # PostgreSQL for local dev
```

## Quick start

### 1) Start PostgreSQL

```bash
docker compose up -d postgres
```

### 2) Frontend

```bash
cd web
npm install
npm run dev
```

### 3) Backend

```bash
cd api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. python scripts/setup_local.py
uvicorn app.main:app --reload
```

The setup script creates:
- `.env` with generated `JWT_SECRET` and `APP_API_KEY`
- database tables in PostgreSQL

If you already have a managed database, put your own `DATABASE_URL` in `api/.env`.

## API key usage

`POST /api/v1/products` is protected by `x-api-key` header.
Use `APP_API_KEY` value from your `.env`.

## Implemented backend surface

- Auth: register/login + `GET /api/v1/auth/me`
- Products: list/detail + admin create product (API key protected)
- Cart: add/update/remove + totals (DB-backed)
- Orders: create from active cart + list/get own orders
- Payments: create-order + verify scaffolding linked to orders/payments tables

## Still TODO before production

- Razorpay cryptographic signature verification
- webhook signature validation + retries
- Alembic migrations and stronger validation/error handling
- CI tests and deployment pipeline

> This is an MVP foundation designed for rapid iteration, not a finished production release.
