# Jira Clone

A full-stack project management tool inspired by Jira: projects with Kanban boards, teams with roles and invitations, task detail views with comments and attachments, notifications, and a dashboard — in a dark, Jira-style interface.

## Features

**Authentication**
- Register and log in with JWT authentication (7-day tokens by default)
- Sessions survive page refresh — the app restores the current user via `GET /api/auth/me`
- Invalid or expired tokens are cleared automatically and you are redirected to login
- Profile page with avatar upload, name/email/bio editing and password change
- Account deletion (safely refuses while you still own shared projects or teams)

**Projects & boards**
- Create, edit and delete projects (delete cascades tasks, comments and attachments)
- Auto-generated project keys (`MA-1`, `MA-2`, …) used as ticket IDs
- Kanban board with drag-and-drop status changes, List view and Summary view
- Board toolbar: search, type/priority/assignee filters, one-click clear filters
- Task deep links: every task has a shareable URL (`/projects/:id?task=:taskId`)
- Member management: search users, add/remove members (project owner)

**Tasks**
- Create issues with project, type (task/story/bug), status, priority, assignee, due date
- Full editing in the task detail view: inline title/description editing, status, priority, assignee, reporter, due date, labels, work type
- Real file attachments (up to 5 MB) with upload progress, viewing and removal — stored in MongoDB GridFS, access-controlled
- Comments with `@mention` support that notifies teammates
- Activity log showing who changed what and when
- "My Tasks" page collecting everything assigned to you, with search, status/priority filters, sorting and pagination

**Teams**
- Create teams, invite members by email, accept/decline invitations
- Three roles: **owner** (full control, cannot be removed), **admin** (invite and manage members), **member** (work on team projects)
- Team detail page with member list, pending invitations, role management and the team's projects
- Projects can belong to a team so the whole team can find them

**Notifications & search**
- Notification bell with unread badge; events for task assignment, status changes, comments, mentions, team invites and project additions
- Each category can be toggled in Settings
- Global search in the top bar across projects, tasks and people (debounced)

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, TypeScript (strict), Vite, React Router 7, Redux Toolkit, Axios, Tailwind CSS 4, dnd-kit, react-hook-form, react-toastify |
| Backend | Node.js, Express 5, Mongoose 9 (MongoDB), JSON Web Tokens, bcryptjs, express-validator, express-rate-limit, multer + GridFS |
| Testing | Bash smoke-test suite against the running API |

## Project structure

```text
client/                      React + TypeScript frontend
  public/                    static assets
  src/
    api/                     one module per backend resource (axios instance, auth, teams, ...)
    components/
      board/                 board, columns, cards, toolbar, list & summary views
      common/                Avatar, ConfirmDialog, loading/empty/error states
      dashboard/             dashboard widgets
      layout/                TopBar (search, notifications, avatar menu), Sidebar
      projects/              create/edit project, member management modals
      tasks/                 quick-create modal, task detail modal
    config/                  env + local preference helpers
    pages/                   auth, dashboard, projects, tasks, teams, profile, settings
    redux/                   auth + sidebar slices
    routes/                  protected routing
    types/                   shared TypeScript types
    utils/                   badges, dates, user-ref helpers
server/                      Express API
  server.js                  entry point
  src/
    app.js                   CORS, helmet, routes, error handling
    config/db.js             MongoDB connection
    controllers/             one per resource
    middleware/              auth, validation, rate limiting, logging, error handler
    models/                  User, Project, Task, Comment, Team, Notification
    routes/                  one router per resource
    utils/                   access checks, notifications, GridFS storage
render.yaml                  Render blueprint for the backend
client/vercel.json           SPA rewrite for client-side routes
```

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB database (local `mongod` or MongoDB Atlas)

## Local setup

```bash
git clone <repository-url>
cd jira-clone

cd server && npm install
cd ../client && npm install
```

Create `server/.env` (see `server/.env.example`):

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/jira-clone
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Create `client/.env` (see `client/.env.example`):

