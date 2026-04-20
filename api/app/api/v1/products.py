from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_api_key
from app.models.entities import Product
from app.schemas.product import ProductCreate, ProductOut

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)):
    return list(db.scalars(select(Product).where(Product.active.is_(True))).all())


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product or not product.active:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_api_key)])
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    existing = db.scalar(select(Product).where(Product.slug == payload.slug))
    if existing:
        raise HTTPException(status_code=409, detail="Slug already exists")

    product = Product(
        name=payload.name,
        slug=payload.slug,
        price=payload.price,
        stock=payload.stock,
        metadata_json={},
        active=True
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product
