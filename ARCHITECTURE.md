# Project: Sticky Note To-Do App

## 1. Overview
A professional, smooth, and minimalist to-do application styled as digital sticky notes. The app features user authentication, drag-and-drop reordering, color-coded notes, and basic offline capabilities via Progressive Web App (PWA) techniques. 

## 2. Tech Stack
* **Backend:** FastAPI (Python)
* **Database:** SQLite 
* **ORM:** SQLAlchemy
* **Data Validation:** Pydantic
* **Authentication:** JWT (JSON Web Tokens) with password hashing (bcrypt)
* **Frontend:** Vanilla HTML, CSS (Tailwind via CDN for modern UI), Vanilla JavaScript
* **Frontend Libraries:** SortableJS (for smooth drag-and-drop)
* **Offline Support:** Service Workers, browser `localStorage`, and a `manifest.json` file.

## 3. Core Features
* **Account Management:** Users can register and log in to their private workspace.
* **CRUD Operations:** Create, Read, Update, and Delete sticky notes.
* **Customization:** Assign different background colors to notes for categorization.
* **Drag and Drop:** Freely reorder notes on the screen; the new order persists across sessions.
* **Offline Mode:** App loads without internet. New notes/edits are saved locally and synced to the backend once the connection is restored.

## 4. File & Directory Structure
sticky_app/
├── src/                        # All application code lives here
│   ├── api/                    # API Routers (The "Controllers")
│   │   ├── dependencies.py     # Dependency injection (e.g., get_db, get_current_user)
│   │   └── v1/                 # API Versioning
│   │       ├── users.py
│   │       └── notes.py
│   ├── core/                   # App-wide configurations
│   │   ├── config.py           # Environment variables (Pydantic BaseSettings)
│   │   ├── exceptions.py       # Custom global exception handlers
│   │   ├── logger.py           # Centralized logging configuration
│   │   └── security.py         # JWT generation and password hashing
│   ├── db/                     # Database layer
│   │   ├── database.py         # SQLAlchemy engine and session maker
│   │   └── models/             # SQLAlchemy ORM models (Users, Notes)
│   ├── schemas/                # Pydantic models (Data validation in/out)
│   │   ├── user_schema.py
│   │   └── note_schema.py
│   └── services/               # Business logic (The "Heavy Lifting")
│       ├── user_service.py     # Logic for registering/authenticating
│       └── note_service.py     # Logic for CRUD and drag-and-drop ordering
├── tests/                      # Unit and integration tests
├── .env                        # Secret environment variables (Never committed)
├── .gitignore
├── requirements.txt
└── main.py                     # Minimal entry point that wires it all together

