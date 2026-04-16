# Department Admin — Archie Scheduling System

**Live app:** https://deptadmin-nine.vercel.app

---

## What is this?

This is the Department Admin module for our College Scheduling System (ITE-5425, Team Archie). The idea behind this module is to give department admins a single place to handle everything — who's teaching what, which rooms are available, and how courses are organized across the semester.

The app lets you:
- See all faculty members, their availability, and manage assignments
- Browse the full course catalog pulled straight from the database
- Check room/facilities status across campuses in real time
- Assign faculty to courses through an approval workflow
- Log in securely and have your session persist across pages

It connects to three other team modules (faculty, courses, facilities, scheduler) through a shared Neon PostgreSQL database, with each module owning its own schema.

---

## Tech stack

- **Next.js 16** with the App Router and TypeScript throughout
- **Neon PostgreSQL** — hosted Postgres, with separate schemas for each module (`faculty_schema`, `course_schema`, `facilities_schema`, `scheduler_schema`)
- **pg** — raw SQL queries using connection pools, one per schema
- **JWT auth** — custom session handling with httpOnly cookies and bcryptjs for password hashing
- **Tailwind CSS + shadcn/ui** — all the UI components
- **Vercel** — deployment

No Prisma in this module — we use raw `pg` pool queries directly against the Neon database.

---

## Getting it running locally

You'll need Node.js 18+ and access to the Neon database (ask a team member for credentials).

```bash
git clone https://github.com/2026-Winter-ITE-5425-0NA/project-team-archie.git
cd project-team-archie/deptadmin
npm install
```

Create a `.env.local` file in the `deptadmin/` folder:

```env
NEON_DATABASE_URL=postgresql://<user>:<password>@<host>/neondb?sslmode=require
FACULTY_DATABASE_URL=postgresql://<user>:<password>@<host>/neondb?sslmode=require
COURSE_DATABASE_URL=postgresql://<user>:<password>@<host>/neondb?sslmode=require
FACILITIES_DATABASE_URL=postgresql://<user>:<password>@<host>/neondb?sslmode=require
SCHEDULER_DATABASE_URL=postgresql://<user>:<password>@<host>/neondb?sslmode=require
JWT_SECRET=some-long-random-string
```

Each schema has its own Neon database user with scoped permissions. Don't commit `.env.local` — it's gitignored.

```bash
npm run dev
# opens on http://localhost:3000
```

---

## How the codebase is laid out

```
app/
  (app)/               # all the pages behind the auth wall
    page.tsx           # dashboard / department overview
    courses/           # course catalog
    faculty/           # faculty directory + profile view
    scheduling/        # room scheduling and facilities
    settings/
  login/ signup/       # public auth pages
  api/
    auth/              # login, logout, signup, session check
    course_schema/     # courses, departments, programs, semesters, terms
    faculty_schema/    # faculty list, availability, departments
    facilities/        # proxy to the external Humber Facilities API
    facilities_schema/ # our own local facilities tables
    scheduler_schema/  # scheduler module data

components/
  dashboard.tsx        # the main dashboard + assign faculty dialog
  app-shell.tsx        # sidebar navigation

lib/
  db.ts                # sets up one pg Pool per schema, reused across requests
  auth.ts              # JWT sign/verify helpers
  course-api.ts        # fetch wrappers for course_schema endpoints
  facilities-api.ts    # fetch wrappers for the facilities proxy
  faculty-schema-api.ts
  scheduler-api.ts

middleware.ts          # redirects unauthenticated users away from app pages
```

---

## API routes

### Auth

| Endpoint | Method | What it does |
|---|---|---|
| `/api/auth/signup` | POST | Creates a new user account |
| `/api/auth/login` | POST | Validates credentials, sets JWT cookie |
| `/api/auth/logout` | POST | Clears the session cookie |
| `/api/auth/me` | GET | Returns the logged-in user from the cookie |

### Courses

| Endpoint | Method | What it does |
|---|---|---|
| `/api/course_schema/courses` | GET | All courses joined with department names |
| `/api/course_schema/departments` | GET | Department list |
| `/api/course_schema/programs` | GET | Programs |
| `/api/course_schema/semesters` | GET | Semesters |
| `/api/course_schema/terms` | GET | Terms |
| `/api/course_schema/program_semesters` | GET | Program-semester mappings |
| `/api/course_schema/elective_groups` | GET | Elective groups |

### Faculty

| Endpoint | Method | What it does |
|---|---|---|
| `/api/faculty_schema/faculty` | GET | Full faculty list |
| `/api/faculty_schema/faculty/search` | GET | Search by name or email |
| `/api/faculty_schema/faculty/[id]/availability` | GET | Availability slots for one faculty member |
| `/api/faculty_schema/availability/[id]` | GET | Same, alternate route |
| `/api/faculty_schema/department` | GET | Faculty departments |
| `/api/faculty_schema/course` | GET | Courses linked to faculty |

### Facilities

`/api/facilities/[...path]` is a proxy — every request gets forwarded to `https://humber-facilities.vercel.app`. This covers rooms, campuses, timetables, and availability.

We also have local facilities tables:

| Endpoint | Method | What it does |
|---|---|---|
| `/api/facilities_schema/rooms` | GET | Rooms from our own DB |
| `/api/facilities_schema/buildings` | GET | Buildings |
| `/api/facilities_schema/campuses` | GET | Campuses |
| `/api/facilities_schema/tags` | GET | Room tags |

### Scheduler

| Endpoint | Method | What it does |
|---|---|---|
| `/api/scheduler_schema/course` | GET | Courses in the scheduler schema |
| `/api/scheduler_schema/department` | GET | Departments |
| `/api/scheduler_schema/term` | GET | Terms |

---

## How this connects to the other modules

Everything shares the same Neon database, just in different schemas. This module reads from all of them:

- **faculty_schema** — faculty profiles, their departments, and availability windows. Used to populate the faculty directory page and the "Assign Faculty" dialog.
- **course_schema** — the course catalog. The courses page reads from here, and so does the subject dropdown when assigning faculty.
- **facilities_schema + Humber API** — room counts and campus info shown on the dashboard overview, and the full room browser in the scheduling page.
- **scheduler_schema** — course and term data used in scheduling workflows.

For the assignment feature specifically: when an admin assigns a faculty member to a course, a record gets saved to `localStorage` and the faculty page reads from the same store — so the pending request shows up on the faculty member's profile straight away.

---

## Authentication

Login sets an `httpOnly` cookie called `archie_token` containing a signed JWT. The `middleware.ts` file checks this on every request to any `/app/*` route and redirects to `/login` if the cookie is missing or invalid. Passwords are hashed with bcrypt before being stored. The `/api/auth/me` endpoint is what the client calls to hydrate the current user on page load.

---

## Deployment

Deployed on Vercel. All environment variables are set in the Vercel project settings — not in the repo.

To push a new production build:

```bash
vercel --prod
```

---

## Team

**Frin Patel** — Department Admin module. Built the dashboard, faculty assignment workflow, course catalog, facilities integration, auth system, and handled deployment.
