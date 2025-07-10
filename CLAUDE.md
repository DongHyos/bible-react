# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Bible AI PWA (Progressive Web App) built with React 19, TypeScript, and Vite. The app provides Korean Bible study capabilities with a sophisticated 3D book interface for desktop and responsive mobile views.

## Development Commands

- `npm run dev` - Start development server (Vite dev server with HMR)
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint with React hooks and TypeScript rules
- `npm run preview` - Preview production build locally

## Architecture Overview

### Responsive Design Pattern
The app uses a unique architecture with separate component trees for desktop and mobile:
- Desktop: Features a complex 3D book interface with opening animations
- Mobile: Simplified responsive layout
- Both share common components from `shared/` directory

### Key Technologies
- **React 19.1.0** with TypeScript
- **Vite 6.3.5** for build tooling and dev server
- **Tailwind CSS + CSS Modules** for styling (hybrid approach)
- **TanStack React Query** for server state management and caching
- **PWA** with service worker for offline capabilities

### Directory Structure
- `src/shared/` - Common components and utilities
- `src/desktop/` - Desktop-specific 3D book interface components
- `src/mobile/` - Mobile-specific responsive components
- TypeScript path aliases configured: `shared/`, `desktop/`, `mobile/`

### State Management & Data Flow
- **TanStack React Query** handles server state with aggressive caching (24-hour TTL)
- **Local storage** integration for recent verses tracking
- **API proxy** setup: `/api` routes proxy to `localhost:8080` in development

### Styling Architecture
- **Tailwind CSS** for utility-first styling
- **CSS Modules** for component-specific styles (especially 3D animations)
- **State-driven animations** using CSS classes and React state

## Special Considerations

### Korean Content Focus
- All UI text and content is in Korean
- Bible structure and verses are served from Korean Bible API
- Consider Korean typography and text rendering when making UI changes

### 3D Book Interface
- Complex CSS 3D transforms and animations in desktop version
- State-driven opening/closing animations with multiple CSS classes
- Performance-sensitive animations - test on lower-end devices

### PWA Requirements
- Service worker auto-updates on new builds
- Manifest configured for standalone app experience
- Consider offline functionality when adding new features

### Development Patterns
- Use TypeScript path aliases for clean imports
- Follow existing CSS Modules naming conventions for animations
- Maintain separation between desktop/mobile component trees
- Leverage React Query for any API data fetching

## Build Configuration

### Vite Configuration
- TypeScript path aliases mapped to Vite aliases
- API proxy for development environment
- PWA plugin configured with auto-update strategy

### ESLint Configuration
- Modern ESLint 9+ flat config format
- React hooks rules + TypeScript integration
- Configured for React 19 JSX transform

### TypeScript Configuration
- Strict mode enabled
- Path mapping for clean imports
- Modern target (ES2020+)