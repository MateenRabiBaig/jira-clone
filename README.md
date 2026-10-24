# Jira Clone

A full-stack project management application inspired by Jira. It provides authentication, project workspaces, task boards, dashboards, comments, member management, and profile/settings screens.

## Features

- User registration and login with JWT authentication
- Protected routes and authenticated API requests
- Project creation and project member management
- Kanban-style task boards with task status updates
- Task priorities, assignees, reporters, and comments
- Dashboard statistics and recent activity
- Responsive React interface with drag-and-drop board interactions
- MongoDB persistence through Mongoose

## Tech stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Redux Toolkit and React Redux
- Axios
- Tailwind CSS
- dnd-kit

### Backend

- Node.js
- Express 5
- MongoDB and Mongoose
- JSON Web Tokens
- bcryptjs

## Project structure

```text
client/   React + TypeScript frontend
server/   Express API and MongoDB integration
```

The API is mounted under `/api` and includes these route groups:

| Route | Purpose |
| --- | --- |
| `/api/auth` | Register, login, and current-user authentication |
| `/api/projects` | Create and manage projects and members |
| `/api/tasks` | Create, list, and update tasks |
| `/api/comments` | Add and list task comments |
| `/api/users` | Search users |
| `/api/dashboard` | Dashboard statistics and recent tasks |
| `/api/health` | API health check |

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB database, locally or through MongoDB Atlas

## Local setup

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd jira-clone

cd server
npm install

cd ../client
npm install
```

Create `server/.env`:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/jira-clone
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

Start the backend in one terminal:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Vite may choose another available port, such as `5174`; the backend accepts localhost development origins. Open the URL printed by Vite in your browser.

## Production builds

Build the frontend:

```bash
cd client
npm run build
```

Start the backend in production mode:

```bash
cd server
npm start
```

## Deployment

### Backend on Render

Configure the Render web service with:

- Root directory: `server`
- Build command: `npm install`
- Start command: `node server.js`

Set these environment variables in Render:

```env
MONGO_URI=<mongodb-atlas-connection-string>
JWT_SECRET=<production-secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=<deployed-frontend-origin>
```

Render supplies `PORT` automatically. MongoDB Atlas must allow connections from the deployed service.

### Frontend on Vercel

Configure the Vercel project with `client` as its root directory and add:

```env
VITE_API_URL=https://<backend-host>/api
```

The `client/vercel.json` rewrite serves `index.html` for client-side routes so refreshing pages such as `/login` or `/dashboard` works correctly.

## Security notes

- Never commit `.env` files or production secrets.
- Use a long, random `JWT_SECRET` in production.
- Restrict MongoDB Atlas network access where possible.
- If a credential has ever been committed or shared, rotate it immediately.

## License

This project does not currently specify a license.
