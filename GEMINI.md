# Project Overview: TechHub Teste (projeto-willian)

A modern e-commerce platform prototype built with React 19 and Supabase. The project features product management, a shopping cart, user authentication, and an administrative dashboard.

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite
- **Routing:** React Router DOM v7
- **Styling:** Vanilla CSS with CSS Variables for theming
- **Icons:** Lucide React
- **Backend/Database:** Supabase (PostgreSQL, Auth, Row Level Security)

## Architecture
- `src/pages/`: Main views (Home, Products, ProductDetail, Cart, Login, AdminPage).
- `src/components/`: Reusable components organized by domain:
    - `layout/`: Navbar, Footer, AnnouncementBar, etc.
    - `product/`: Product-specific features like Gallery and Reviews.
    - `admin/`: Dashboard components for product management.
    - `ui/`: Generic UI elements like ProductCard.
- `src/context/`: State management for Authentication and Shopping Cart.
- `src/lib/`: Backend integration logic (Supabase client, shipping calculation).
- `src/hooks/`: Custom React hooks for data fetching and logic.
- `src/types/`: Centralized TypeScript definitions.

---

## Building and Running

### Prerequisites
- Node.js and npm installed.
- A Supabase project with the schema from `schema.sql` applied.
- Environment variables configured in a `.env` file (see `src/lib/supabase.ts` for expected keys).

### Key Commands
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds the project for production.
- `npm run lint`: Executes ESLint to check for code quality issues.
- `npm run preview`: Previews the production build locally.

---

## Development Conventions

### Coding Standards
- **TypeScript:** Always use strict typing for props, state, and function returns.
- **Components:** Prefer functional components with hooks. Split large components into smaller, reusable ones in `src/components/`.
- **Styling:** Use Vanilla CSS with the variables defined in `src/index.css`. Avoid adding utility-first CSS libraries unless explicitly requested.
- **State Management:** Use Context API for global state (Auth, Cart) and local `useState`/`useReducer` for component-specific state.

### Backend Integration
- All Supabase interactions should use the client exported from `src/lib/supabase.ts`.
- Ensure Row Level Security (RLS) is considered when making database queries.

### Git Workflow
- Create descriptive feature branches for new changes.
- Ensure `npm run lint` passes before committing.
