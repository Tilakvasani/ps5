# zupwell - Modern 3D E-Commerce Platform

A premium, futuristic e-commerce platform with stunning 3D UI, built with Next.js, React Three Fiber, and FastAPI.

## 🎨 Features

### Frontend (Next.js + TypeScript)
- **Modern 3D UI** with React Three Fiber and Three.js
- **Animated Components** using Framer Motion
- **Beautiful Glassmorphism Design** with Tailwind CSS
- **Responsive & Mobile-First** approach
- **State Management** with Valtio
- **Smooth Page Transitions** and micro-interactions

### Pages Included
- ✨ **Home Page** - Hero section with 3D animations and product showcase
- 🛍️ **Products Page** - 3D product gallery with floating cards
- 🛒 **Dashboard** - User cart management and order history
- 💳 **Checkout** - Secure checkout with order summary
- ✅ **Order Success** - Celebration page with order details
- 🔐 **Login/Register** - Beautiful auth pages with 3D backgrounds

### Backend (FastAPI + Python)
- RESTful API with modern authentication
- Product management
- Cart operations
- Order processing
- Payment integration ready
- CORS-enabled for frontend integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm/yarn
- Python 3.10+
- Virtual environment tools

### Frontend Setup

```bash
cd web

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd api

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

## 📁 Project Structure

```
ps5/
├── web/                          # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx             # Home page
│   │   ├── login/page.tsx       # Login page
│   │   ├── register/page.tsx    # Register page
│   │   ├── dashboard/page.tsx   # Dashboard
│   │   ├── products/page.tsx    # Products page
│   │   ├── checkout/page.tsx    # Checkout
│   │   └── order-success/[id]/page.tsx
│   ├── components/
│   │   ├── Navbar.tsx           # Navigation
│   │   ├── ProductShowcase.tsx  # Product grid
│   │   ├── 3D/
│   │   │   ├── GlowingSphere.tsx
│   │   │   └── FloatingCard.tsx
│   │   ├── HeroScene.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── Section.tsx
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   ├── store.ts             # Valtio store
│   │   └── useScrollStory.ts
│   └── package.json
│
└── api/                          # FastAPI Backend
    ├── app/
    │   ├── main.py              # Main app
    │   ├── api/v1/
    │   │   ├── auth.py
    │   │   ├── products.py
    │   │   ├── cart.py
    │   │   ├── orders.py
    │   │   ├── payments.py
    │   │   └── health.py
    │   ├── core/
    │   │   ├── config.py
    │   │   ├── db.py
    │   │   └── security.py
    │   ├── models/
    │   │   └── entities.py
    │   └── schemas/
    │       ├── auth.py
    │       └── product.py
    └── requirements.txt
```

## 🎯 Key Technologies

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **React Three Fiber** - 3D graphics
- **Three.js** - 3D library
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Valtio** - State management
- **Postprocessing** - Visual effects

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **Python-jose** - JWT tokens
- **SQLAlchemy** - ORM (ready to implement)
- **Uvicorn** - ASGI server

## 🔗 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Sign in

### Products
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/{id}` - Get product details

### Cart
- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart` - Add to cart
- `PUT /api/v1/cart/{product_id}` - Update quantity
- `DELETE /api/v1/cart/{product_id}` - Remove item

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - List orders
- `GET /api/v1/orders/{id}` - Get order details

### Payments
- `POST /api/v1/payments` - Process payment

### Health
- `GET /api/v1/health` - Health check

## 🎨 Design Features

### 3D Elements
- Animated glowing spheres with distortion
- Floating product cards with parallax
- Interactive background with stars and sparkles
- Mouse-tracked elements
- Scroll-responsive animations

### UI/UX
- Gradient text effects
- Glassmorphism cards
- Smooth transitions
- Loading states
- Error handling
- Responsive design

## 🔐 Authentication

The app includes a complete authentication flow:
1. **Register** - Create new account
2. **Login** - Sign in with credentials
3. **Token Storage** - JWT tokens in localStorage
4. **Protected Routes** - Dashboard requires authentication
5. **Auto-redirect** - Redirect to login if not authenticated

## 🛍️ E-Commerce Flow

1. **Browse Products** - View 3D product showcase
2. **Add to Cart** - Interactive cart management
3. **Dashboard** - View cart and order history
4. **Checkout** - Enter shipping and payment details
5. **Order Confirmation** - Success page with order ID

## 📝 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Backend (.env)
```
APP_NAME=zupwell
APP_ENV=development
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your-secret-key
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Railway/Heroku/AWS)
- Build: `pip install -r requirements.txt`
- Run: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## 📚 Next Steps

1. **Database Integration** - Connect to PostgreSQL
2. **Payment Gateway** - Stripe/PayPal integration
3. **Email Notifications** - Order confirmations
4. **Admin Dashboard** - Product management
5. **Analytics** - User tracking and metrics
6. **Mobile App** - React Native version

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this in your projects

## 🎉 Credits

Built with ❤️ for amazing user experiences

---

**Ready to launch?** Start both servers and visit `http://localhost:3000`!
