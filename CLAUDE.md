# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Build application
pnpm build

# Production server
pnpm start

# Code quality
pnpm lint          # Check with Biome
pnpm lint:fix      # Fix issues with Biome
pnpm format        # Format code
pnpm format:fix    # Format and fix code
pnpm typecheck     # TypeScript type checking
```

### Database Commands
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Run database migrations
npx prisma migrate deploy

# View database in browser
npx prisma studio
```

## Architecture Overview

### Core Concept
Role Management Automation is a Next.js application that automates role management across multiple platforms (Discord, VRChat, GitHub). It uses a namespace-based system where each namespace represents a project/team with independent role management.

### Key Architecture Components

#### 1. Multi-Platform Integration (`src/lib/`)
- **Discord API** (`discord/`): Bot token authentication, guild management, role assignment
- **VRChat API** (`vrchat/`): Username/password + TOTP authentication, group management
- **GitHub API** (`github/`): App installation tokens, organization/team management
- Each service has its own `requests/`, `types/`, and authentication modules

#### 2. Database Schema (Prisma)
- **Namespace**: Project/team container with owner/admin hierarchy
- **Member**: Users within a namespace with tag-based classification
- **Tag**: Classification system for members (e.g., "developer", "admin")
- **ExternalServiceAccount**: Service credentials (Discord bot, VRChat account, GitHub app)
- **ExternalServiceGroup**: Managed groups (Discord guilds, VRChat groups, GitHub orgs)
- **ExternalServiceGroupRoleMapping**: Conditional role assignment rules

#### 3. Mapping System (`src/lib/mapping/`)
- **Conditions**: Tag-based rules (AND/OR logic) for member classification
- **Actions**: Role assignments per platform based on conditions
- **Diff Engine**: Compares current state vs desired state, generates actionable changes

#### 4. API Layer (`src/app/api/`)
- **Nested Structure**: `/api/ns/[nsId]/` - all operations scoped to namespaces
- **Permission System**: Validates user access to namespace operations
- **Error Handling**: Centralized through `src/lib/api.ts` wrapper with `BaseException`

#### 5. UI Architecture (`src/app/(dashboard)/ns/[nsId]/`)
- **App Router**: Dynamic routing with namespace context
- **Sidebar Navigation**: Persistent navigation with namespace switching
- **Breadcrumb System**: Context-aware breadcrumb with `BreadcrumbProvider`
- **Data Tables**: Reusable table components with sorting/filtering

### Data Flow Pattern
1. **Authentication**: NextAuth.js with Discord OAuth
2. **Namespace Selection**: User selects/switches between managed namespaces
3. **Configuration**: Set up service accounts, groups, tags, and mapping rules
4. **Member Management**: Add members and assign tags
5. **Diff Generation**: Compare current platform state with desired state
6. **Application**: Apply selected changes to external platforms

### External Service Patterns
- **Rate Limiting**: Each service implements `plimit` for API rate limiting
- **Authentication**: Service-specific credential management with validation
- **Error Handling**: Service-specific error types and retry logic
- **Caching**: Member resolution and service data caching strategies

### Security Considerations
- **Credential Storage**: Encrypted service credentials in database
- **Permission Validation**: `src/lib/validatePermission.ts` for namespace access
- **Namespace Isolation**: All operations scoped to prevent cross-namespace access
- **2FA Support**: TOTP implementation for VRChat accounts

### Development Patterns
- **TypeScript**: Strict typing with Zod validation schemas
- **Error Boundaries**: Consistent error handling through custom exceptions
- **API Consistency**: All API routes follow the same response pattern
- **Component Reuse**: Shared components for common UI patterns (tables, forms, displays)

## Configuration Files

### Code Quality
- **Biome**: Configured in `biome.json` with UI components excluded from linting
- **Lefthook**: Pre-commit hooks for code formatting with `lefthook.yml`
- **TypeScript**: Strict configuration in `tsconfig.json`

### Database
- **Prisma Schema**: `prisma/schema.prisma` defines the complete data model
- **Environment**: Database URL and auth secrets in `.env.local` (not committed)

### External Dependencies
- **Next.js 14**: App Router with TypeScript
- **TanStack Query**: Server state management for API calls
- **Radix UI**: Accessible component primitives
- **NextAuth.js**: Authentication with Discord provider
- **Prisma**: Type-safe database ORM with MySQL

## Important Patterns to Follow

### API Development
- Always use the `api()` wrapper from `src/lib/api.ts` for consistent error handling
- Validate user permissions with `validatePermission()` before operations
- Use Prisma helper functions from `src/lib/prisma/` rather than raw queries
- Follow the namespace-scoped URL pattern: `/api/ns/[nsId]/...`

### External Service Integration
- Use existing service modules (`discord/`, `vrchat/`, `github/`) rather than direct API calls
- Implement proper rate limiting with existing `plimit` instances
- Handle service-specific errors and validation patterns
- Use typed requests/responses defined in each service's `types/` folder

### UI Development
- Follow the existing component patterns in namespace-scoped pages
- Use the breadcrumb system for navigation context
- Implement consistent loading states and error handling
- Use existing hook patterns for data fetching and state management