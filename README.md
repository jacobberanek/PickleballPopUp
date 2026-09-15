# PickleballPopUp
**COMP 4710 Senior Design Project**  
**Professor:** Dr. Jakita Thomas

---

## Members
- Jacob Beranek
- William Youngblood
- Mith Patel 
- Rudra Patel

---

## Project Description
PickleballPopUp is a web application designed to help users easily organize and join pickleball events. The platform allows players to create events, view available events, join events created by others, record sub-game results within each event, and track win/loss statistics on a leaderboard.

The goal of this project is to provide a simple coordination tool for our sponsor's recreational pickleball group.

---

## Features
- Create and manage pickleball **events**
- Join or leave existing events by username
- Record multiple **sub-games** per event (teams, scores, wins/losses)
- Randomize teams from the pool of joined players
- **Leaderboard** showing player win/loss records (only updates after events are completed)
- **Game History** showing all recorded sub-games from completed events
- **Event Chat** — players can message each other within an event
- Simple username-based login (no password required)

---

## Technologies Used

**Frontend**
- React (TypeScript)
- React Router
- Vite (build tool)

**Backend**
- Node.js
- Express.js

**Database**
- PostgreSQL (hosted on Render)

**Deployment**
- Render Web Service (Backend API)
- Render Static Site (Frontend)

---

## Live Application

**Frontend**  
https://pickleballpopup-frontend.onrender.com

**Backend API**  
https://pickleballpopup.onrender.com/api/games

---

## Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/cindyj3/PickleballPopUp.git
cd PickleballPopUp
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:
```
DATABASE_URL=postgresql://pickleball_db_fxr6_user:dskcg8enJH7lxoxA3e8JzSsh5Ae5ceiU@dpg-d7jfs21kh4rs73fm3rf0-a.oregon-postgres.render.com/pickleball_db_fxr6
```

Start the backend server:
```bash
node server.js
```

The API will run at: `http://localhost:3001`

### 3. Frontend setup
Open a second terminal:
```bash
cd frontend
npm install
```

Create a `.env.local` file inside the `frontend/` folder:
```
VITE_API_URL=http://localhost:3001
```

Start the frontend:
```bash
npm run dev
```

The app will run at: `http://localhost:5173`

---

## Render Deployment

### Database
1. Create a new **PostgreSQL** database on Render (free tier)
2. Copy the **Internal Database URL** for use in the backend service
3. Note: free Postgres databases expire after 90 days and must be recreated

### Backend (Web Service)
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Environment Variables:**
  - `DATABASE_URL` = Internal Postgres URL from Render 
  - `NODE_ENV` = `production`
  - `FRONTEND_URL` = `https://pickleballpopup-frontend.onrender.com`

### Frontend (Static Site)
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL` = `https://pickleballpopup.onrender.com`

### Rewrite Rule (fixes page refresh on frontend)
In your frontend static site on Render, go to **Redirects/Rewrites** and add:
- **Source:** `/*`
- **Destination:** `/index.html`
- **Action:** Rewrite

---

## API Endpoints

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | Get all events |
| POST | `/api/games` | Create a new event |
| POST | `/api/games/:id/join` | Join an event |
| POST | `/api/games/:id/leave` | Leave an event |
| POST | `/api/games/:id/finish` | Mark event as completed |
| POST | `/api/games/:id/delete` | Delete an event (host only) |
| GET | `/api/games/:id/players` | Get players for an event |

### Sub-Games
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games/:id/subgames` | Get all sub-games for an event |
| POST | `/api/games/:id/subgame` | Record a new sub-game result |

### Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games/leaderboard` | Get player leaderboard |
| GET | `/api/games/history` | Get completed game history |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games/:id/chat` | Get chat messages for an event |
| POST | `/api/games/:id/chat` | Send a chat message |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create or get a user by username |

---

## Database Schema

- **Users** — player accounts (username-based)
- **Games** — events (location, time, status, host)
- **GamePlayers** — players joined to an event
- **SubGames** — individual games played within an event (scores)
- **SubGamePlayers** — players in each sub-game with win/loss
- **Conversations / Messages** — event chat

---

## Known Limitations & Security Notes
- The `/api/games/reset` endpoint is unprotected — anyone with the URL can wipe all data. For production use, this should be secured with an admin password.
- Username login has no password — anyone can log in as any username. Suitable for small trusted groups only.
- PostgreSQL free tier expires every 90 days and must be manually recreated.
- Backend free tier on Render spins down after 15 minutes of inactivity, causing a ~1 minute delay on first request.
- The `.env` and `.env.local` files are gitignored and must be set up manually on each machine
