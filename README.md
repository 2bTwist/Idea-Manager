
# Idea-Manager

Idea-Manager is a well-structured CRUD Backend API built with FastAPI, designed to help users manage and rank their ideas. This project serves as a learning platform to improve my software engineering skills and best practices.

## Features
- Create, Read, Update, and Delete ideas
- User authentication (planned)
- Idea ranking system (planned)
- RESTful API design
- Extensible for future frontend integration

## Tech Stack
- Python 3.x
- FastAPI
- PostgreSQL (via Docker)
- Docker & Docker Compose

## Getting Started
1. Clone the repository:
	```sh
	git clone https://github.com/2bTwist/Idea-Manager.git
	cd Idea-Manager
	```
2. Create and activate a virtual environment:
	```sh
	python -m venv venv
	# On Windows
	.\venv\Scripts\activate
	# On macOS/Linux
	source venv/bin/activate
	```
3. Install dependencies:
	```sh
	pip install -r requirements.txt
	```
4. Start the database and backend (requires Docker):
	```sh
	docker compose up -d
	uvicorn app.main:app --reload
	```

## Project Structure
```
app/
  ├── api/
  ├── core/
  ├── db/
  ├── models/
  ├── schemas/
  └── services/
```

## Future Plans
- Add user authentication and authorization
- Build a frontend for idea management
- Implement idea ranking and analytics
- Deploy to cloud platforms 

---
This project is a personal learning exercise. Contributions and suggestions are welcome!