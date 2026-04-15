# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend
```bash
cd backend
mvn spring-boot:run          # Start dev server (port 8080)
mvn clean package            # Build WAR
mvn test                     # Run all tests
mvn test -Dtest=ClassName    # Run single test class
```

### Frontend
```bash
cd frontend
npm start                    # Start dev server (port 3000, proxies to :8080)
npm run build                # Production build
npm test                     # Run tests
```

Swagger UI available at http://localhost:8080/swagger-ui/index.html when backend is running.

## Architecture

Full-stack MES application: Spring Boot backend + React frontend. The frontend dev server proxies all API calls to `http://localhost:8080`.

### Backend

Package root is `egovframework`, split into two namespaces:
- `egovframework.com.*` — framework infrastructure (config, JWT, security, common utilities)
- `egovframework.let.*` — business domain code (production, basedata, scheduler, auth, etc.)

Each domain follows: Controller → Service interface → ServiceImpl → DAO (MyBatis mapper).

**API responses** always use `ResultVO`:
```
{ "success": true, "message": "...", "data": {...} }
```

**SQL mappers** are per-database XML files at:
`backend/src/main/resources/egovframework/mapper/let/**/*_SQL_<db>.xml`

Supported DBs: mssql, mysql, oracle, altibase, cubrid, tibero. MSSQL is the primary production DB. When adding or modifying SQL, update all relevant `_SQL_<db>.xml` variants.

**Database scripts** are in `backend/DATABASE/`:
- `all_sht_ddl_<db>.sql` — table definitions
- `all_sht_data_<db>.sql` — seed data
- `*_migration_*.sql` — schema migrations

### Frontend

Page development order: `types/` → `services/` → page `hooks/` (React Query) → `components/` → page component.

- All HTTP calls go through the single Axios instance at `src/util/axios.ts` — never create new Axios instances
- Server state: React Query (`useQuery`, `useMutation`)
- Global state: Context API
- Styling: MUI components + `sx` prop + Emotion `styled()`
- No `any` types in TypeScript

### Authentication

JWT Bearer tokens. Access token: 60 min; refresh token: 7 days. The Axios interceptor auto-refreshes the access token 5 minutes before expiry and queues concurrent requests during refresh. Roles: ADMIN, USER, VIEWER.

## Key conventions

- No hardcoded values — use constants
- No `console.log` in committed code
- Service layer uses `@Transactional` (reads use `readOnly = true`)
- Commit message format: `[feat|fix|docs|refactor|test|chore] Subject`
- Do not commit `application-local.properties`, `.env.local`, or DB credentials

## Domain areas

Production (plan/order/result/performance), Base data (process, equipment, item, workplace, common codes), Scheduler (ERP/production request interfaces), Auth/permissions.
