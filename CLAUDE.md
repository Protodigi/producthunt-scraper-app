# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProductHunt Scraper App - A web application that receives ProductHunt product data via webhooks from n8n workflows, stores it, and displays analysis results.

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL (Railway-hosted) with Drizzle ORM
- **Authentication**: Supabase Auth
- **UI**: NextUI components with Tailwind CSS
- **Data Fetching**: SWR
- **Validation**: Zod schemas
- **Deployment**: Railway (App + Database)

## Development Commands

Once the project is initialized, use these commands:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Database migrations (after Drizzle setup)
npm run db:push     # Push schema changes
npm run db:migrate  # Run migrations
npm run db:studio   # Open Drizzle Studio
```

## Project Architecture

The application follows Next.js App Router structure:

```
src/
├── app/                    # App Router pages and API routes
│   ├── api/               # API endpoints
│   │   ├── webhooks/      # n8n webhook receivers
│   │   ├── products/      # Product CRUD
│   │   ├── analysis/      # Analysis data
│   │   └── workflows/     # Workflow management
│   ├── auth/             # Authentication pages
│   │   ├── login/        # Login page
│   │   └── callback/     # Supabase auth callback
│   ├── products/          # Products display page
│   ├── analysis/          # AI analysis page
│   └── admin/            # Admin dashboard (protected)
├── components/           # Reusable UI components
│   └── auth/            # Auth-related components
├── lib/                 # Core utilities
│   ├── supabase/       # Supabase client setup
│   ├── db/             # Database schema (Drizzle)
│   ├── validations/    # Zod schemas
│   └── utils/          # Helper functions
├── middleware.ts        # Auth middleware for protected routes
└── types/              # TypeScript types
```

## Key Features & Implementation Notes

### 1. Webhook Integration
- Endpoint: `/api/webhooks/producthunt` - Receives n8n workflow data
- Validates incoming data with Zod schemas
- Stores in PostgreSQL database

### 2. Database Schema (Drizzle ORM)
**Railway PostgreSQL Setup:**
- Database provisioned directly in Railway project
- Automatic connection string injection via Railway environment
- Built-in connection pooling and SSL enabled
- Automatic backups and point-in-time recovery

Main tables:
- `products` - ProductHunt product data
- `analysis_results` - AI analysis from n8n
- `workflow_executions` - Workflow run history
- `workflow_configurations` - Workflow settings

### 3. API Endpoints
- `GET/POST /api/products` - Product operations
- `GET /api/analysis` - Fetch analysis results
- `GET/POST /api/workflows` - Workflow management
- `POST /api/webhooks/producthunt` - n8n webhook receiver

### 4. UI Components
- Use NextUI components consistently
- Implement responsive design for all screens
- Use SWR for data fetching with proper error handling

### 5. Supabase Authentication
- **Admin Access**: Protect `/admin` routes with Supabase Auth middleware
- **User Roles**: Implement custom claims for admin role verification
- **Session Management**: Use Supabase session handling with automatic refresh
- **Protected API Routes**: Verify Supabase JWT tokens in API endpoints
- **Auth Components**: Create login/logout UI components with NextUI

### 6. Type Safety
- Define all API responses in `types/` directory
- Use Zod for runtime validation
- Ensure proper TypeScript types for all functions

## Environment Variables

Create `.env.local` with:
```
# Railway PostgreSQL connection string
DATABASE_URL=postgresql://postgres:password@host.railway.app:port/railway
# Railway deployment config
RAILWAY_PROJECT_ID=...
RAILWAY_ENVIRONMENT=...
# Supabase Auth config
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Testing Approach

When implementing tests:
- Unit tests: React Testing Library for components
- API tests: Use supertest for endpoint testing
- E2E tests: Playwright for critical user flows
- Always test webhook validation thoroughly

## Important Specifications

Detailed requirements and design documents are in `.kiro/specs/producthunt-analyzer/`:
- `requirements.md` - User stories and acceptance criteria
- `tasks.md` - Implementation task breakdown
- `design.md` - Technical architecture details

Refer to these documents for specific implementation details and requirements.

## Implementation Improvements & Observations

After analyzing the design documents, here are key improvements to implement:

### 1. Enhanced Security
- **Authentication**: Implement Supabase Auth for admin interface with role-based access control
- **Webhook Security**: Add signature verification for n8n webhook requests
- **Rate Limiting**: Implement rate limiting using Redis to prevent API abuse
- **API Keys**: Use Supabase service keys for secure server-side operations

### 2. Performance Optimizations
- **Caching**: Use React Query instead of SWR for better caching strategies
- **Database**: Add proper indexes for common query patterns
- **Pagination**: Implement cursor-based pagination for large datasets
- **SSR**: Add server-side rendering for initial page loads

### 3. Reliability Improvements
- **Queue System**: Use BullMQ for processing failed webhooks
- **Retry Logic**: Implement exponential backoff for failed operations
- **Error Tracking**: Integrate Sentry for production error monitoring
- **Health Checks**: Add comprehensive health check endpoints

### 4. Data Management
- **Retention**: Implement automatic cleanup for old records
- **Export**: Add CSV/JSON export functionality for analysis data
- **Bulk Operations**: Enable bulk actions for product management
- **Soft Deletes**: Implement soft delete pattern for data recovery

### 5. Developer Experience
- **Docker**: Add Docker Compose for local development
- **Documentation**: Create OpenAPI/Swagger docs for all endpoints
- **Logging**: Implement structured logging with Winston
- **Seeds**: Add database seeding scripts for testing

### 6. UI/UX Enhancements
- **Real-time Updates**: Use Server-Sent Events for live data updates
- **Visualizations**: Add charts for analysis trend visualization
- **Advanced Filters**: Implement saved filter presets
- **Keyboard Shortcuts**: Add keyboard navigation for power users

### 7. Monitoring & Observability
- **Metrics**: Collect performance metrics and webhook statistics
- **Dashboards**: Create operational dashboards for system health
- **Alerts**: Set up alerting for critical errors and thresholds
- **Tracing**: Implement distributed tracing for debugging

### Implementation Priority
1. **Phase 1**: Core functionality with Supabase auth integration
2. **Phase 2**: Performance optimizations and caching
3. **Phase 3**: Advanced features and monitoring
4. **Phase 4**: UI enhancements and visualizations

### Supabase Auth Implementation Details
- **Setup**: Initialize Supabase client with environment variables
- **Middleware**: Create Next.js middleware to protect `/admin` routes
- **User Management**: Use Supabase dashboard for user administration
- **Role-Based Access**: Implement custom claims in Supabase for admin roles
- **Session Handling**: Use `@supabase/auth-helpers-nextjs` for SSR compatibility
- **API Protection**: Verify Supabase JWTs in API routes using service role key
- **Auth UI**: Use Supabase Auth UI components or build custom with NextUI

### Railway Deployment Configuration
- **Database**: PostgreSQL database provisioned as Railway service
- **Connection**: Use `DATABASE_URL` environment variable from Railway
- **Migrations**: Run Drizzle migrations on deployment via Railway build command
- **Monitoring**: Use Railway's built-in metrics for database performance
- **Scaling**: Automatic vertical scaling based on usage
- **Backups**: Daily automated backups with 7-day retention
- **SSL**: Enforced SSL connections for security

These improvements address gaps in the original design and ensure a more robust, scalable, and maintainable application.