from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/payments/razorpay", tags=["payments"])


class CreatePaymentOrderRequest(BaseModel):
    amount: float
    currency: str = "INR"


@router.post("/create-order")
def create_payment_order(payload: CreatePaymentOrderRequest):
    # Placeholder response shape matching Razorpay-ish flow.
    return {
        "provider": "razorpay",
        "order_id": "order_demo_123",
        "amount": payload.amount,
        "currency": payload.currency
    }


@router.post("/verify")
def verify_payment():
    return {"verified": True, "note": "Implement signature verification in production."}


@router.post("/webhook")
def razorpay_webhook():
    return {"received": True}
