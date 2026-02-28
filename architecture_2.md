# Sticky Notes Pro - Updated Architecture

This document revisits the high–level design of the Sticky Notes To‑Do application with additional details gleaned from the actual source code. It is meant to help students or reviewers understand how the pieces fit together at a glance.

## 1. Overview
The system is a single‑page web app offering personal sticky note management. The frontend runs entirely in the browser (HTML/CSS/JS) and communicates with a Python FastAPI backend over a simple JSON REST API. User data is stored in a local SQLite database via SQLAlchemy.

## 2. Tech Stack
* **Backend**: FastAPI (Python 3.12) – provides API endpoints, dependency injection, and automatic OpenAPI documentation.
* **Database**: SQLite (file `sticky_app.db` by default) for ease of development; configured through SQLAlchemy engine.
* **ORM**: SQLAlchemy 2.0 with declarative base.
* **Validation/Serialization**: Pydantic models for request/response schemas and settings.
* **Authentication**: JWT tokens (HS256) issued by FastAPI endpoints; passwords hashed with bcrypt via `passlib`.
* **Frontend**: Vanilla HTML, TailwindCSS (via CDN), Font‑Awesome, and plain JavaScript.
  * SortableJS enables drag‑and‑drop reordering.
* **State**: Browser `localStorage` holds the JWT and user preferences (theme, calendar month).
* **Deployment/Dev**: Run with `uvicorn` from `main.py`.

> _Note:_ the original `ARCHITECTURE.md` mentioned PWA features (service worker, manifest). In the repository there is no service worker or manifest file. The HTML includes style and script only; offline support is limited to `localStorage` caching of the auth token and notes.

## 3. Directory Layout
```
project-root/
├── main.py                   # FastAPI application factory & health check
├── requirements.txt
├── .env/.gitignore
└── src/                      # All application source code
    ├── api/                  # HTTP controllers (FastAPI routers)
    │   ├── dependencies.py   # DI helpers (auth + db session)
    │   └── v1/
    │       ├── users.py      # /register, /login, /me
    │       └── notes.py      # CRUD /notes endpoints
    ├── core/                 # Framework utilities
    │   ├── config.py         # Settings via Pydantic BaseSettings
    │   ├── security.py       # JWT & password helpers
    │   ├── logger.py         # Logging setup
    │   └── exceptions.py     # Custom HTTP exceptions
    ├── db/                   # Database layer
    │   ├── database.py       # SQLAlchemy engine/session/base
    │   └── models.py         # User & Note ORM models
    ├── schemas/              # Pydantic models for request/response
    │   ├── user_schema.py
    │   └── note_schema.py
    ├── services/             # Business logic (use cases)
    │   ├── user_service.py   # registration & auth lookup
    │   └── note_service.py   # note CRUD + ordering
    └── static/               # Frontend assets served statically
        ├── index.html        # Single‑page application
        ├── app.js            # All client‑side JS logic
        └── style.css         # Custom CSS enhancements
```

## 4. Backend Flow
1. **Startup** in `main.py` creates the FastAPI app, configures CORS, logs, and automatically creates tables via `Base.metadata.create_all()`.
2. Requests use dependency injection:
   * `get_db` yields a SQLAlchemy session.
   * `get_current_user` decodes JWT, fetches the user, or raises `CredentialsException` defined in `core/exceptions.py`.
3. **Users API** handled by `api/v1/users.py`:
   * POST `/register` uses `user_service.create_user` after validating username uniqueness.
   * POST `/login` authenticates user, returns access token.
   * GET `/me` returns the current authenticated user.
4. **Notes API** in `api/v1/notes.py` is fully protected by JWT dependency. It accepts and returns Pydantic models and delegates persistence logic to `note_service`.
5. Service layer (`services`) contains thin business logic, performing queries and updates and returning ORM instances. All data modification is followed by `.commit()` and `.refresh()` to return up‑to‑date objects.
6. Models (`db/models.py`) define relationships and fields; `Note.position_index` supports manual ordering.

## 5. Frontend Overview
1. Single‑page app loaded from `src/static/index.html` (usually served by a simple static file server or by mounting `/static`).
2. **State variables** are managed in plain JS:
   * `authToken` stored in `localStorage` and included in every API call.
   * `globalNotes` caches the latest list of notes fetched from backend.
   * `currentMode`/`currentView` track UI state for modals and navigation.
3. **Routing** is manual: showing/hiding sections based on `navigateTo()`.
4. **Authentication**: modal popup collects credentials, hitting `/users/register` or `/users/login`. Successful login updates UI and stores token.
5. **CRUD operations** use a shared `apiCall()` wrapper which attaches the `Authorization` header and handles 401 responses.
6. **Drag‑and‑drop** is powered by SortableJS; on `onEnd` the client updates each note’s `position_index` via sequential PUT requests.
7. **Calendar** is rendered client‑side to display due dates and completion status in a month view.
8. Theme toggling persists to `localStorage` and uses a class on `<html>`.

## 6. Testing
No project‑specific unit tests are present. The `requirements.txt` contains development dependencies; one could add a `/tests` directory with pytest fixtures referencing `app` from `main.py` and an in‑memory SQLite DB.

---

This updated architecture file should serve as a concise reference for understanding how the backend and frontend communicate, where logic lives, and how state flows through the application. It can be paired with the more general `ARCHITECTURE.md` or used on its own during code review or study.