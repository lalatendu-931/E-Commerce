# E-Commerce Website 🛒

A modern full-stack e-commerce web application template for **electronics stores** - featuring product catalog, shopping cart, user authentication, order management, and repair services.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)

> ⚠️ **Note**: This is a demonstration/portfolio project and is not intended for production use at this time.

---

## � Complete Full-Stack Project

**This is a production-ready, complete full-stack e-commerce application** with:

| Layer | Technology | Status |
|-------|------------|--------|
| 🎨 **Frontend** | React 19 + Vite | ✅ Complete |
| ⚙️ **Backend** | FastAPI (Python) | ✅ Complete |
| 🗄️ **Database** | PostgreSQL (Supabase) | ✅ Complete |
| 🔐 **Authentication** | Supabase Auth | ✅ Complete |
| 📡 **API** | RESTful API | ✅ Complete |

### ⚡ Quick Start - It Just Works!

Once you configure your Supabase credentials and run both frontend & backend:

1. **Database tables are auto-created** in your Supabase project on first run
2. **Frontend connects to Backend** via the configured API URL
3. **Authentication flows** work out of the box with Supabase
4. **Your e-commerce site is live** on localhost!

> 💡 No manual database setup required - just add your Supabase credentials and everything connects automatically.

---

## �📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

This is a full-stack e-commerce platform designed for retail electronics businesses. The application bridges online convenience with offline trust, supporting features like:

- **Pay Online**: Complete purchases with online payment
- **Reserve & Pickup**: Reserve items online and pay at the store
- **Pre-booking**: Advance booking for out-of-stock items
- **Repair Services**: Submit repair inquiries for fans, motors, and appliances

This system is designed to support the unique requirements of an Indian retail business where customers often prefer to see products in person and negotiate prices.

---

## ✨ Features

### Customer Features
- 🛒 **Product Browsing** - Browse products by category with search and filters
- 📦 **Shopping Cart** - Add items, manage quantities, and checkout
- 🔐 **Authentication** - Sign up/login with email or Google (via Supabase)
- 📱 **Responsive Design** - Mobile-first design with dedicated mobile navigation
- 🛠️ **Repair Inquiries** - Submit service requests for electrical repairs
- 📅 **Pre-booking** - Book items in advance for store visits
- 👤 **User Account** - View order history and manage profile

### Admin/Staff Features
- 📊 **Inventory Management** - Track stock levels and reservations
- 📋 **Order Management** - Process and update order statuses
- 🏷️ **Category Management** - Create and organize product categories
- 👥 **Role-based Access** - Customer, Staff, and Admin roles

### Product Categories
- 🌀 Ceiling & Table Fans
- 🍳 Kitchen Appliances
- 🔧 Spare Parts & Motors
- ⚡ Electrical Accessories

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **React Router 7** | Client-side routing |
| **Vite 7** | Build tool & dev server |
| **Supabase JS** | Authentication & real-time |
| **Lucide React** | Icon library |
| **CSS Modules** | Component styling |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | REST API framework |
| **SQLAlchemy 2.0** | Async ORM |
| **PostgreSQL** | Database (via Supabase) |
| **Alembic** | Database migrations |
| **Pydantic v2** | Data validation |
| **Supabase** | Auth & database hosting |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service |
| **PostgreSQL** | Relational database |
| **Uvicorn** | ASGI server |

---

## 📁 Project Structure

```
ecommerce-website/
├── 📂 backend/                 # FastAPI Backend
│   ├── 📂 alembic/            # Database migrations
│   │   └── versions/          # Migration files
│   ├── 📂 app/
│   │   ├── 📂 api/
│   │   │   ├── deps.py        # Dependency injection
│   │   │   ├── middleware.py  # Custom middleware
│   │   │   └── 📂 routes/     # API endpoints
│   │   │       ├── auth.py    # Authentication
│   │   │       ├── users.py   # User management
│   │   │       ├── products.py # Products & categories
│   │   │       ├── orders.py  # Order processing
│   │   │       ├── prebookings.py # Pre-booking system
│   │   │       └── repairs.py # Repair inquiries
│   │   ├── 📂 core/
│   │   │   ├── config.py      # Settings management
│   │   │   ├── logging.py     # Structured logging
│   │   │   └── security.py    # Security utilities
│   │   ├── 📂 db/
│   │   │   ├── database.py    # SQLAlchemy setup
│   │   │   └── supabase.py    # Supabase client
│   │   ├── 📂 models/         # SQLAlchemy models
│   │   └── 📂 schemas/        # Pydantic schemas
│   ├── 📂 scripts/            # Utility scripts
│   ├── requirements.txt       # Python dependencies
│   └── alembic.ini           # Alembic configuration
│
├── 📂 src/                    # React Frontend
│   ├── 📂 assets/            # Static assets
│   │   ├── categories/       # Category images
│   │   └── products/         # Product images
│   ├── 📂 components/
│   │   ├── 📂 common/        # Reusable components
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── 📂 home/          # Homepage sections
│   │   │   ├── HeroSection/
│   │   │   ├── CategoryShowcase/
│   │   │   ├── FeaturedProducts/
│   │   │   ├── WhyChooseUs/
│   │   │   ├── RepairHighlight/
│   │   │   └── StorePresence/
│   │   └── 📂 layout/        # Layout components
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       └── MobileNav.jsx
│   ├── 📂 context/           # React Context
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── 📂 hooks/             # Custom hooks
│   ├── 📂 pages/             # Page components
│   │   ├── HomePage.jsx
│   │   ├── ShopPage.jsx
│   │   ├── ProductPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── RepairPage.jsx
│   │   ├── SparePartsPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── AccountPage.jsx
│   │   ├── AboutPage.jsx
│   │   └── ContactPage.jsx
│   ├── 📂 services/          # API services
│   │   ├── api.js            # Backend API calls
│   │   └── supabase.js       # Supabase client
│   ├── App.jsx               # Root component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
│
├── 📂 public/                # Static public files
├── index.html                # HTML entry point
├── vite.config.js            # Vite configuration
├── eslint.config.js          # ESLint configuration
├── package.json              # Frontend dependencies
└── README.md                 # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **Supabase Account** (free tier works)

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ecommerce-website.git
   cd ecommerce-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file in root directory
   cp .env.example .env
   ```
   
   Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   .\venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   ```
   
   Add your credentials:
   ```env
   ENVIRONMENT=development
   DEBUG=True
   
   # Supabase
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret
   
   # Database
   DATABASE_URL=postgresql+asyncpg://user:password@host:5432/database
   
   # CORS
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   
   # Security
   SECRET_KEY=your-secret-key-change-in-production
   ```

5. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

6. **Start the backend server**
   ```bash
   uvicorn app.main:app --reload
   ```
   
   The API will be available at `http://localhost:8000`
   
   - API Documentation: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

