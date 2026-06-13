# UCMS

University Complaint Management System.

UCMS is a role-based complaint workflow platform for Users, Staff, Admins, and Super Admins. It combines a React + Vite frontend with an Express + MongoDB backend for complaint tracking, email verification, notifications, file uploads, and realtime updates.

## What UCMS Does

- Users register, verify email, submit complaints, and track complaint progress.
- Staff handle assigned complaints, upload proof, and mark work complete.
- Admins review queues, assign staff, approve or reject complaints, and manage workload.
- Super Admins manage departments, platform settings, users, and system activity.
- Socket.IO keeps notifications and complaint updates realtime.

## Technology Stack

| Layer | Main Tools |
|---|---|
| Frontend | React 19, Vite, React Router, Redux Toolkit, TanStack Query, Axios, Tailwind CSS, shadcn-style UI, Socket.IO client |
| Backend | Node.js, Express 5, MongoDB, Mongoose, JWT, Nodemailer, Cloudinary, Multer, Socket.IO |

## Project Structure

```text
UCMS/
  client/
    src/
      App.jsx
      main.jsx
      store.js
      components/
      constants/
      features/
      hooks/
      lib/
      pages/
      routes/
  server/
    config/
    controllers/
    middleware/
    models/
    routes/
    socket/
    utils/
    server.js
```

## How The App Works

### 1) Authentication flow


### 2) Complaint flow


### 3) Realtime updates


Password reset and email verification links use the browser's request origin first, then `FRONTEND_URL`, then `CLIENT_URL`, and finally the current request host. This means LAN requests automatically generate network-based links when the frontend is opened through the local IP.

- `client/src/main.jsx`: application bootstrap with providers.
- `client/src/App.jsx`: route setup and protected role-based routing.
- `client/src/lib/apiClient.js`: shared Axios client with auth handling and host fallback.
- `client/src/lib/socket.js`: shared Socket.IO client setup.
- `client/src/features/auth/`: login, register, verify email, reset password.
- `client/src/features/user/`: complaint creation, complaint list, details, dashboard, profile.
- `client/src/features/admin/`: complaint management and assignment screens.
- `client/src/features/staff/`: assigned complaints and work completion screens.
- `client/src/features/super-admin/`: departments, admin management, settings, activity logs.

## Main Backend Files

- `server/server.js`: creates the Express app, registers middleware, routes, and Socket.IO.
- `server/config/db.js`: database connection.
- `server/controllers/auth.controller.js`: register, login, verification, reset password, profile access.
- `server/controllers/complaint.controller.js`: complaint creation, viewing, updating, and status actions.
- `server/controllers/admin.controller.js`: admin dashboard and complaint oversight.
- `server/controllers/staff.controller.js`: staff workflow and proof handling.
- `server/controllers/user.controller.js`: user dashboard and user data.
- `server/models/Complaint.model.js`: complaint schema, complaint ID generation, timeline, attachments.
- `server/routes/`: route definitions for auth, complaints, admin, staff, user, super admin, notifications.
- `server/socket/socket.js`: Socket.IO server rooms and event broadcasting.

## Requirements

- Node.js installed on your machine.
- MongoDB connection string.
- SMTP credentials for verification and reset emails.
- Cloudinary credentials for uploads.

## Install Dependencies

Install the frontend packages:

```powershell
cd client
npm install
```

Install the backend packages:

```powershell
cd ..\server
npm install
```

## Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
CLIENT_ORIGIN=http://localhost:5173
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
EMAIL_HOST=your_smtp_host
EMAIL_PORT=465
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloud_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
NODE_ENV=development
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Run The App Locally

Start the backend:

```powershell
cd server
npm run dev
```

If `nodemon` is not available, use:

```powershell
cd server
npm start
```

Start the frontend in another terminal:

```powershell
cd client
npm run dev
```

Open the app here:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Mobile / LAN Testing

To open UCMS on a phone or another device, both devices must be on the same Wi‑Fi network.

1. Find your PC IP address with `ipconfig`.
2. Start the client so it listens on all interfaces:

```powershell
cd client
npm run dev -- --host 0.0.0.0
```

3. Start the backend:

```powershell
cd server
npm run dev
```

4. Open the PC IP shown by Vite on your phone:

```text
http://<your-PC-IP>:5173
```

Password reset and email verification links use the browser's request origin first, then `FRONTEND_URL`, then `CLIENT_URL`, and finally the current request host. That keeps LAN requests on the network address instead of rewriting links by hand.

For LAN testing, update the frontend-related values in `server/.env` to match the address used by other devices:

Example:

```env
FRONTEND_URL=http://192.168.1.8:5173
CLIENT_ORIGIN=http://192.168.1.8:5173
CLIENT_URL=http://192.168.1.8:5173
VITE_API_URL=http://192.168.1.8:5000/api
VITE_SOCKET_URL=http://192.168.1.8:5000
```

## Build For Production

Build the frontend:

```powershell
cd client
npm run build
```

Preview the build:

```powershell
cd client
npm run preview
```

## Typical User Flow

1. Install dependencies.
2. Configure environment variables.
3. Start backend and frontend.
4. Register as a user.
5. Verify the email link.
6. Log in and submit a complaint.
7. Track the complaint from the dashboard.

## Troubleshooting

- If the client cannot reach the API, check `VITE_API_URL` and `CLIENT_ORIGIN`.
- If login fails after registration, confirm the email verification step is complete.
- If emails do not send, verify SMTP values in `server/.env`.
- If uploads fail, confirm Cloudinary credentials.
- If MongoDB fails to connect, confirm `MONGODB_URI`.

## Notes

- Complaint IDs use the friendly format `UCMS-YYYY-XXXXXX`.
- The client automatically avoids `localhost` issues on mobile when possible.
- Realtime updates work only when both the server and client are running.
