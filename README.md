LPO Tracker
A full-stack web application for managing purchase requisitions and Local Purchase Orders (LPOs). Built with React, Tailwind CSS & Vite on the frontend, Flask & SQLAlchemy on the backend, and JWT for authentication.

🚀 Features
User

Sign in/out

Create requisitions (select products + quantities + notes)

View own requisitions (Pending / Approved / Rejected)

Recall (delete) pending requisitions

View LPOs assigned to their requisitions

Admin

Sign in/out

Dashboard with KPI cards and quick-links

Manage users (CRUD + password resets + inline editing)

Approve/reject requisitions

Create LPOs for approved requisitions (assign supplier + unit prices)

View & update LPO status (Pending / Delivered / Not Delivered)

📦 Tech Stack
Frontend:

React 17, React Router v6

Vite, Tailwind CSS, React-Toastify, React-Icons

JWT stored in localStorage

Backend:

Flask, Flask-SQLAlchemy, Flask-Migrate

Flask-JWT-Extended for auth

SQLite (dev) / easily swapped for PostgreSQL

CORS enabled for the Vite dev server

⚙️ Getting Started
Prerequisites
Node.js ≥ 16

Python ≥ 3.8

pipenv or virtualenv (optional but recommended)

Backend
bash
Copy code
cd server
pip install 
export FLASK_APP=app.py
flask db upgrade      # Apply migrations
flask run             # Starts API @ http://127.0.0.1:5000


Frontend
bash
Copy code
cd client
npm install
npm run dev           # Starts Vite @ http://localhost:5174
Your browser should open http://localhost:5174 and show the Sign-In page.


🔗 API Endpoints (Summary)
Auth
POST /login
Request: { email, password }
Response: { access_token }

Users (Admin-only)
GET /users

POST /users

PUT /users/:id

PUT /users/:id/password

Requisitions
GET /requisitions?status=

POST /requisitions

PUT /requisitions/:id (Admin-only)

DELETE /requisitions/:id

LPOs
GET /lpos?sort=

POST /lpos

PUT /lpos/:id

Products & Suppliers
GET /products / POST /products / PUT /products/:id / DELETE /products/:id

GET /suppliers / POST /suppliers / PUT /suppliers/:id / DELETE /suppliers/:id



