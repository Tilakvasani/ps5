from fastapi import FastAPI
from sqlalchemy import select

from app.api.v1.auth import router as auth_router
from app.api.v1.cart import router as cart_router
from app.api.v1.health import router as health_router
from app.api.v1.orders import router as orders_router
from app.api.v1.payments import router as payments_router
from app.api.v1.products import router as products_router
from app.core.config import settings
from app.core.db import Base, SessionLocal, engine
from app.models.entities import Product

app = FastAPI(title=settings.app_name)


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        existing = db.scalar(select(Product).where(Product.slug == "glowy-skin-tablets"))
        if not existing:
            db.add(
                Product(
                    name="Glowy Skin Tablets",
                    slug="glowy-skin-tablets",
                    price=799.0,
                    stock=100,
                    metadata_json={"flavor": "strawberry-lemon"},
                    active=True
                )
            )
            db.commit()


app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(products_router, prefix="/api/v1")
app.include_router(cart_router, prefix="/api/v1")
app.include_router(orders_router, prefix="/api/v1")
app.include_router(payments_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"app": settings.app_name, "env": settings.app_env}
