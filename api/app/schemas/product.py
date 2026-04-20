from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str
    slug: str
    price: float = Field(gt=0)
    stock: int = Field(ge=0, default=0)


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    price: float

    class Config:
        from_attributes = True