---

## ⚠️ Troubleshooting: IPv4 / IPv6 Connection Issues

If you encounter database connection issues, it's likely due to **IPv4 vs IPv6 compatibility** with Supabase.

### Common Symptoms:
- `Connection refused` errors
- `Timeout` when connecting to database
- Backend fails to start with database errors

### Solutions:

1. **Check your Supabase connection string**
   - Go to Supabase Dashboard → Settings → Database
   - Use the **Connection String** for your network type
   - Some ISPs only support IPv4, others prefer IPv6

2. **Force IPv4 in your connection**
   ```
   # Instead of using the hostname, try the direct IPv4 address
   # Find it in Supabase Dashboard → Settings → Database → Connection Info
   ```

3. **Update your DATABASE_URL**
   ```env
   # If using IPv6 causes issues, check "Use connection pooling" in Supabase
   # and use the pooler connection string instead
   DATABASE_URL=postgresql+asyncpg://postgres:password@aws-0-region.pooler.supabase.com:5432/postgres
   ```

4. **Windows Users**
   - Open Command Prompt as Administrator
   - Run: `netsh interface ipv6 show prefixpolicies`
   - If IPv6 is preferred, you may need to adjust or use IPv4 explicitly

5. **Test your connection**
   ```bash
   # Test if you can reach Supabase
   ping db.your-project-id.supabase.co
   ```

> 💡 **Tip**: Supabase's connection pooler (port 6543) often resolves these issues.

---

## 🔐 Environment Variables

### Frontend (`.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_API_BASE_URL` | Backend API base URL | ✅ |

### Backend (`.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `ENVIRONMENT` | `development` or `production` | ✅ |
| `DEBUG` | Enable debug mode | ❌ |
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | ✅ |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | ✅ |
| `SECRET_KEY` | Application secret key | ✅ |

---

## 📚 API Documentation

When running in development mode, API documentation is available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Authentication** |||
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login with email/password |
| POST | `/api/v1/auth/google` | Login with Google |
| POST | `/api/v1/auth/logout` | Logout user |
| **Users** |||
| GET | `/api/v1/users/me` | Get current user profile |
| PUT | `/api/v1/users/me` | Update user profile |
| **Products** |||
| GET | `/api/v1/products` | List products (with filters) |
| GET | `/api/v1/products/{id}` | Get product details |
| GET | `/api/v1/products/categories` | List categories |
| **Orders** |||
| POST | `/api/v1/orders` | Create new order |
| GET | `/api/v1/orders` | List user orders |
| GET | `/api/v1/orders/{id}` | Get order details |
| **Pre-bookings** |||
| POST | `/api/v1/prebookings` | Create pre-booking |
| GET | `/api/v1/prebookings` | List user pre-bookings |
| **Repairs** |||
| POST | `/api/v1/repairs` | Submit repair inquiry |
| GET | `/api/v1/repairs` | List repair requests |

---

## 📸 Screenshots

*Screenshots coming soon...*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License with Attribution Requirement**.

You are free to use this code as a starting point for your own e-commerce website, but you **must give credit** to this repository. This can be done by:

- Adding a credit line in your website footer
- Mentioning the original repo in your About/Credits page
- Referencing this repo in your project's README

**You cannot claim this code as entirely your own original work.**

See the [LICENSE](LICENSE) file for full details.

---

## 👨‍💻 Author

**E-Commerce Website Contributors**

- Website: [Coming Soon]
- Email: [Contact Email]

---

<p align="center">Made with ❤️ in India</p>