```env
VITE_API_URL=http://localhost:5001/api
```

Run the backend:

```bash
cd server
npm run dev        # nodemon, or: npm start
```

Run the frontend in a second terminal:

```bash
cd client
npm run dev        # Vite dev server, usually http://localhost:5173
```

The API also accepts any `localhost` origin in development, so Vite fallback ports (5174, …) work without extra configuration.

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `PORT` | server | HTTP port (Render supplies it in production) |
| `MONGO_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Secret used to sign session tokens |
| `JWT_EXPIRES_IN` | server | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | server | Frontend origin allowed by CORS |
| `VITE_API_URL` | client | Base URL of the API, e.g. `http://localhost:5001/api` |

All API URLs come from `VITE_API_URL`; no production URLs are hardcoded.

## Authentication flow

1. **Register / login** — the server verifies credentials with bcrypt and returns `{ user, token }`. The token is stored in `localStorage`; no passwords or sensitive data are kept in frontend state.
2. **Refresh** — on app start, a stored token triggers `GET /api/auth/me` while a "Restoring your session" splash is shown. If the token is invalid or expired, it is cleared and you land on `/login`. Protected routes render only after the session is confirmed.
3. **Requests** — an axios request interceptor attaches `Authorization: Bearer <token>` to every API call.
4. **Expiry** — a response interceptor watches for `401` responses: the token is dropped, the Redux session state resets, and the next navigation sends you to login.
5. **Password change** — the server issues a fresh token, which the client stores transparently.
6. **Logout** — clears the token and session state (JWTs are stateless, so no server round-trip is needed).

## How to create a project

1. Sign up or log in.
2. Click **Projects** in the sidebar, then **New Project** (or use **Quick actions** on the dashboard).
3. Enter a name and description. Optionally pick a **team** so the project shows up on the team page.
4. The project gets a short key (e.g. `MA`) used for ticket IDs like `MA-1`.
5. Click the project to open its board. Use **Create issue** in any column, or the blue **Create** button in the top bar.

## How to add team members

There are two levels of sharing:

**Add someone to a single project** (fastest way to collaborate):
1. Open the project board.
2. Click the **people icon** next to the project title (or **Add member** in the header, visible to the project owner).
3. Search by name or email — the person must already have an account.
4. Click **Add**. They appear in the member list immediately and get a notification.
5. Remove members with the ✕ next to their name. Duplicate additions are prevented.

**Create a team** (for grouping people across projects):
1. Click **Teams** in the sidebar → **Create team**.
2. On the team page, click **Invite member**, enter their email and choose a role (admin or member).
3. The invitee accepts or declines from their **Teams** page or the notification bell.
4. Create projects with that team selected, and the whole team can find them.

## Team permissions

| Ability | Owner | Admin | Member |
| --- | --- | --- | --- |
| View team & team projects | ✓ | ✓ | ✓ |
| Edit team name/description | ✓ | ✓ | — |
| Invite members | ✓ | ✓ | — |
| Remove members | ✓ (except owner) | ✓ (regular members only) | — |
| Change member roles | ✓ | — | — |
| Leave the team | — | ✓ | ✓ |
| Delete the team | ✓ | — | — |

Project-level permissions are simpler: the **project owner** can edit settings, add/remove members and delete the project; members can view the project and work on its tasks. All checks are enforced server-side — the API never trusts the UI.

## Building

```bash
cd client
npm run build      # type-checks with tsc, then bundles into dist/
npm run preview    # serve the production build locally
```

```bash
cd server
npm start          # node server.js
```

## Deployment

### Backend on Render

The included `render.yaml` blueprint configures everything; otherwise set up a web service manually:

- **Root directory:** `server`
- **Build command:** `npm install`
- **Start command:** `node server.js`

Environment variables (Render dashboard):

```env
MONGO_URI=<your-atlas-connection-string>
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://<your-frontend>.vercel.app
```

### Frontend on Vercel

- **Root directory:** `client`
- **Environment variable:** `VITE_API_URL=https://<your-backend>.onrender.com/api`

