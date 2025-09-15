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
.
├─ server.js
├─ package.json
├─ .gitignore
├─ /public
│  ├─ index.html
│  ├─ admin.html
│  ├─ tenant.html
│  ├─ tenants.html
│  ├─ properties.html
│  ├─ chat.html
│  ├─ /css
│  └─ /js
└─ /src
   ├─ /config
   │  └─ db.js
   ├─ /middleware
   │  └─ auth.js
   ├─ /models
   │  ├─ User.js
   │  ├─ Customer.js
   │  └─ Property.js
   ├─ /controllers
   │  └─ propertyController.js
   └─ /routes
      ├─ auth.js
      ├─ customers.js
      └─ propertyRoutes.js
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

### Auth (`/api/auth`)
- `POST /register` — create user (role: `Admin` or `Tenant`), stores hashed password
- `POST /login` — returns JWT (`Authorization: Bearer <token>`)

### Customers (`/api/customers`) — protected
- Admin-only examples:
  - `POST /` — create customer
  - `GET /` — list customers (supports soft-delete flag in schema)
  - `PUT /:id`, `DELETE /:id` — update / delete
- Tenant self-service examples:
  - `GET /me` — fetch the logged-in tenant’s record
  - `POST /me/mark-paid` — mark current month as paid

*Middleware used:* `authRequired` and `requireRole(...)` from `src/middleware/auth.js`.

### Properties (`/api/properties`) — protected
- `GET /` — list (filters: `?q=<text>&status=AVAILABLE|OCCUPIED`)
- `GET /:id` — fetch one
- `POST /` — create (admin)
- `PUT /:id` — update (admin)
- `DELETE /:id` — delete (admin)

> Note: `src/routes/propertyRoutes.js` currently includes temporary pass-through middlewares (`requireAuth`, `requireAdmin` stubs). Replace them with real ones (like in `middleware/auth.js`) for production.

---

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
