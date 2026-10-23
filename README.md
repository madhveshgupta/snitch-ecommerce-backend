# Snitch — Single-Vendor E-Commerce Backend API

A role-based RESTful backend built with **Node.js, Express.js, and MongoDB (Mongoose)** for a single-vendor clothing e-commerce platform. Supports seller catalog management with cloud media uploads (**Multer + ImageKit CDN**), customer cart management, and **Cash on Delivery (COD)** checkout with server-side price recalculation and atomic inventory deduction.

---

## Tech Stack
- **Runtime & Framework:** Node.js (ES Modules), Express.js
- **Database:** MongoDB, Mongoose (`User`, `Product`, `Cart`, `Order` schemas)
- **Authentication & Security:** JWT (`accessToken` + `refreshToken` rotation in `httpOnly` cookies), `bcryptjs` password hashing
- **Media Storage:** Multer (`memoryStorage`) + ImageKit Cloud CDN
- **Request Validation:** `express-validator`

---

## Key Architectural Highlights
1. **Role-Based Access Control (RBAC):** Custom `authenticate` and `authenticateSeller` middlewares separate customer actions from seller catalog/order management.
2. **In-Memory Cloud Upload Pipeline:** Product images are buffered in RAM using `multer.memoryStorage()` and uploaded directly to **ImageKit CDN**, storing only the CDN URLs in MongoDB.
3. **Tamper-Proof COD Checkout:**
   - **Server-Side Price Recalculation:** Populates cart items from the `products` collection to compute `totalAmount` on the server rather than trusting client payloads.
   - **Historical Price Snapshotting:** Stores `priceAtPurchase` inside each order item so future catalog price edits do not alter past order invoices.
   - **Atomic Stock Deduction:** Uses MongoDB's positional `$inc` operator (`{ $inc: { "sizes.$.stock": -quantity } }`) to prevent race conditions during checkout.

---

## Project Structure
```text
├── src/
│   ├── app/
│   │   └── app.js
│   ├── config/
│   │   ├── config.js
│   │   └── db.js
│   ├── controller/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   └── order.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── cart.model.js
│   │   └── order.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── products.routes.js
│   │   ├── cart.routes.js
│   │   └── order.routes.js
│   ├── services/
│   │   └── storage.service.js
│   ├── utils/
│   │   └── auth.utils.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── product.validator.js
│   │   ├── cart.validator.js
│   │   └── order.validator.js
│   └── server.js
├── .env.example
├── .gitignore
└── package.json
```

---

## API Endpoints

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user or seller (`{ name, email, password, role? }`) |
| `POST` | `/api/auth/login` | Public | Authenticate user and set `httpOnly` JWT cookies |
| `POST` | `/api/auth/refresh` | Public (Cookie) | Rotate `refreshToken` and issue new `accessToken` |
| `POST` | `/api/auth/logout` | Authenticated | Clear cookies and invalidate `refreshToken` in DB |
| `GET` | `/api/auth/me` | Authenticated | Get current logged-in user details |

### 2. Products (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/products` | Seller | Create product (`multipart/form-data`: `images`, `title`, `description`, `price`, `sizes`) |
| `GET` | `/api/products` | Authenticated | List all published products |
| `GET` | `/api/products/seller` | Seller | List all products (published & unpublished) |
| `PATCH` | `/api/products/list/:id` | Seller | Publish a product to the store |
| `PATCH` | `/api/products/unlist/:id` | Seller | Unpublish a product from the store |

### 3. Shopping Cart (`/api/cart`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/cart` | Authenticated | Add item or increment quantity (`{ productId, size, quantity }`) |
| `GET` | `/api/cart` | Authenticated | View populated user cart |

### 4. Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders/checkout` | Authenticated | Place Cash on Delivery (COD) order (`{ shippingAddress }`) |
| `GET` | `/api/orders/my-orders` | Authenticated | View customer's past orders |
| `GET` | `/api/orders/seller` | Seller | View all customer orders |

---

## Local Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
