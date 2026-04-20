from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/orders", tags=["orders"])

orders: list[dict] = []


class CreateOrderRequest(BaseModel):
    total: float
    address: dict


@router.post("")
def create_order(payload: CreateOrderRequest):
    order = {"id": len(orders) + 1, "status": "created", **payload.model_dump()}
    orders.append(order)
    return order


@router.get("/my")
def list_my_orders():
    return orders