`client/vercel.json` rewrites all routes to `index.html`, so refreshing `/dashboard`, `/projects/:id`, `/teams/:id`, etc. works correctly.

### Checks after deploying

1. `GET <backend>/api/health` returns `{"status":"ok"}`.
2. Log in from the deployed frontend — confirm the browser network tab shows calls going to your backend and CORS passes.
3. Refresh a deep link like `/projects` to confirm the SPA rewrite works.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `MongoDB connection failed` on server start | Check `MONGO_URI` in `server/.env`; ensure `mongod` is running locally or Atlas allows your IP. |
| API returns `Not authorized` right after login | The client's `VITE_API_URL` may point at a different backend than the one that issued the token. Clear localStorage and log in again. |
| CORS errors in the browser console | Add your frontend origin to `CLIENT_URL` on the backend (local dev origins are always allowed). |
| Page refresh on `/dashboard` shows 404 | The SPA rewrite is missing — ensure `client/vercel.json` is deployed and Vercel's root directory is `client`. |
| Attachment upload fails | Files must be ≤ 5 MB with a supported extension (images, PDF, text, Office, zip). |
| "Too many attempts" on login | Rate limiting kicked in (20 failed attempts per 15 minutes). Wait and retry. |
| My Tasks page is empty | It lists tasks **assigned to you** across projects you are a member of — create a task and assign yourself. |

## API overview

| Route | Purpose |
| --- | --- |
| `POST /api/auth/register`, `POST /api/auth/login` | Create account / get token (rate limited) |
| `GET /api/auth/me`, `PATCH /api/auth/me` | Session user; update profile & notification prefs |
| `PATCH /api/auth/password`, `DELETE /api/auth/me` | Change password; delete account |
| `POST /api/auth/avatar` | Upload profile avatar |
| `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/:id` | Project CRUD (membership enforced) |
| `POST /api/projects/:id/members`, `DELETE /api/projects/:id/members/:userId` | Manage project members |
| `POST /api/tasks`, `GET /api/tasks/project/:projectId` | Create/list project tasks |
| `GET /api/tasks/my-tasks`, `GET /api/tasks/:id` | My tasks (filters/pagination); task detail with activity |
| `PATCH /api/tasks/:id`, `PATCH /api/tasks/:id/status`, `DELETE /api/tasks/:id` | Update/delete tasks |
| `POST /api/comments`, `GET /api/comments/task/:taskId` | Comments |
| `GET/POST /api/teams`, `GET/PATCH/DELETE /api/teams/:id` | Teams |
| `POST /api/teams/:id/invites`, `POST /api/teams/:id/invites/:inviteId/respond` | Invitations |
| `PATCH/DELETE /api/teams/:id/members/:userId`, `POST /api/teams/:id/leave` | Members & roles |
| `GET /api/teams/invitations` | My pending team invitations |
| `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `POST /api/notifications/read-all` | Notifications |
| `POST /api/attachments`, `GET/DELETE /api/attachments/:id` | File uploads (GridFS, access-controlled) |
| `GET /api/search?q=` | Global search: projects, tasks, users |
| `GET /api/users/search`, `GET /api/users/search-users` | Member pickers |
| `GET /api/dashboard/stats`, `GET /api/dashboard/recent-tasks` | Dashboard widgets |
| `GET /api/health` | Health check |

## Security notes

- Never commit `.env` files or real credentials. `.gitignore` excludes them; `.env.example` files document the shape.
- Passwords are hashed with bcrypt and never selected into API responses; the server strips `password` on every user serialization.
- JWTs are signed with `JWT_SECRET`; use a long random value in production (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
- Login/register are rate limited; all list endpoints validate and paginate; every protected resource checks membership server-side.
- Uploaded files are stored in MongoDB GridFS. Task attachments require authentication **and** project membership to download; avatars are public by design.
- If a credential was ever committed or shared, rotate it (JWT secret, Atlas password) immediately. This repository's history was checked: only placeholder values were ever committed.
