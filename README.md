# Glowy Skin 3D Commerce Starter

This repository now contains a production-style starter for your requested experience:

- **Frontend**: Next.js + Tailwind + React Three Fiber + GSAP scaffold.
- **Backend**: FastAPI + SQLAlchemy + JWT-ready auth scaffold.
- **Docs**: 14-day sprint plan and API contract draft.

## Project structure

```text
.
├─ web/          # Next.js storefront + 3D sections
├─ api/          # FastAPI service (auth, products, cart, orders, payments)
└─ docs/         # architecture + execution docs
```

## Quick start

### 1) Frontend

```bash
cd web
npm install
npm run dev
```

### 2) Backend

```bash
cd api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment

Copy examples before running:

- `web/.env.example` → `web/.env.local`
- `api/.env.example` → `api/.env`

## What is implemented

- Landing page sections and visual style scaffold.
- R3F hero scene with floating fruit placeholders and product placeholder.
- Scroll timeline hook with GSAP registration.
- FastAPI routers for health, auth, products, cart, orders, and payments (MVP contract shape).
- SQLAlchemy models for users, products, carts, orders, and payments.

> This is an MVP foundation designed for rapid iteration, not a finished production release.
