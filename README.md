# Bike Mechanic Management Application

Role-based application for a bike service/repair workshop. See
[Bike_Mechanic_Application_Requirements.md](Bike_Mechanic_Application_Requirements.md) for full
functional requirements.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS — `frontend/`
- **Backend:** ASP.NET Core Web API (.NET 10) + EF Core + SQL Server — `backend/BikeMechanic.Api/`
- **Auth:** JWT access + refresh tokens, role-based authorization (`Mechanic`, `Client`)

## Current status

Phase 1 (foundation/auth) and the start of Phase 2 (clients, bikes, bike history) are implemented
end-to-end, backend and frontend. Remaining phases (services, spare parts, invoices,
notifications, follow-ups, revenue dashboard) follow the build order in the requirements doc,
section 33.

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
