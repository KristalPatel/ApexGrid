# ApexGrid

Formula 1 stats website (React + Express + MySQL) for the DBMS assignment.

```
apex-grid/
  frontend/   React (Vite). Works now with mock data.
  backend/    Express API. Needs your MySQL database.
  database/   Put schema.sql and seed.sql here and share them on GitHub.
```

## Run the frontend (no database needed yet)

```
cd frontend
npm install
npm run dev
```

Open the address it prints. Demo logins:
- admin / admin123 (goes to the Admin Console)
- fan / fan123 (goes to the Home page)

## Connect the real database later

1. Put `schema.sql` and `seed.sql` in `/database`. Each teammate runs them in MySQL Workbench.
2. `cd backend`, copy `.env.example` to `.env`, fill in your MySQL details.
3. Open `backend/allowed.js` and change the table and column names to match your schema.
4. `npm install` then `npm run dev`.
5. In `frontend/src/api.js` change `USE_MOCK = true` to `false`.

## Sharing work

- Frontend owner: `/frontend`. Backend and database owner: `/backend` and `/database`.
- Never commit `.env`. Share it privately.
- Mock data in `frontend/src/data/mockData.js` is placeholder only.
# ApexGrid
