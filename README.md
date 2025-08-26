
# Idea Manager API

A modern, scalable FastAPI application for managing and ranking innovative ideas. Production-ready with authentication, email flows, structured logging, Docker, and Alembic migrations.

## 🚀 Features

### Core Functionality
- **CRUD Operations**: Create, read, update, and delete ideas
- **Smart Scoring System**: Automatic idea scoring based on scalability, ease of build, AI usage, and complexity
- **Advanced Filtering**: Filter ideas by AI usage, score range, and text search
- **Pagination & Sorting**: Efficient data retrieval with customizable sorting options

### User & Admin
- **Authentication (JWT)**: Register, login, and get current user (`/auth/*`)
- **Profile**: Update profile and change password
- **Email Verification**: Sign-up verification token flow
- **Password Reset**: Request reset + set new password by token
- **Admin Users**: List, update, and delete users (with safeguards to prevent self-deletion or removing own superuser role)

### Technical Features
- **RESTful API**: Clean, documented endpoints with OpenAPI/Swagger
- **Database Migrations**: Alembic for schema version control
- **Structured Logging**: Color-coded logs with request tracing and error handling
- **Health Checks**: Built-in health monitoring endpoints
- **Containerized**: Docker and Docker Compose for consistent environments
- **Hot Reload**: Development mode with live code reloading
 - **Email (SendGrid)**: Real email delivery when configured; safe dev fallback logs messages

## 🛠 Tech Stack

- **Backend**: Python 3.13, FastAPI 0.116.1
- **Database**: PostgreSQL 17.5 with AsyncPG
- **ORM**: SQLAlchemy 2.0 with async support
- **Migrations**: Alembic 1.16.4
- **Validation**: Pydantic 2.11.7
- **Containerization**: Docker & Docker Compose
- **Logging**: Custom structured logging with colorlog
 - **Email**: SendGrid (optional in dev)

## 📋 Prerequisites

- Docker and Docker Compose
- Python 3.10+ (for local development)
- Git

## 🚦 Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/2bTwist/Idea-Manager.git
   cd Idea-Manager
   ```

2. **Start the application:**
   ```bash
   docker compose up --build
   ```

3. **Access the API:**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health/

4. (Optional) **Seed an admin user for testing:**
   ```bash
   docker compose exec app python -m app.scripts.seed
   ```

### Option 2: Local Development

1. **Clone and setup environment:**
   ```bash
   git clone https://github.com/2bTwist/Idea-Manager.git
   cd Idea-Manager
   python -m venv venv
   
   # Windows
   .\venv\Scripts\activate
   
   # macOS/Linux  
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start PostgreSQL (via Docker):**
   ```bash
   docker compose up db -d
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local to use localhost instead of db
   ```

