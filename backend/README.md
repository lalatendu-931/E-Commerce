# E-Commerce Website - Backend API

FastAPI backend for E-Commerce Website - A full-stack electronics store with repair services.

## Features

- **Authentication**: User registration, login with email/password and Google (via Supabase)
- **Products & Categories**: Full catalog management with inventory tracking
- **Orders**: Multiple purchase modes (pay online, reserve & pickup)
- **Pre-bookings**: Advance booking for store visits
- **Repair Inquiries**: Service requests for fans, motors, and small appliances
- **Role-based Access**: Customer, Staff, and Admin roles

## Tech Stack

- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Authentication
- **ORM**: SQLAlchemy with async support
- **Migrations**: Alembic
- **Validation**: Pydantic v2

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py          # Dependency injection
│   │   ├── middleware.py    # Custom middleware
│   │   └── routes/          # API route handlers
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── products.py
│   │       ├── orders.py
│   │       ├── prebookings.py
│   │       └── repairs.py
│   ├── core/
│   │   ├── config.py        # Settings management
│   │   ├── logging.py       # Structured logging
│   │   └── security.py      # Security utilities
│   ├── db/
│   │   ├── database.py      # SQLAlchemy setup
│   │   └── supabase.py      # Supabase client
│   ├── models/              # SQLAlchemy models
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── prebooking.py
│   │   └── repair.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── prebooking.py
│   │   ├── repair.py
│   │   └── common.py
│   └── main.py              # Application entry point
├── alembic/                 # Database migrations
├── .env.example             # Environment template
├── requirements.txt         # Python dependencies
└── README.md
```

## Setup

### 1. Prerequisites

- Python 3.11+
- Supabase account with a project created
- PostgreSQL database (provided by Supabase)

### 2. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
ENVIRONMENT=development
DEBUG=true

# Get these from your Supabase project settings
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Database connection string from Supabase
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Frontend URL for CORS
CORS_ORIGINS=http://localhost:5173
```

### 5. Run Database Migrations

```bash
alembic upgrade head
```

### 6. Start the Server

```bash
# Development with auto-reload
uvicorn app.main:app --reload --port 8000

# Or using Python directly
python -m app.main
```

The API will be available at `http://localhost:8000`

## API Documentation

When running in development mode, API documentation is available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/login/google` - Get Google OAuth URL
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users/me` - Get profile
- `PATCH /api/v1/users/me` - Update profile
- `GET /api/v1/users/me/orders` - Order history
- `GET /api/v1/users/me/pre-bookings` - Pre-booking history
- `GET /api/v1/users/me/repair-inquiries` - Repair history

### Products
- `GET /api/v1/products/` - List products (with filters)
- `GET /api/v1/products/{slug}` - Get product details
- `GET /api/v1/products/categories` - List categories
- `GET /api/v1/products/categories/{slug}` - Get category

### Orders
- `POST /api/v1/orders/` - Create order
- `GET /api/v1/orders/` - List my orders
- `GET /api/v1/orders/{order_number}` - Get order details
- `POST /api/v1/orders/{order_number}/cancel` - Cancel order

### Pre-bookings
- `POST /api/v1/pre-bookings/` - Create pre-booking
- `GET /api/v1/pre-bookings/` - List my pre-bookings
- `GET /api/v1/pre-bookings/{booking_number}` - Get details
- `POST /api/v1/pre-bookings/{booking_number}/confirm` - Confirm
- `POST /api/v1/pre-bookings/{booking_number}/cancel` - Cancel

### Repairs
- `GET /api/v1/repairs/services` - List repair services
- `GET /api/v1/repairs/not-repaired` - Items we don't repair
- `POST /api/v1/repairs/` - Submit inquiry
- `GET /api/v1/repairs/` - List my inquiries
- `GET /api/v1/repairs/{inquiry_number}` - Get details

### Admin/Staff Endpoints
All admin endpoints require staff or admin role authentication:
- `GET /api/v1/orders/admin/all` - List all orders
- `PATCH /api/v1/orders/admin/{order_number}/status` - Update order status
- `GET /api/v1/pre-bookings/admin/all` - List all pre-bookings
- `PATCH /api/v1/pre-bookings/admin/{booking_number}/respond` - Respond to booking
- `GET /api/v1/repairs/admin/all` - List all repair inquiries
- `PATCH /api/v1/repairs/admin/{inquiry_number}` - Update repair status

## Security

### Development Mode
- Swagger docs enabled
- Debug mode with detailed errors
- CORS allows configured origins

### Production Mode
- Swagger docs disabled
- Security headers added
- Rate limiting enabled
- Error details hidden

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ENVIRONMENT` | `development` or `production` | Yes |
| `DEBUG` | Enable debug mode | No |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `SUPABASE_JWT_SECRET` | JWT secret for token verification | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `CORS_ORIGINS` | Comma-separated allowed origins | Yes |
| `SECRET_KEY` | Application secret key | Yes (prod) |
| `RATE_LIMIT_PER_MINUTE` | Rate limit per IP | No |

## Deployment

### Docker (Recommended)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Azure App Service

1. Create an App Service with Python 3.11
2. Configure environment variables in App Service Configuration
3. Deploy using Azure CLI or GitHub Actions

## License

MIT License with Attribution - See root LICENSE file
