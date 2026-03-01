# Sticky Notes Pro

![Python](https://img.shields.io/badge/python-3.12-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-green) ![SQLite](https://img.shields.io/badge/SQLite-%20-lightgrey)

## LIVE: https://sticky-notes-pro-dun.vercel.app/

**Sticky Notes Pro** is a student‑friendly full‑stack to‑do application built with FastAPI on the backend and vanilla HTML/CSS/JavaScript on the frontend. The interface mimics real sticky notes with drag‑and‑drop ordering and color customization. Users can sign up, log in, and manage personal notes; the backend persists data using SQLAlchemy and JWT‑based authentication.

This README walks you through understanding the entire codebase, running the project locally, and exploring the architecture — perfect for review or learning purposes.

---

## 📌 Features

* User registration and login with password hashing (bcrypt) and JWT tokens
* Create, read, update, delete (CRUD) sticky notes
* Drag‑and‑drop note reordering with SortableJS (order stored server‑side)
* Color‑coded notes and optional due dates
* Monthly calendar view showing scheduled tasks and completion status
* Light/dark theme toggle with preference stored in `localStorage`
* SPA‑style navigation (Landing → Workspace → How it Works → Contact)
* Backend built on FastAPI with automatic OpenAPI docs
* SQLite database via SQLAlchemy (zero configuration for development)

> ⚠️ The original architectural plan mentioned PWA/offline capabilities; in the current code, offline support is limited to caching the auth token and notes in memory. No service worker or manifest file exists.

---

## 🧩 Architecture Overview

An updated architecture document lives in [`architecture_2.md`](./architecture_2.md) and mirrors the folder structure and code you will read.

In brief:

* **Backend**: `src/` contains a modular FastAPI app with `api` routers, `core` utilities, `db` models, `schemas` (Pydantic), and `services` implementing business logic.
* **Frontend**: `src/static/` hosts `index.html`, `app.js`, and `style.css`. All client logic is written in vanilla JS and interacts with the API via `fetch`.

Refer to `architecture_2.md` for diagrams, flow descriptions, and detailed walkthroughs of each component.

---

## 🛠️ Tech Stack

* **Python 3.12** with FastAPI, SQLAlchemy, Pydantic, Passlib, and Uvicorn
* **SQLite** (default, file-based) – changeable via environment variable
* **JavaScript** (ES6+) in the browser, no framework
* **Tailwind CSS** via CDN and Font Awesome for icons
* **SortableJS** for drag‑and‑drop

---

## 🚀 Getting Started

### Prerequisites

* Python 3.10 or newer (3.12 recommended) installed on your machine
* `pip` available for package installation
* (Optional) `virtualenv` or `venv` for isolating dependencies

### Installation

```powershell
# clone the repo
cd "e:\Coding\DEmo Websites\To-DO Sticky app"  # adjust path as needed
python -m venv todo_venv        # create virtual environment
& .\todo_venv\Scripts\Activate.ps1  # activate on Windows PowerShell

pip install --upgrade pip
pip install -r requirements.txt
```

> A sample `.env` file with friendly defaults is not included; settings can be overridden by creating a `.env` in the project root with values described in `src/core/config.py`.

### Running the Server

```powershell
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000/api/v1`. The automatically generated docs are at `http://127.0.0.1:8000/api/v1/openapi.json` (or via Swagger UI when the server is running).

### Serving the Frontend

During development, you can simply open `src/static/index.html` in your browser. Because the frontend uses absolute URLs pointing to `http://127.0.0.1:8000/api/v1`, ensure the backend is running.

For a more realistic setup, serve the `static` folder using a lightweight HTTP server: 

```powershell
# from project root
iisexpress /root:"src/static" /port:5500   # example, or use Python's http.server
python -m http.server -d src/static 5500
```

Then navigate to `http://localhost:5500` in your browser.

---

## 🧠 Understanding the Code

### Backend

* `main.py` – application factory, CORS middleware, router inclusion, health check
* `src/core/config.py` – environment settings with Pydantic. Change `DATABASE_URL` or `SECRET_KEY` here or via `.env`.
* `src/core/security.py` – password hashing and JWT creation/verification helpers.
* `src/db/database.py` – SQLAlchemy engine, session, declarative base, and `get_db` dependency.
* `src/db/models.py` – ORM models for `User` and `Note`, including relationships and ordering field.
* `src/schemas/` – Pydantic schemas for validating inputs and serializing outputs.
* `src/services/` – business logic abstracted away from controllers.
* `src/api/` – FastAPI routers (`users.py` and `notes.py`) that map HTTP requests to service calls. The `dependencies.py` file holds shared dependencies such as `get_current_user`.

### Frontend

* `src/static/index.html` – single page; defines UI components and includes Tailwind, Font Awesome, and SortableJS from CDNs.
* `src/static/app.js` – entire client logic. Sections are clearly commented: theme handling, routing, auth, API calls, rendering, drag‑and‑drop, calendar.
* `src/static/style.css` – custom styles for note cards, scrollbars, and drag effects.

> **Tip for review:** open `app.js` and read the numbered comments (1‑7) to follow the application flow step by step.

### Directory Structure (simplified)

````
├── main.py
├── requirements.txt
└── src
    ├── api
    │   ├── dependencies.py
    │   └── v1
    │       ├── notes.py
    │       └── users.py
    ├── core
    │   ├── config.py
    │   ├── exceptions.py
    │   ├── logger.py
    │   └── security.py
    ├── db
    │   ├── database.py
    │   └── models.py
    ├── schemas
    │   ├── note_schema.py
    │   └── user_schema.py
    ├── services
    │   ├── note_service.py
    │   └── user_service.py
    └── static
        ├── app.js
        ├── index.html
        └── style.css
````

---

## 🧪 Testing

There are currently no unit or integration tests in the repository. To add tests:

1. Create a `tests/` directory at project root.
2. Use `pytest` and `starlette.testclient.TestClient` to instantiate the FastAPI app (`from main import app`).
3. Configure an in‑memory SQLite database (`sqlite:///:memory:`) for isolation.
4. Write tests for services and API endpoints (e.g. registering, logging in, CRUD notes).

Add `pytest` to `requirements.txt` and run `pytest` from the project root to execute tests.

---

## 🧾 API Reference (Quick)

All routes are prefixed with `/api/v1`.

### **User Routes**

| Method | Path            | Description                      | Body/Params                          | Response         |
|--------|-----------------|----------------------------------|--------------------------------------|------------------|
| POST   | `/users/register` | Create a new user                | JSON `{username, password}`          | `UserResponse`   |
| POST   | `/users/login`    | Log in and receive JWT           | form data `username,password`        | `{access_token, token_type}` |
| GET    | `/users/me`       | Get current user (auth required) | Bearer token header                  | `UserResponse`   |

### **Note Routes** (require Authorization header)

| Method | Path          | Description                     | Body Example                                           |
|--------|---------------|---------------------------------|--------------------------------------------------------|
| GET    | `/notes/`     | List all notes for user         | –                                                      |
| POST   | `/notes/`     | Create a new note               | `{content?, due_date?, color_hex?, is_completed?}`     |
| PUT    | `/notes/{id}` | Update an existing note         | any subset of fields allowed by `NoteUpdate` schema    |
| DELETE | `/notes/{id}` | Delete a note                   | –                                                      |

Refer to the Pydantic schemas in `src/schemas` for a complete field listing.

---

## 📚 Learning & Review Tips

* **Trace a request** from `index.html` → `app.js` → `apiCall()` → FastAPI endpoint → service → models → database. Follow the comments in `app.js` and backend service functions for clarity.
* **Experiment** by running the app, registering a user, and creating notes. Inspect network requests in the browser DevTools to see the JSON payloads.
* Use `sqlalchemy`'s `Base.metadata.create_all()` (already called in `main.py`) to regenerate schema if you modify models.
* **Modify** the UI or add a new endpoint to practice full‑stack development: e.g., add a `/notes/search` endpoint or implement offline storage.

---

## 🤝 Contributing

Contributions are welcome! For major changes:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-idea`).
3. Make your changes, add tests, and ensure linting passes.
4. Submit a pull request explaining the motivation and testing steps.

Please keep the code student‑friendly: add comments, write clear function/variable names, and avoid unnecessary complexity.

---

## 📄 License

This project is provided for educational purposes. You may reuse the code for learning and personal use. (No formal license file is included.)

---

Happy reviewing & coding! ✨
