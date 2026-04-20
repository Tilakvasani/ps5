from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.entities import Cart, CartItem, Order, User

router = APIRouter(prefix="/orders", tags=["orders"])


class CreateOrderRequest(BaseModel):
    address: dict = Field(default_factory=dict)


@router.post("")
def create_order(payload: CreateOrderRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cart = db.scalar(select(Cart).where(Cart.user_id == current_user.id, Cart.status == "active"))
    if not cart:
        raise HTTPException(status_code=400, detail="Cart is empty")

    items = list(db.scalars(select(CartItem).where(CartItem.cart_id == cart.id)).all())
    if not items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = sum(item.qty * item.unit_price for item in items)
    order = Order(user_id=current_user.id, total=total, status="created", address_json=payload.address)
    db.add(order)

    cart.status = "converted"
    db.commit()
    db.refresh(order)

    return {"id": order.id, "total": order.total, "status": order.status}


@router.get("/my")
def list_my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = list(db.scalars(select(Order).where(Order.user_id == current_user.id)).all())
    return [{"id": order.id, "total": order.total, "status": order.status} for order in orders]


@router.get("/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.scalar(select(Order).where(Order.id == order_id, Order.user_id == current_user.id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"id": order.id, "total": order.total, "status": order.status, "address": order.address_json}
