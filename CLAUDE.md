# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (runs on localhost:8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Lint codebase
npm run lint

# Preview production build
npm run preview
```

## Project Architecture

**FramePromptly** is a UX prompt generation platform built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui components. The application helps users generate AI-powered prompts for UX design frameworks.

### Core Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM
- **Backend**: Supabase (auth, database, edge functions)
- **Theme**: next-themes for light/dark mode support

### Application Structure

**Authentication Flow**:
- Uses Supabase Auth with PKCE flow for security
- `AuthProvider` context wraps the entire app in `main.tsx`
- Protected routes use `ProtectedRoute` component in `App.tsx`
- Auth state managed through `useAuth` hook

**Layout System**:
- `Layout` component provides consistent header/footer structure
- `Header` component handles navigation and user profile dropdown
- Conditional footer rendering (hidden on chat page)

**Multi-Step Prompt Generator**:
- Primary feature located in `src/pages/Generator.tsx`
- Step-based flow: project → basic-info → stage → framework → tool → context → result
- Components in `src/components/generator/` handle each step
- Integrates with Supabase edge functions for AI prompt generation

**Component Organization**:
- `src/components/ui/`: shadcn/ui components
- `src/components/generator/`: Multi-step generator components
- `src/components/`: Shared application components (Header, Footer, Layout, etc.)
- `src/pages/`: Route-level page components

**Data Flow**:
- Supabase client configured in `src/integrations/supabase/client.ts`
- API utilities in `src/utils/api.ts` for HTTP requests
- Custom hooks in `src/hooks/` for auth, mobile detection, and usage tracking

### Supabase Integration

**Edge Functions** (in `supabase/functions/`):
- `generate-enhanced-prompt`: Main AI prompt generation
- `generate-ai-response`: AI response generation
- `get-ai-recommendations`: Tool recommendations
- `process-document`: Document processing

**Database**: 
- User authentication handled by Supabase Auth
- Custom tables for projects, prompts, and user data
- Migration files in `supabase/migrations/`

### Styling System

**Design Tokens**: Defined in `src/index.css`
- CSS custom properties for light/dark themes
- Consistent color palette with HSL values
- Custom gradients and shadows for depth

**Component Styling**:
- Tailwind utility classes with custom design system
- shadcn/ui components use design tokens
- Mobile-first responsive design

### Key Features

1. **Multi-Framework Support**: Design Thinking, Double Diamond, Google Design Sprint, etc.
2. **AI Tool Integration**: Dynamic tool selection based on UX frameworks
3. **Project Management**: Save and organize generated prompts
4. **Custom Prompt Library**: User-created and public prompt collections
5. **Dark/Light Mode**: Complete theme system with system preference detection

### Development Notes

- Uses path aliases (`@/`) configured in `vite.config.ts`
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Lovable.dev integration for rapid development
- Custom component tagger for development mode

### API Integration

The application communicates with external AI services through Supabase Edge Functions. All API calls are authenticated and include proper error handling with user-friendly messages via toast notifications (Sonner).