5. **Run migrations and start server:**
   ```bash
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

## 📁 Project Structure

```
idea-manager/
├── app/
│   ├── api/
│   │   ├── deps.py              # Dependency injection
│   │   ├── middleware.py        # Custom middleware
│   │   └── routers/
│   │       ├── health.py        # Health check endpoints
│   │       ├── ideas.py         # Ideas CRUD endpoints
│   │       ├── auth.py          # Auth, profile, password reset/verify
│   │       └── admin_users.py   # Admin-only user management
│   ├── core/
│   │   ├── config.py            # Application settings
│   │   ├── tokens.py            # Token helpers (hashing)
│   │   └── logging.py           # Logging configuration
│   ├── db/
│   │   ├── base.py              # Database base classes
│   │   └── session.py           # Database session management
│   ├── models/
│   │   ├── idea.py              # Idea model
│   │   ├── user.py              # User model
│   │   ├── email_verification.py# Email verification token
│   │   └── password_reset.py    # Password reset token
│   ├── schemas/
│   │   ├── idea.py              # Idea schemas
│   │   └── user.py              # User/auth schemas
│   ├── services/
│   │   ├── ideas.py             # Ideas business logic
│   │   ├── users.py             # Users/auth business logic
│   │   └── email.py             # Email sending (SendGrid/dev)
│   ├── scripts/
│   │   └── seed.py              # Dev seeding (admin user)
│   └── main.py                  # Application entry point
├── migrations/                  # Alembic database migrations
├── docker-compose.yml          # Multi-container Docker setup
├── Dockerfile                  # Container image definition
├── requirements.txt            # Python dependencies
├── alembic.ini                 # Migration configuration
└── .env                        # Environment variables
```

## 🎯 API Endpoints

### Ideas Management
- `GET /ideas/` - List ideas with filtering and pagination
- `POST /ideas/` - Create a new idea
- `GET /ideas/{id}` - Get a specific idea
- `PUT /ideas/{id}` - Update an idea
- `DELETE /ideas/{id}` - Delete an idea

### Auth & Profile
- `POST /auth/register` - Register a new user
- `POST /auth/token` - Login (OAuth2 password flow), returns JWT
- `GET /auth/me` - Current user
- `PATCH /auth/me` - Update profile (full_name)
- `POST /auth/change-password` - Change password (requires current password)

### Email Verification
- `POST /auth/request-verify` - Request verification email (always 200)
- `POST /auth/verify-email` - Verify email by token
- `GET /auth/tokens/verify/validate` - Validate verify token (dev/UX helper)

### Password Reset
- `POST /auth/forgot-password` - Request password reset (always 200)
- `POST /auth/reset-password` - Reset by token
- `GET /auth/tokens/reset/validate` - Validate reset token (dev/UX helper)

### Admin (Superuser)
- `GET /admin/users/` - List users (with paging/filter)
- `PATCH /admin/users/{user_id}` - Update user (is_active, is_superuser)
- `DELETE /admin/users/{user_id}` - Delete user (cannot delete self)

### System
- `GET /` - API information and health
- `GET /health/` - Detailed health check
- `GET /docs` - Interactive API documentation

### Query Parameters
- `limit` & `offset` - Pagination
- `sort` - Sort by `created_at` or `score`
- `order` - Sort direction (`asc` or `desc`)
- `q` - Text search in title/description
- `uses_ai` - Filter by AI usage
- `min_score` & `max_score` - Score range filtering

## 🔧 Environment Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql+asyncpg://ideauser:ideapass@db:5432/ideadb

# Application
APP_ENV=dev                 # dev or production
LOG_LEVEL=INFO              # DEBUG, INFO, WARNING, ERROR
SECRET_KEY=change-this      # used for JWT signing
ACCESS_TOKEN_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
BACKEND_CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# URLs (used in emails/links)
EXTERNAL_BASE_URL=http://localhost:8000
# FRONTEND_BASE_URL=http://localhost:5173      # optional; used for auth links

# Email (optional; if not provided, emails are logged in dev)
EMAIL_ENABLED=false
SENDGRID_API_KEY=
MAIL_FROM=
MAIL_FROM_NAME=Idea Manager

# Scoring Weights (optional)
SCORE_W_SCALABILITY=0.35
SCORE_W_EASE=0.25
SCORE_W_AI_FLAG=0.10
SCORE_W_AI_COMPLEX=0.30
```

### Development vs Production

**Development Mode** (`APP_ENV=dev`):
- Hot reload enabled
- Detailed logging
- Volume mounting for live code changes

**Production Mode** (`APP_ENV=production`):
- Multiple workers
- Optimized logging
- Security hardening

## 📊 Idea Scoring System

Ideas are automatically scored based on:
- **Scalability** (35%): Growth potential
- **Ease to Build** (25%): Implementation difficulty
- **AI Flag** (10%): Uses AI technology
- **AI Complexity** (30%): AI implementation complexity

Score range: -1.25 to 5.0 (higher is better)

## 🔍 Development

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

When running alembic locally, use `localhost` in `DATABASE_URL`.
Inside Docker, use `db` (service name). EntryPoint applies `alembic upgrade head` on startup.

### Testing the API
```bash
# Create an idea
curl -X POST "http://localhost:8000/ideas/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Recipe App",
    "description": "Suggests recipes from fridge items",
    "scalability": 4,
    "ease_to_build": 3,
    "uses_ai": true,
    "ai_complexity": 2
  }'

# List ideas
curl "http://localhost:8000/ideas/?sort=score&order=desc"
```

### Logs and Monitoring
- Structured JSON logs in production
- Color-coded logs in development
- Request tracing with unique IDs
- Health check endpoints for monitoring

## 🐳 Docker Configuration

### Services
- **app**: FastAPI application (port 8000)
- **db**: PostgreSQL database (port 5432 → 5432)

### Volumes
- `pgdata`: Persistent database storage
- `.:/app`: Live code mounting (development)

### Common Docker commands
```bash
# Stop containers
docker compose down

# Rebuild images with latest changes
docker compose up --build -d

# Rebuild clean (no cache)
docker compose build --no-cache && docker compose up -d

# View logs
docker compose logs -f app
```

## 🔮 Future Enhancements

### Short Term
- [X] User authentication and authorization
- [ ] Idea comments and voting system
- [X] Tags and categories
- [ ] API rate limiting

### Medium Term
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Export functionality
- [ ] Full-text search with Elasticsearch

### Long Term
- [ ] Frontend web application
- [ ] Mobile app
- [ ] AI-powered idea suggestions
- [ ] Social features and collaboration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built as a learning project to explore modern FastAPI development practices, containerization, and API design patterns.

---

**Author**: [2bTwist](https://github.com/2bTwist)  
**Project Link**: [https://github.com/2bTwist/Idea-Manager](https://github.com/2bTwist/Idea-Manager)