from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.entities import Cart, CartItem, Product, User

router = APIRouter(prefix="/cart", tags=["cart"])


class CartItemIn(BaseModel):
    product_id: int
    qty: int = Field(default=1, ge=1)


@router.get("")
def get_cart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cart = db.scalar(select(Cart).where(Cart.user_id == current_user.id, Cart.status == "active"))
    if not cart:
        return {"items": [], "total": 0}

    items = list(db.scalars(select(CartItem).where(CartItem.cart_id == cart.id)).all())
    result = [
        {
            "id": item.id,
            "product_id": item.product_id,
            "qty": item.qty,
            "unit_price": item.unit_price,
            "line_total": item.qty * item.unit_price
        }
        for item in items
    ]
    return {"items": result, "total": sum(item["line_total"] for item in result)}


@router.post("/items")
def add_cart_item(payload: CartItemIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.get(Product, payload.product_id)
    if not product or not product.active:
        raise HTTPException(status_code=404, detail="Product not found")

    cart = db.scalar(select(Cart).where(Cart.user_id == current_user.id, Cart.status == "active"))
    if not cart:
        cart = Cart(user_id=current_user.id, status="active")
        db.add(cart)
        db.flush()

    existing_item = db.scalar(
        select(CartItem).where(CartItem.cart_id == cart.id, CartItem.product_id == payload.product_id)
    )
    if existing_item:
        existing_item.qty += payload.qty
    else:
        db.add(CartItem(cart_id=cart.id, product_id=payload.product_id, qty=payload.qty, unit_price=product.price))

    db.commit()
    return {"ok": True}


@router.patch("/items/{item_id}")
def update_cart_item(item_id: int, payload: CartItemIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cart = db.scalar(select(Cart).where(Cart.user_id == current_user.id, Cart.status == "active"))
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    item = db.scalar(select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id))
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.qty = payload.qty
    db.commit()
    return {"ok": True}


@router.delete("/items/{item_id}")
def remove_cart_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cart = db.scalar(select(Cart).where(Cart.user_id == current_user.id, Cart.status == "active"))
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    item = db.scalar(select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id))
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()
    return {"ok": True}
