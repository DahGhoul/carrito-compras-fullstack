# ShopConsole — Full-Stack E-Commerce Platform

> A production-ready e-commerce system with a complete admin panel, real-time inventory management, and integrated payment processing.

![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white)

---

## Overview

ShopConsole is a full-stack e-commerce platform built with a clean separation between a React frontend and a Node.js REST API. The project was designed with real-world constraints in mind: role-based access control, secure JWT authentication with refresh tokens, rate limiting, and a complete administrative suite covering everything from product management to financial reporting.

The architecture avoids over-engineering while remaining extensible — Prisma migrations keep the database schema versioned, and the repository pattern in the backend keeps business logic decoupled from the data layer.

---

## Features

### Storefront

- Product catalog with category and brand filtering
- Persistent shopping cart (synced to user account)
- Multi-step checkout wizard with address management
- Stripe-powered card payments
- Order history and detailed order tracking per customer

### Admin Panel

- **Dashboard** with real-time KPIs (revenue, orders, top products)
- **Product management** — full CRUD with image support and offer pricing
- **Inventory control** — movement tracking (entries, adjustments, reservations)
- **Order management** — status transitions with a complete audit trail
- **Customer management** — account overview and purchase history
- **Reporting suite** — 14 downloadable reports exported to PDF using jsPDF
- **Analytics** — sales charts, RFM segmentation, and cohort analysis via Recharts

### Technical

- RBAC with four roles: `ADMIN`, `GERENTE_VENTAS`, `GERENTE_INVENTARIO`, `VENDEDOR`
- Access tokens (JWT) + Refresh token rotation stored in the database
- Input validation with Zod on both frontend (React Hook Form) and backend
- Rate limiting (300 req / 15 min) and security headers via Helmet
- Swagger UI available at `/api/docs`
- Dark / Light theme toggle persisted across sessions
- Fully containerized with Docker Compose for local development

---

## Tech Stack

| Layer            | Technology                                        |
| ---------------- | ------------------------------------------------- |
| Frontend         | React 18, TypeScript, Vite, React Router v6       |
| State            | Zustand, TanStack Query                           |
| Forms            | React Hook Form + Zod                             |
| Styling          | Vanilla CSS (custom design system, no UI library) |
| Charts           | Recharts                                          |
| PDF Export       | jsPDF + jspdf-autotable                           |
| Icons            | Lucide React                                      |
| Backend          | Node.js, Express 4, TypeScript                    |
| ORM              | Prisma 5                                          |
| Database         | PostgreSQL 16                                     |
| Auth             | JWT (access + refresh), bcrypt                    |
| Payments         | Stripe API                                        |
| Logging          | Winston + Morgan                                  |
| Validation       | Zod                                               |
| Containerization | Docker, Docker Compose, Nginx                     |

---

## Project Structure

```
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (13 models)
│   │   └── seed.ts             # Initial data seeding
│   └── src/
│       ├── controllers/        # Request handlers
│       ├── services/           # Business logic layer
│       ├── repositories/       # Data access layer (Prisma)
│       ├── routes/             # Express routers
│       ├── middlewares/        # Auth, RBAC, error handling, validation
│       ├── schemas/            # Zod validation schemas
│       └── config/             # Environment and logger setup
├── frontend/
│   └── src/
│       ├── components/         # Shared layout components
│       ├── pages/
│       │   ├── admin/          # Admin panel pages
│       │   └── shop/           # Storefront pages
│       ├── services/           # Axios API client modules
│       ├── stores/             # Zustand state (auth, cart, theme)
│       └── routes/             # Protected route guards
├── sql/                        # Raw SQL scripts
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Stripe account with a test API key

### 1. Clone the repository

```bash
git clone https://github.com/DahGhoul/carrito-compras-fullstack.git
cd carrito-compras-fullstack
```

### 2. Configure environment variables

Copy the example files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**`backend/.env`**

```env
DATABASE_URL=postgresql://user:password@postgres:5432/ecommerce
JWT_SECRET=your_strong_secret_here
JWT_REFRESH_SECRET=another_strong_secret_here
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:5173
PORT=4000
```

**`frontend/.env`**

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### 3. Start the application

```bash
docker-compose up --build
```

| Service      | URL                            |
| ------------ | ------------------------------ |
| Storefront   | http://localhost:5173          |
| API          | http://localhost:4000/api/v1   |
| Swagger Docs | http://localhost:4000/api/docs |
| pgAdmin      | http://localhost:5050          |

### 4. Seed the database

After the containers are running, open a new terminal and run:

```bash
docker exec -it ecommerce_backend npx prisma db seed
```

This creates the default roles, categories, brands, sample products, and an admin account.

**Default admin credentials:**

```
Email:    admin@shopconsole.com
Password: Admin1234!
```

---

## API Overview

All endpoints are prefixed with `/api/v1`. Protected routes require a Bearer token in the `Authorization` header.

| Module   | Endpoints                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Auth     | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`                          |
| Products | `GET /products`, `GET /products/:id`, `POST /products` (admin)                                   |
| Cart     | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`             |
| Orders   | `POST /orders`, `GET /orders/my`, `GET /orders/:id`                                              |
| Payments | `POST /payments/create-intent`, `POST /payments/confirm`                                           |
| Admin    | `/admin/products`, `/admin/orders`, `/admin/inventory`, `/admin/clients`, `/admin/reports/*` |

Full interactive documentation is available at `/api/docs` when the server is running.

---

## Database Schema

The schema is organized into four logical namespaces reflected in the table prefixes:

- `seg_` — Security (users, roles, refresh tokens)
- `cat_` — Catalog (products, categories, brands, images, reviews)
- `ord_` — Orders (carts, orders, order items, status history)
- `inv_` — Inventory (movement log)
- `cli_` — Clients (addresses, reviews)

---

## Deployment

The stack is designed to be deployed on free-tier cloud services:

| Service           | Provider         |
| ----------------- | ---------------- |
| Frontend (Static) | Vercel / Netlify |
| Backend (API)     | Render           |
| Database          | Neon / Supabase  |

Set `VITE_API_URL` to point to your Render backend URL, and make sure `FRONTEND_URL` in the backend environment reflects your Vercel deployment URL to keep CORS properly configured.

---

## License

This project is licensed under the **MIT License** — you are free to use, modify, and distribute this software. See the [LICENSE](./LICENSE) file for the full text.

---

*Built with attention to the things that matter in production: security, structure, and maintainability.*
