# 🚀 zupwell - Quick Reference Guide

## 📋 Pre-Flight Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.10+ installed  
- [ ] npm or yarn available
- [ ] Git (optional, for version control)
- [ ] Two terminal windows ready

## 🎯 Quick Start (5 Minutes)

### Step 1: Start Backend
```powershell
# Navigate to api directory
cd api

# Create & activate virtual environment (first time only)
python -m venv .venv
.venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# IMPORTANT: Make sure you're IN the api directory, then run:
uvicorn app.main:app --reload

# If you get "ModuleNotFoundError: No module named 'app'":
# Make sure you're in the api directory and the venv is activated!
```

### Step 2: Start Frontend (New Terminal)
```powershell
cd web
npm install
npm run dev
```

### Step 3: Open Browser
Visit: **http://localhost:3000**

## 📍 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main app |
| Backend API | http://localhost:8000 | API server |
| API Docs | http://localhost:8000/docs | Swagger UI |
| API ReDoc | http://localhost:8000/redoc | Alternative docs |

## 🎨 Pages Available

| Page | URL | Status |
|------|-----|--------|
| Home | / | ✅ Complete |
| Products | /products | ✅ Complete |
| Login | /login | ✅ Complete |
| Register | /register | ✅ Complete |
| Dashboard | /dashboard | ✅ Complete |
| Checkout | /checkout | ✅ Complete |
| Order Success | /order-success/[id] | ✅ Complete |

## 🔧 Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill the process if needed
taskkill /PID <PID> /F

# Then restart
uvicorn app.main:app --reload
```

### Frontend Won't Start
```bash
# Clear cache
rm -rf .next node_modules

# Reinstall
npm install
npm run dev
```

### CORS Errors
- Backend CORS is pre-configured for localhost:3000
- Check `api/app/main.py` if issues persist

## 🎨 Customization

### Change Colors
Edit `web/lib/store.ts`:
```typescript
export const store = proxy<Store>({
  themeColor: "#ec4899", // Change this
  // ...
});
```

### Change API URL
Edit `web/lib/api.ts`:
```typescript
const API_BASE_URL = "http://localhost:8000/api/v1";
```

### Add New Products
Edit `api/app/api/v1/products.py`:
```python
MOCK_PRODUCTS = [
    {"id": 1, "name": "Product Name", "slug": "product-slug", "price": 99.99}
]
```

## 📦 Dependencies

### Frontend
- next@14.2.26
- react@18.3.1
- three@0.173.0
- framer-motion@12.38.0
- @react-three/fiber@8.17.11
- valtio@2.3.1
- tailwindcss@3.4.17

### Backend
- fastapi@0.115.12
- uvicorn@0.34.2
- sqlalchemy@2.0.40
- python-jose@3.3.0
- passlib@1.7.4

## 🔐 Authentication Flow

1. **Register** - Create account with email/password
2. **Login** - Get JWT token
3. **Token Storage** - Saved in localStorage
4. **Protected Routes** - Dashboard checks token
5. **Auto Redirect** - Sends to login if needed

## 📊 Test Data

### Default Test Product
- ID: 1
- Name: zupwell Skin Tablets
- Price: $799.00

### Test Login
(Once implemented in backend)
- Email: test@example.com
- Password: password123

## 🎯 Development Tips

### Hot Reload
- Frontend: Automatic (Next.js)
- Backend: Enabled (--reload flag)

### Debug Mode
Frontend:
```bash
npm run dev -- -d
```

Backend:
```bash
uvicorn app.main:app --reload --log-level debug
```

### Environment Files
Create `.env.local` in web/:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 🚀 Deployment Preparation

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Railway/Heroku)
```bash
pip freeze > requirements.txt
# Deploy the api/ folder
```

## 💾 Saving Your Work

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Modern 3D e-commerce platform"

# Add remote (replace with your repo)
git remote add origin https://github.com/yourusername/zupwell.git

# Push
git push -u origin main
```

## ❓ FAQ

**Q: Can I use this with a real database?**
A: Yes! Update `api/core/db.py` with your database connection.

**Q: How do I add payment processing?**
A: Implement in `api/app/api/v1/payments.py` using Stripe/PayPal SDK.

**Q: Can I deploy this to production?**
A: Yes! Follow the deployment steps in SETUP.md

**Q: How do I add more products?**
A: Add to `MOCK_PRODUCTS` in `api/app/api/v1/products.py` or connect a database.

**Q: Is the authentication ready?**
A: The endpoints are set up. Implement user storage in database for production.

## 🎉 You're Ready!

Everything is configured and ready to go.

Start with Step 1 above and enjoy your modern 3D e-commerce platform!

---

**Need Help?** Check:
- SETUP.md - Full setup guide
- IMPLEMENTATION_SUMMARY.md - What was created
- API Docs at http://localhost:8000/docs

**Happy coding! 🚀**
