# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands
- Build: `npm run build`
- Lint: `npm run lint`
- Dev Server: `npm run dev`
- Preview Build: `npm run preview`

**Git Workflow**: Always create a new feature branch for changes to keep the `main` branch intact.

## Architecture & Structure
The project is a React application built with Vite, TypeScript, and Tailwind CSS, utilizing Supabase for the backend.

### Key Directories
- `src/pages/`: Main view components (Home, Products, Login, AdminPage).
- `src/components/`: Reusable UI components, split into `layout` (Navbar), `admin` (Product management), and `ui`.
- `src/context/`: Authentication state management via `AuthContext.tsx`.
- `src/lib/`: Supabase client configuration (`supabase.ts`).
- `src/hooks/`: Custom React hooks.
- `src/types/`: TypeScript type definitions.

### Routing & State
- **Routing**: Handled by `react-router-dom` in `App.tsx`.
- **Auth**: Managed through an `AuthProvider` wrapping the application, integrated with Supabase Auth.
- **Data**: Supabase is used for database interactions (defined in `schema.sql` and `seed.sql` in the root).

### Key Files
- `src/App.tsx`: Main routing configuration and layout wrapper.
- `src/lib/supabase.ts`: Centralized Supabase client instance.
- `schema.sql` / `seed.sql`: Database schema and initial data definitions.
