from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/products", tags=["products"])

MOCK_PRODUCTS = [
    {"id": 1, "name": "Glowy Skin Tablets", "slug": "glowy-skin-tablets", "price": 799.0}
]


@router.get("")
def list_products():
    return MOCK_PRODUCTS


@router.get("/{product_id}")
def get_product(product_id: int):
    for product in MOCK_PRODUCTS:
        if product["id"] == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")
