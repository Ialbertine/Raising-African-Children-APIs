Raising African Children APIs
============================

Backend API built with Express, Sequelize, and PostgreSQL.

Getting Started (Local)
-----------------------
1) Install dependencies  
```bash
npm install
```
2) Configure `.env` (example)  
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=raising_african_children_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=change-me
FRONTEND_URL=http://localhost:3000
```
3) Create the database (manually via psql or createdb).  
4) Migrate tables  
```bash
npm run db:migrate
```
5) Create admin user  
```bash
node src/config/createAdmin.js
```
6) Start the server  
```bash
npm start
```
Health check: `GET http://localhost:5000/health`

Deploying to Railway
--------------------
See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed step-by-step instructions.

**Quick Steps:**
1. Create a new Railway project and connect your GitHub repo
2. Add a PostgreSQL database service (Railway provides `DATABASE_URL` automatically)
3. Set environment variables in Railway dashboard (see `.env.example` for reference)
4. Railway will auto-deploy using the `Dockerfile`
5. After deployment, run migrations via Railway shell:
   ```bash
   npm run db:migrate
   node src/config/createAdmin.js
   ```
6. Verify: `GET https://your-app.railway.app/health`

**Note:** Railway automatically provides `DATABASE_URL` - your code already supports this!

Deploying to Render (quick steps)
---------------------------------
1) Create a Postgres instance on Render (use the Internal host).  
2) In the Web Service → Environment, set:
```
DB_HOST=<render internal host>
DB_PORT=<port, usually 5432>
DB_NAME=<db name>
DB_USER=<db user>
DB_PASSWORD=<db password>
NODE_ENV=production
JWT_SECRET=<strong secret>
FRONTEND_URL=<your frontend origin>
```
3) Build command: `npm install`  
   Start command: `npm start`  
4) After first deploy, open Shell and run:
```
npm run db:migrate
node src/config/createAdmin.js
```
5) Verify health: `GET https://<service-url>/health`

Key Scripts
-----------
- `npm start` — start server  
- `npm run dev` — start with nodemon  
- `npm run db:migrate` — sync models to DB

Main Endpoints
--------------
- `GET /health` — service status  
- `GET /api` — API info  
- Auth: `POST /api/auth/login`, `GET /api/auth/me`, password reset flows  
- Blogs: `GET/POST/PUT/DELETE /api/blogs`  
- Contacts: `POST /api/contacts`  
- Testimonials: `GET/POST/PUT/DELETE /api/testimonials`

Notes
-----
- `/uploads` serves static files; on Render use a Persistent Disk or external object storage for durability.  
- Rate limiting, CORS, and helmet are enabled in `server.js`.  
- Email sending uses SendGrid if `SENDGRID_API_KEY` and `EMAIL_FROM` are set.
