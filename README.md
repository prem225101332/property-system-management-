# Property Management System (PMS)

A simple Property Management System with a Node.js + Express backend, MongoDB (via Mongoose), and static HTML/CSS/JS pages for the UI. Environment variables are managed with `dotenv`, authentication uses JWT and password hashing with `bcryptjs`. The app serves static pages from `/public` and exposes REST APIs for auth, customers (tenants), and properties.

> This README is generated directly from the project you shared. It only documents what exists in the repository.

---

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Server:** Express
- **Database:** MongoDB with **Mongoose**
- **Auth:** JWT (`jsonwebtoken`), password hashing with `bcryptjs`
- **Config:** `.env` via `dotenv`
- **Logs/CORS:** `morgan`, `cors`
- **Frontend:** Static **HTML, CSS, JavaScript** (with **Font Awesome** icons & Google Fonts).  
- **Build/Preview:** Vite (present for dev/preview; static assets are also served by Express)



---

## Project Structure

```
├── Client-Side Files
│   ├── CSS/
│   │   ├── admin.css
│   │   ├── dashboard.css
│   │   ├── style.css
│   │   └── tenant.css
│   ├── JS/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── common.js
│   │   ├── dashboard.js
│   │   ├── data-manager.js
│   │   ├── properties.js
│   │   ├── script.js
│   │   ├── tenant.js
│   │   └── tenants.js
│   └── HTML Pages/
│       ├── addtenant.html
│       ├── admin-issues.html
│       ├── admin.html
│       ├── chat.html
│       ├── index.html
│       ├── properties.html
│       ├── tenant-issues.html
│       ├── tenant-property.html
│       └── tenantdashboard.html
└── Server-Side Files
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── addtenantController.js
    │   ├── issueController.js
    │   └── propertyController.js
    ├── middleware/
    │   └── auth.js
    ├── models/
    │   ├── Addtenant.js
    │   ├── Customer.js
    │   ├── Issue.js
    │   ├── Property.js
    │   └── User.js
        └── Message.js
    ├── routes/
    │   ├── addTenantRoutes.js
    │   ├── auth.js
    │   ├── customers.js
    │   ├── issueRoutes.js
    │   └── propertyRoutes.js
    ├── utils/
    │   └── auth.js
    ├── package.json
    ├── package-lock.json
    ├── server.js
    └── README.md
```

---

## Prerequisites

- Node.js 18+
- A MongoDB connection string (Atlas or local)

---

## Setup & Run

1) **Install dependencies**
```bash
npm install
```

2) **Create a `.env` file** in the project root:
```bash
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
PORT=3000
```

3) **Start the server**

- Using Node:
```bash
node server.js
```
- Or, to preview static assets with Vite (optional):
```bash
npm run dev          # dev server
npm run build        # build
npm run preview      # preview built assets
```

> The Express app serves static files from `/public`. Visit:  
> - http://localhost:3000/ → `index.html` (Auth page)  
> - http://localhost:3000/admin → `admin.html`  
> - http://localhost:3000/customer → `tenant.html`  
> - http://localhost:3000/properties → `properties.html`  
> - http://localhost:3000/tenants → `tenants.html`  
> - http://localhost:3000/chat → `chat.html`  

---

## API Overview

API Endpoints

Authentication

POST /api/auth/login - User login
POST /api/auth/register - User registration
POST /api/auth/logout - User logout
Properties

GET /api/properties - Get all properties
POST /api/properties - Create new property
PUT /api/properties/:id - Update property
DELETE /api/properties/:id - Delete property
Tenants

GET /api/tenants - Get all tenants
POST /api/tenants - Add new tenant
PUT /api/tenants/:id - Update tenant
DELETE /api/tenants/:id - Remove tenant
Issues

GET /api/issues - Get all issues
POST /api/issues - Create new issue
PUT /api/issues/:id - Update issue status
DELETE /api/issues/:id - Delete issue


---


## Static Pages

Express serves HTML at:
- `/`
- `/admin`
- `/customer`
- `/properties`
- `/tenants`
- `/chat`
- `/addtenant`
- `/tenant-issues`
- `/api/tenants`
- `/api/admin`

## Postman Workflow (quick)

1. `POST /api/auth/register` (Admin) → `POST /api/auth/login` → copy `token`
2. Properties CRUD at `/api/properties` (set Bearer token)
3. Upload images: `POST /api/properties/:id/images` (form-data key `images`)
4. Tenants CRUD at `/api/addtenants`
5. Issues CRUD at `/api/issues`

## Scripts

From `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```
There is no `"start"` script; run `node server.js` to launch Express.

---

## Environment & Git

- `.gitignore` already excludes `node_modules/`, `.env`, logs, etc.
- **Do not commit `.env`.**

---

### Routes in `server.js`

- `app.use('/api/auth', authRoutes)`
- `app.use('/api/customers', customerRoutes)`
- `app.use('/api/properties', propertyRoutes)`
- `app.use('/api/issues', issueRoutes)`
- `app.use('/api', addTenantRoutes)`
- `app.use('/api/messages', messageRoutes)`
- `app.use('/api', authMeRoutes)`

🧪 Testing

This project includes a complete test suite covering unit tests, integration tests, and Socket.IO tests.

📦 Tools Used
	•	Jest – Test runner (configured for ES Modules)
	•	Supertest – For HTTP integration tests
	•	mongodb-memory-server – Spins up an in-memory MongoDB for tests (no real DB needed)
	•	Socket.IO Client/Server – For real-time communication tests

⸻

✅ Unit Tests

Unit tests verify the core logic of individual modules in isolation:
	•	User model
	•	Role enum validation (Admin, Tenant)
	•	Password hashing and comparePassword with bcrypt
	•	Property model
	•	Required fields (title, rent)
	•	Default values and status enum validation
	•	AddTenant model
	•	Requires a user reference
	•	Status enum validation (paid, unpaid, etc.)
	•	Auth middleware
	•	Rejects missing/invalid JWT tokens
	•	Attaches decoded user to requests on success
	•	Enforces role-based access control (requireRole)

⸻

🔗 Integration Tests

Integration tests validate Express routes working together with the in-memory MongoDB:
	•	Auth routes (/api/auth)
	•	Reject invalid roles during registration
	•	Register & login user, return JWT
	•	Property routes (/api/properties)
	•	Create property
	•	List properties
	•	Tenant routes (/api/addtenants)
	•	List tenants (empty and populated)
	•	Upsert tenant-property assignments

⸻

⚡ Socket.IO Test
	•	Starts a temporary Socket.IO server in-memory
	•	Connects a client via WebSocket
	•	Verifies a ping → pong message exchange
	•	Ensures real-time messaging works correctly


  ▶️ Running the Tests
	1.	Install dev dependencies (once):
  npm i -D jest supertest mongodb-memory-server socket.io-client

  2.	Run the test suite:
  npm test

  	3.	Jest will:
	•	Spin up an in-memory MongoDB
	•	Mount your Express routes in an isolated app
	•	Run all unit + integration + socket tests

## Team

- Durga Reddy
- Akhileshwar Reddy
- Prem Kumar
- Srikar Boske

---

## License

See `LICENSE` in the repository.
nts Specifications (IEEE Std 830-1998).
Materialize CSS framework for the UI components.
Icons from Material Icons.
