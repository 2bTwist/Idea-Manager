
# Idea Manager API

A modern, scalable FastAPI application for managing and ranking innovative ideas. Built with best practices for production-ready development including proper logging, containerization, database migrations, and comprehensive API documentation.

## 🚀 Features

### Core Functionality
- **CRUD Operations**: Create, read, update, and delete ideas
- **Smart Scoring System**: Automatic idea scoring based on scalability, ease of build, AI usage, and complexity
- **Advanced Filtering**: Filter ideas by AI usage, score range, and text search
- **Pagination & Sorting**: Efficient data retrieval with customizable sorting options

### Technical Features
- **RESTful API**: Clean, documented endpoints with OpenAPI/Swagger
- **Database Migrations**: Alembic for schema version control
- **Structured Logging**: Color-coded logs with request tracing and error handling
- **Health Checks**: Built-in health monitoring endpoints
- **Containerized**: Docker and Docker Compose for consistent environments
- **Hot Reload**: Development mode with live code reloading

## 🛠 Tech Stack

- **Backend**: Python 3.13, FastAPI 0.116.1
- **Database**: PostgreSQL 17.5 with AsyncPG
- **ORM**: SQLAlchemy 2.0 with async support
- **Migrations**: Alembic 1.16.4
- **Validation**: Pydantic 2.11.7
- **Containerization**: Docker & Docker Compose
- **Logging**: Custom structured logging with colorlog

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
│   │       └── ideas.py         # Ideas CRUD endpoints
│   ├── core/
│   │   ├── config.py            # Application settings
│   │   └── logging.py           # Logging configuration
│   ├── db/
│   │   ├── base.py              # Database base classes
│   │   └── session.py           # Database session management
│   ├── models/
│   │   └── idea.py              # SQLAlchemy models
│   ├── schemas/
│   │   └── idea.py              # Pydantic schemas
│   ├── services/
│   │   └── ideas.py             # Business logic
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
APP_ENV=development  # or production
LOG_LEVEL=INFO       # DEBUG, INFO, WARNING, ERROR

# Scoring Weights (optional)
SCORE_W_SCALABILITY=0.35
SCORE_W_EASE=0.25
SCORE_W_AI_FLAG=0.10
SCORE_W_AI_COMPLEX=0.30
```

### Development vs Production

**Development Mode** (`APP_ENV=development`):
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