# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Teacher AI Agent** application - a React-based web platform for AI-powered tutoring. It has two user roles:
- **Admin**: Manage AI agents, students, analytics, global knowledge
- **Student**: Chat with AI tutors, view history, manage profile

## Tech Stack

- **Framework**: React 18 + TypeScript 5 + Vite 5 (SWC plugin)
- **UI**: shadcn/ui + Tailwind CSS 3 + Radix UI primitives
- **Routing**: React Router v6 with basename `/Teacher_AI_Agent`
- **State**: TanStack Query (React Query) + React Context (Auth)
- **Backend**: FastAPI (configured at `http://localhost:8000`)
- **Testing**: Vitest + React Testing Library + jsdom
- **Dev Tooling**: `lovable-tagger` Vite plugin (component tagging in dev mode)

## Common Commands

```bash
# Development server (runs on port 8080)
npm run dev
# or
npm start

# Build for production
npm run build

# Build development mode
npm run build:dev

# Run linter
npm run lint

# Run tests (single run)
npm run test

# Run tests in watch mode
npm run test:watch

# Run a single test file/pattern
npm run test -- <pattern>

# Preview production build
npm run preview
```

## Architecture Patterns

### Authentication
- Uses `AuthContext` (src/contexts/AuthContext.tsx) for global auth state
- Stores `user`, `access_token`, `refresh_token` in localStorage
- `ProtectedRoute` component guards routes by role (admin/student)
- JWT tokens sent via `Authorization: Bearer <token>` header
- **Note**: There is no token refresh mechanism; auth is initialized from localStorage on mount

### API Layer
- Base URL configured in `src/config/api_urls/index.ts`
- Default: `http://localhost:8000/api/v1`
- **Two axios instances** in `src/config/services/index.ts`:
  - `api` — configured for `multipart/form-data` (file uploads, form submissions)
  - `apiDataJson` — configured for `application/json` (standard API calls)
- Both instances have request interceptors injecting the Bearer token and response interceptors handling 401 by clearing localStorage and redirecting to `/login`
- API endpoints organized by feature in the `API_URL` object

### Chat System (Core Feature)
The chat system uses a ChatGPT-style interface:
- **Components**: `ChatLayout`, `ChatSidebar`, `ChatWindow`, `ChatContent`
- **State Management**: React Context (`ChatContext` in `ChatLayout.tsx`) for session/message state, React Query for server state
- **Message Types**: text, notes, study_plan, quiz (see `src/types/chat.ts`)
- **Routing evolution**:
  - New routes: `/student/chat`, `/student/chat/session/:sessionId`, `/student/chat/new/subject/:subjectName`
  - Legacy route (backward compat): `/student/chat/:subjectName`
- **Session APIs**: See `docs/api-integration-guide.md` for endpoint mapping

### Component Organization
- **UI components**: `src/components/ui/` — shadcn components, generic and reusable
- **Feature components**: `src/components/chat/`, `src/components/feedback/` etc.
- **Pages**: `src/pages/` — Route components that compose features

### Path Aliases
All imports use `@/` alias mapped to `./src`:
```typescript
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
```

## Key Conventions

### TypeScript
- `tsconfig.json` has **relaxed strictness**: `strictNullChecks: false`, `noImplicitAny: false`, `noUnusedLocals: false`, `noUnusedParameters: false`
- Types in `src/types/` organized by feature
- Common types in `src/types/index.ts`

### Styling
- Tailwind CSS with custom CSS variables for theming
- Dark mode support via `ThemeProvider` (default: light, storage key: `ai-teachers-theme`)
- `cn()` utility in `src/lib/utils.ts` for conditional class merging
- Custom color palette with HSL variables and gradient utilities in `index.css`

### shadcn/ui
- Components added via `npx shadcn add <component>`
- Style: default, baseColor: slate
- Uses CSS variables for theming

## Testing

Tests use Vitest with jsdom environment:
- Test files: `*.test.ts` or `*.test.tsx`
- Setup file: `src/test/setup.ts` (includes `matchMedia` mock and jest-dom matchers)
- Run single test: `npm run test -- <pattern>`

## Environment Notes

- **Dev server**: Port 8080, host `::` (IPv6 compatible)
- **HMR overlay**: Disabled in `vite.config.ts`
- **Router basename**: `/Teacher_AI_Agent` (for GitHub Pages deployment)
- **Vite plugin**: `lovable-tagger` runs only in development mode for component inspection

## Documentation

Additional documentation in `docs/`:
- `api-integration-guide.md` — API mapping for chat system
- `chat-system-README.md` — Chat system architecture
- `API_DOCUMENTATION.md` — Complete backend API reference

### Admin Dashboard APIs
- `GET /api/v1/admin/dashboard/stats` — Dashboard statistics (students, agents, sessions)
