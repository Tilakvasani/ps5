from fastapi import APIRouter, HTTPException, Query
from typing import Optional

router = APIRouter(prefix="/products", tags=["products"])

MOCK_PRODUCTS = [
    {
        "id": 1,
        "name": "zupwell Skin Tablets",
        "slug": "zupwell-skin-tablets",
        "price": 799.0,
        "description": "Advanced molecular extraction tablets for radiant skin nutrition. Each tablet contains 500mg of our proprietary 3D-extracted fruit essence complex.",
        "category": "tablets",
        "tags": ["skin", "radiance", "daily"],
        "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
        "in_stock": True,
        "rating": 4.8,
        "reviews": 124,
    },
    {
        "id": 2,
        "name": "zupwell Glow Serum",
        "slug": "zupwell-glow-serum",
        "price": 1299.0,
        "description": "Luxurious serum infused with bioactive peptides and vitamin C. Lightweight formula absorbs instantly for luminous, youthful skin.",
        "category": "serum",
        "tags": ["glow", "anti-aging", "luxury"],
        "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        "in_stock": True,
        "rating": 4.9,
        "reviews": 89,
    },
    {
        "id": 3,
        "name": "zupwell Night Repair",
        "slug": "zupwell-night-repair",
        "price": 1599.0,
        "description": "Overnight regeneration complex with retinol and hyaluronic acid. Wake up to visibly smoother, firmer skin every morning.",
        "category": "cream",
        "tags": ["night", "repair", "retinol"],
        "image": "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=80",
        "in_stock": True,
        "rating": 4.7,
        "reviews": 203,
    },
    {
        "id": 4,
        "name": "zupwell Vitamin C Boost",
        "slug": "zupwell-vitamin-c-boost",
        "price": 999.0,
        "description": "High-potency vitamin C powder for brightening and protection against environmental stressors. Mix with your favorite moisturizer.",
        "category": "powder",
        "tags": ["brightening", "vitamin-c", "protection"],
        "image": "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80",
        "in_stock": False,
        "rating": 4.6,
        "reviews": 67,
    },
    {
        "id": 5,
        "name": "zupwell Cleansing Foam",
        "slug": "zupwell-cleansing-foam",
        "price": 599.0,
        "description": "Gentle pH-balanced foam cleanser with natural fruit enzymes. Removes impurities without stripping your skin's natural moisture barrier.",
        "category": "cleanser",
        "tags": ["cleanse", "gentle", "daily"],
        "image": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80",
        "in_stock": True,
        "rating": 4.5,
        "reviews": 156,
    },
    {
        "id": 6,
        "name": "zupwell Eye Elixir",
        "slug": "zupwell-eye-elixir",
        "price": 1899.0,
        "description": "Concentrated eye treatment with caffeine and peptides. Reduces dark circles and puffiness for a well-rested, refreshed look.",
        "category": "eye-care",
        "tags": ["eyes", "dark-circles", "premium"],
        "image": "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=80",
        "in_stock": True,
        "rating": 4.9,
        "reviews": 92,
    },
]


@router.get("")
def list_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    in_stock: Optional[bool] = Query(None, description="Filter by stock availability"),
):
    products = MOCK_PRODUCTS.copy()
    
    if category:
        products = [p for p in products if p["category"] == category]
    
    if search:
        search_lower = search.lower()
        products = [p for p in products if search_lower in p["name"].lower() or search_lower in p.get("description", "").lower()]
    
    if min_price is not None:
        products = [p for p in products if p["price"] >= min_price]
    
    if max_price is not None:
        products = [p for p in products if p["price"] <= max_price]
    
    if in_stock is not None:
        products = [p for p in products if p["in_stock"] == in_stock]
    
    return products


@router.get("/{product_id}")
def get_product(product_id: int):
    for product in MOCK_PRODUCTS:
        if product["id"] == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")


@router.get("/categories/list")
def list_categories():
    categories = list(set(p["category"] for p in MOCK_PRODUCTS))
    return [{"name": c, "count": sum(1 for p in MOCK_PRODUCTS if p["category"] == c)} for c in categories]
