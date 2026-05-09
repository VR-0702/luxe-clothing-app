# LUXE — Premium Clothing E-Commerce Platform

A full-stack, production-ready clothing store with three separate panels:
**Customer · Admin · Worker/Staff**

---

## 🚀 Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS          |
| Backend     | Node.js + Express                       |
| Database    | MongoDB + Mongoose                      |
| Auth        | JWT (JSON Web Tokens)                   |
| File Upload | Multer (local) → upgrade to Cloudinary  |
| Payments    | Demo system (plug in Razorpay/Stripe)   |
| Animations  | CSS Animations + Framer Motion          |

---

## 📁 Project Structure

```
premium-clothing-store/
├── backend/
│   ├── server.js              # Express entry point
│   ├── seeder.js              # Database seeder
│   ├── .env                   # Environment variables
│   ├── config/db.js           # MongoDB connection
│   ├── models/                # Mongoose schemas
│   │   ├── User.js            # Customer, Admin, Worker
│   │   ├── Product.js         # Products with variants
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   └── Coupon.js
│   ├── controllers/           # Business logic
│   ├── routes/                # API route definitions
│   ├── middleware/            # Auth, roles, uploads
│   └── uploads/               # Uploaded product images
│
└── frontend/
    ├── src/
    │   ├── App.jsx             # All routes
    │   ├── api/axios.js        # Axios instance + interceptors
    │   ├── context/            # Auth + Cart global state
    │   ├── components/         # Navbar, Footer, ProductCard
    │   ├── pages/              # Customer pages
    │   ├── admin/              # Admin panel
    │   └── worker/             # Worker panel
    └── ...
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### Step 1: Clone / Download

```bash
cd premium-clothing-store
```

---

### Step 2: Backend Setup

```bash
cd backend
npm install
```

Edit `.env` with your values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/luxe-clothing
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Seed the database with demo data + accounts:
```bash
node seeder.js
```

Start the backend server:
```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Backend runs at: **http://localhost:5000**

---

### Step 3: Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### Step 4: Login with Demo Accounts

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@luxe.com         | admin123    |
| Worker   | worker@luxe.com        | worker123   |
| Customer | customer@luxe.com      | customer123 |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint                    | Access   |
|--------|-----------------------------|----------|
| POST   | /api/auth/register          | Public   |
| POST   | /api/auth/login             | Public   |
| GET    | /api/auth/me                | Private  |
| PUT    | /api/auth/profile           | Private  |
| PUT    | /api/auth/change-password   | Private  |
| POST   | /api/auth/wishlist/:id      | Private  |

### Products
| Method | Endpoint                    | Access   |
|--------|-----------------------------|----------|
| GET    | /api/products               | Public   |
| GET    | /api/products/:id           | Public   |
| POST   | /api/products               | Admin    |
| PUT    | /api/products/:id           | Admin    |
| DELETE | /api/products/:id           | Admin    |
| POST   | /api/products/:id/review    | Customer |

### Cart
| Method | Endpoint                    | Access   |
|--------|-----------------------------|----------|
| GET    | /api/cart                   | Private  |
| POST   | /api/cart                   | Private  |
| PUT    | /api/cart/:itemId           | Private  |
| DELETE | /api/cart/:itemId           | Private  |
| POST   | /api/cart/apply-coupon      | Private  |

### Orders
| Method | Endpoint                    | Access   |
|--------|-----------------------------|----------|
| POST   | /api/orders                 | Customer |
| GET    | /api/orders/my              | Customer |
| GET    | /api/orders/:id             | Private  |

### Admin
| Method | Endpoint                         | Access |
|--------|----------------------------------|--------|
| GET    | /api/admin/dashboard             | Admin  |
| GET    | /api/admin/orders                | Admin  |
| PUT    | /api/admin/orders/:id/status     | Admin  |
| GET    | /api/admin/users                 | Admin  |
| PUT    | /api/admin/users/:id             | Admin  |
| POST   | /api/admin/workers               | Admin  |
| GET    | /api/admin/coupons               | Admin  |
| POST   | /api/admin/coupons               | Admin  |

### Worker
| Method | Endpoint                         | Access |
|--------|----------------------------------|--------|
| GET    | /api/worker/orders               | Worker |
| GET    | /api/worker/orders/pending       | Worker |
| PUT    | /api/worker/orders/:id/status    | Worker |
| GET    | /api/worker/stock                | Worker |
| PUT    | /api/worker/stock/:productId     | Worker |

---

## 💳 Payment Integration

The project ships with a **demo payment system** that confirms orders instantly.

To integrate **Razorpay** (recommended for India):

1. Install: `npm install razorpay`
2. Add to `.env`: `RAZORPAY_KEY_ID=xxx` and `RAZORPAY_KEY_SECRET=xxx`
3. Create `/api/payment/create-order` endpoint
4. Replace the demo payment section in `Checkout.jsx` with Razorpay checkout

For **Stripe**: follow similar steps with `stripe` npm package.

---

## 🖼️ Production Image Storage

Currently images are stored locally in `/backend/uploads/`.

For production, switch to **Cloudinary**:

1. `npm install cloudinary multer-storage-cloudinary`
2. Update `uploadMiddleware.js` to use CloudinaryStorage
3. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` to `.env`

---

## 🚀 Deployment

### Backend (Railway / Render / EC2)
```bash
cd backend
npm start
```

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Deploy the /dist folder
```

Update `VITE_API_URL` in frontend and `CLIENT_URL` in backend `.env` to production URLs.

---

## 🎨 Design System

| Token          | Value              |
|----------------|--------------------|
| Primary Gold   | `#D4AF37`          |
| Black          | `#0a0a0a`          |
| Cream          | `#fafaf7`          |
| Font Display   | Playfair Display   |
| Font Serif     | Cormorant Garamond |
| Font Sans      | DM Sans            |

---

## ✨ Features Summary

### Customer
- Browse products with search, filter, sort
- Product detail with variant selection (size + color)
- Cart management with coupon codes
- Checkout with demo/COD/card/UPI options
- Order tracking with status history
- Wishlist
- Product reviews & ratings
- User profile management

### Admin
- Sales dashboard with revenue charts
- Full product CRUD with image upload
- Category management
- Order management with status updates + worker assignment
- Customer and worker user management
- Coupon/discount creation
- Store settings

### Worker
- View assigned orders with packing details
- Update order status (processing → packed → shipped)
- Browse unassigned pending orders
- Stock level monitoring and updates

---

## 📞 Support

For customization, deployment help, or feature additions, contact your developer.

**LUXE Fashion Platform** — Built with ❤️ for premium e-commerce
