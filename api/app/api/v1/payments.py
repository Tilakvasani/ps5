from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.entities import Order, Payment, User

router = APIRouter(prefix="/payments/razorpay", tags=["payments"])


class CreatePaymentOrderRequest(BaseModel):
    order_id: int


class VerifyPaymentRequest(BaseModel):
    order_id: int
    provider_payment_id: str
    signature: str


@router.post("/create-order")
def create_payment_order(payload: CreatePaymentOrderRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.scalar(select(Order).where(Order.id == payload.order_id, Order.user_id == current_user.id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    provider_order_id = f"order_demo_{order.id}"
    payment = Payment(order_id=order.id, provider="razorpay", provider_order_id=provider_order_id, amount=order.total)
    db.add(payment)
    db.commit()

    return {"provider": "razorpay", "order_id": provider_order_id, "amount": order.total, "currency": "INR"}


@router.post("/verify")
def verify_payment(payload: VerifyPaymentRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.scalar(select(Order).where(Order.id == payload.order_id, Order.user_id == current_user.id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    payment = db.scalar(select(Payment).where(Payment.order_id == order.id))
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    # TODO: Replace with real Razorpay HMAC signature verification.
    payment.provider_payment_id = payload.provider_payment_id
    payment.status = "captured"
    order.status = "paid"
    db.commit()

    return {"verified": True, "order_status": order.status}


@router.post("/webhook")
def razorpay_webhook():
    return {"received": True, "note": "Implement webhook signature verification in production."}
