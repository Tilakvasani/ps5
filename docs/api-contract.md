# API Contract (MVP Draft)

## Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

## Products
- `GET /api/v1/products`
- `GET /api/v1/products/{id}`

## Cart
- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PATCH /api/v1/cart/items/{item_id}`
- `DELETE /api/v1/cart/items/{item_id}`

## Orders
- `POST /api/v1/orders`
- `GET /api/v1/orders/my`
- `GET /api/v1/orders/{id}`

## Payments
- `POST /api/v1/payments/razorpay/create-order`
- `POST /api/v1/payments/razorpay/verify`
- `POST /api/v1/payments/razorpay/webhook`
