# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Teacher AI Agent** application - a React-based web platform for AI-powered tutoring. It has two user roles:
- **Admin**: Manage AI agents, students, analytics, global knowledge
- **Student**: Chat with AI tutors, view history, manage profile

## Tech Stack

- **Framework**: React 18 + TypeScript 5 + Vite 5
- **UI**: shadcn/ui + Tailwind CSS 3 + Radix UI primitives
- **Routing**: React Router v6 with basename `/Teacher_AI_Agent`
- **State**: TanStack Query (React Query) + React Context (Auth)
- **Backend**: FastAPI (configured at `http://localhost:8000`)
- **Testing**: Vitest + React Testing Library + jsdom
- **Build Tool**: Vite with SWC plugin

## Common Commands

```bash
# Development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build development mode
npm run build:dev

# Run linter
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── App.tsx                 # Main app with routes and auth guards
├── main.tsx               # Entry point
├── pages/                 # Route-level components
│   ├── admin/            # Admin pages (dashboard, agents, students, etc.)
│   ├── student/          # Student pages (chat, history, profile)
│   ├── LoginPage.tsx
│   └── NotFound.tsx
├── components/
│   ├── ui/               # shadcn/ui components (50+ components)
│   ├── chat/             # Chat system components (ChatLayout, ChatWindow, etc.)
│   ├── layout/           # Layout components
│   └── ...               # Feature-specific components
├── hooks/                # Custom React hooks (useTTS, useAgentCache, etc.)
├── contexts/             # React contexts (AuthContext)
├── types/                # TypeScript type definitions
├── lib/                  # Utility functions (cn() for Tailwind)
├── config/               # Configuration (API URLs, services)
└── test/                 # Test setup and example tests
```

## Architecture Patterns

### Authentication
- Uses `AuthContext` (src/contexts/AuthContext.tsx) for global auth state
- Stores `user`, `access_token`, `refresh_token` in localStorage
- `ProtectedRoute` component guards routes by role (admin/student)
- JWT tokens sent via `Authorization: Bearer <token>` header

### API Integration
- Base URL configured in `src/config/api_urls/index.ts`
- Default: `http://localhost:8000/api/v1`
- API endpoints organized by feature in `API_URL` object
- Axios used for HTTP requests throughout

### Authentication Endpoints
- **Login**: `POST /api/v1/login` - Works for both admin and student (role determined by credentials)
- **Student Signup**: `POST /api/v1/signup` - Creates new student account
- **Admin Signup**: `POST /api/v1/admin/signup` - Creates new admin account

### Chat System (Core Feature)
The chat system uses a ChatGPT-style interface:
- **Components**: `ChatLayout`, `ChatSidebar`, `ChatWindow`, `ChatContent`
- **Routes**: 
  - `/student/chat` - Main chat interface
  - `/student/chat/session/:sessionId` - Specific session
  - `/student/chat/new/subject/:subjectName` - New chat with subject
- **State Management**: React Query for server state, local state for UI
- **Message Types**: text, notes, study_plan, quiz (see `src/types/chat.ts`)

### Component Organization
- **UI components**: `src/components/ui/` - shadcn components, generic and reusable
- **Feature components**: `src/components/chat/`, `src/components/feedback/` etc.
- **Pages**: `src/pages/` - Route components that compose features

### Path Aliases
All imports use `@/` alias mapped to `./src`:
```typescript
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
```

## Key Conventions

### Styling
- Tailwind CSS with custom CSS variables for theming
- Dark mode support via `ThemeProvider`
- `cn()` utility in `src/lib/utils.ts` for conditional class merging
- Custom color palette with HSL variables in `index.css`

### TypeScript
- Strict mode enabled
- Types in `src/types/` organized by feature
- Common types in `src/types/index.ts`

### shadcn/ui
- Components added via `npx shadcn add <component>`
- Style: default, baseColor: slate
- Uses CSS variables for theming

## Testing

Tests use Vitest with jsdom environment:
- Test files: `*.test.ts` or `*.test.tsx`
- Setup file: `src/test/setup.ts`
- Run single test: `npm run test -- <pattern>`

## Environment Notes

- **Dev server**: Port 8080, host `::` (IPv6 compatible)
- **HMR overlay**: Disabled in vite.config.ts
- **Router basename**: `/Teacher_AI_Agent` (for GitHub Pages deployment)

## Documentation

Additional documentation in `docs/`:
- `api-integration-guide.md` - API mapping for chat system
- `chat-system-README.md` - Chat system architecture
- `API_DOCUMENTATION.md` - Complete backend API reference

### Admin Dashboard APIs
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics (students, agents, sessions)
