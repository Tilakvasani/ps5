# Zupwell — B2B/B2C Packaging Materials Website

Full-stack e-commerce platform for Zupwell, Ahmedabad. Built with Next.js 14 + Express.js + PostgreSQL + Prisma.

---

## 🏗️ Tech Stack

| Layer     | Tech                                         |
|-----------|----------------------------------------------|
| Frontend  | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand |
| Backend   | Node.js, Express.js, Prisma ORM              |
| Database  | PostgreSQL                                   |
| Storage   | Cloudinary (product images)                  |
| Payments  | Razorpay (UPI, Card, Netbanking)            |
| PDF       | PDFKit (GST tax invoices)                   |

---

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Cloudinary account (free tier works)
- Razorpay account (test mode)

---

### 1. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE zupwell;
\q
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and configure env
cp .env.example .env
# Edit .env with your DB credentials, Cloudinary, Razorpay keys

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database (admin + categories + products + coupons)
npm run db:seed

# Start development server
npm run dev
```

Backend runs on: **http://localhost:8000**

**Default Admin Credentials:**
- Email: `admin@zupwell.in`
- Password: `Admin@123`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure env
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
# Set NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key

# Start development server
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## 📁 Project Structure

```
zupwell/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Full DB schema
│   └── src/
│       ├── index.js               # Express entry point
│       ├── middleware/
│       │   ├── auth.js            # JWT auth middleware
│       │   └── upload.js          # Cloudinary upload
│       ├── routes/
│       │   ├── auth.js            # Register / Login
│       │   ├── products.js        # Product listing & detail
│       │   ├── categories.js      # Category list
│       │   ├── orders.js          # Order creation & history
│       │   ├── payments.js        # Razorpay integration
│       │   ├── invoices.js        # PDF invoice generation
│       │   ├── account.js         # Profile & addresses
│       │   └── admin.js           # Full admin API
│       └── utils/
│           ├── prisma.js          # Prisma singleton
│           ├── jwt.js             # JWT sign/verify
│           ├── orderNumber.js     # ZW-YYYY-NNNNN generator
│           └── seed.js            # DB seed script
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx           # Homepage
        │   ├── products/          # Product listing + detail
        │   ├── cart/              # Shopping cart
        │   ├── checkout/          # Multi-step checkout
        │   ├── order/[number]/    # Order confirmation
        │   ├── account/           # Profile + orders + addresses
        │   ├── login/             # Customer login
        │   ├── register/          # Registration
        │   └── admin/             # Full admin panel
        │       ├── page.tsx       # Dashboard + charts
        │       ├── products/      # CRUD with image upload
        │       ├── categories/    # Category management
        │       ├── inventory/     # Stock levels + movements
        │       ├── orders/        # Order management + status
        │       ├── invoices/      # Invoice list + PDF download
        │       ├── users/         # Customer list
        │       ├── coupons/       # Coupon CRUD
        │       ├── reviews/       # Review moderation
        │       ├── notifications/ # Admin notifications
        │       └── settings/      # Store settings
        ├── components/
        │   ├── storefront/
        │   │   ├── Navbar.tsx
        │   │   ├── Footer.tsx
        │   │   └── ProductCard.tsx
        │   └── admin/
        │       └── ProductForm.tsx
        └── lib/
            ├── api.ts             # Axios API client
            └── store.ts           # Zustand (cart + auth)
```

---

## 🛍️ Storefront Features

- ✅ Product listing with search, filter by category, price range, sort
- ✅ Product detail with image gallery, variants, GST breakdown preview
- ✅ Add to cart (persistent via Zustand + localStorage)
- ✅ Multi-step checkout (Address → Payment → Review)
- ✅ Razorpay payment (UPI, Card, Netbanking)
- ✅ Cash on Delivery option
- ✅ Auto GST invoice generation (CGST + SGST)
- ✅ PDF invoice download
- ✅ User account: profile, order history, saved addresses
- ✅ Coupon code support
- ✅ Responsive dark UI

---

## 🔧 Admin Panel Features

- ✅ Dashboard: revenue chart, top products, recent orders, low stock alert
- ✅ Products CRUD with Cloudinary image upload, variants, HSN codes
- ✅ Category management (parent/child hierarchy)
- ✅ Inventory tracking with stock movement log
- ✅ Order management with status updates (pending → shipped → delivered)
- ✅ GST invoice list with PDF download and cancel
- ✅ User management
- ✅ Coupon CRUD (percent/flat, min order, usage limit, validity)
- ✅ Review moderation (approve/delete)
- ✅ Admin notifications (new orders, low stock)
- ✅ Store settings (GSTIN, SMTP, Razorpay, shipping)

---

## 💰 GST Compliance

- Intra-state (Gujarat): CGST 9% + SGST 9% = 18%
- Inter-state: IGST 18%
- HSN Code support per product
- PDF invoice with all GST fields (GSTIN, HSN, tax breakup)
- Order number format: `ZW-YYYY-NNNNN`
- Invoice number format: `ZW-INV-YYYY-NNNNN`

---

*Built for Zupwell, Ahmedabad, Gujarat, India* 🇮🇳
