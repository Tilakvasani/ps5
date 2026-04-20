from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/cart", tags=["cart"])

cart_items: list[dict] = []


class CartItemIn(BaseModel):
    product_id: int
    qty: int = 1


@router.get("")
def get_cart():
    return {"items": cart_items}


@router.post("/items")
def add_cart_item(payload: CartItemIn):
    cart_items.append(payload.model_dump())
    return {"items": cart_items}


@router.delete("/items/{item_index}")
def remove_cart_item(item_index: int):
    if 0 <= item_index < len(cart_items):
        cart_items.pop(item_index)
    return {"items": cart_items}
