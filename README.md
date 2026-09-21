# Bike Mechanic Management Application

Role-based application for a bike service/repair workshop. See
[Bike_Mechanic_Application_Requirements.md](Bike_Mechanic_Application_Requirements.md) for full
functional requirements.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS — `frontend/`
- **Backend:** ASP.NET Core Web API (.NET 10) + EF Core + SQL Server — `backend/BikeMechanic.Api/`
- **Auth:** JWT access + refresh tokens, role-based authorization (`Mechanic`, `Client`)

## Current status

Phases 1–8 (auth, clients/bikes, services, spare parts, invoices, notifications, follow-ups,
revenue dashboard) are implemented end-to-end, backend and frontend, matching the Definition of
Done in the requirements doc, section 35. Phase 9 (containerized/cloud deployment, CI/CD,
monitoring) has not been started — the current IIS setup described below is a manual LAN
deployment, not the production path from section 30.

## Demo deployment (LAN)

A running instance is published locally for testing, with seeded demo data covering every page.

| Service | URL |
|---|---|
| Web app | http://192.168.0.195:7002 (standalone Next.js production build) |
| API / Swagger | http://192.168.0.195:7001/swagger |

**Demo login credentials** (local/LAN demo data only — not real accounts):

| Role | Phone | Password |
|---|---|---|
| Mechanic | `9000000000` | `Mechanic@123` |
| Client | `9111111111` | `Client@123` |

These only work against the local SQL Server instance this app is currently pointed at and are not
meant to be reused for any real deployment.

## Running locally

### Database

Either use a local SQL Server instance (the backend's `appsettings.Development.json` points at a
local `SQLEXPRESS` instance with Windows auth by default), or start one via Docker:

```bash
docker compose up -d sqlserver
```

If you use Docker, update `backend/BikeMechanic.Api/appsettings.Development.json`'s
`ConnectionStrings:DefaultConnection` to point at `localhost,1433` with the `sa` credentials from
`docker-compose.yml`.

### Backend

```bash
cd backend/BikeMechanic.Api
dotnet ef database update   # applies migrations
dotnet run
```

API listens on `http://localhost:5000` by default. Swagger UI is available at
`http://localhost:5000/swagger` in Development.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_BASE_URL if the API isn't on localhost:5000
npm install
npm run dev
```

App runs on `http://localhost:3000`.

## Security notes

- Rotate `Jwt:Secret` and the SQL Server password before any non-local deployment; the checked-in
  values are placeholders for local development only.
- All mechanic-only endpoints are protected server-side via `[Authorize(Policy = "MechanicOnly")]`;
  clients can only read their own bikes/services/invoices — the backend enforces this on every
  request rather than relying on the frontend hiding UI.
