# ProductHunt Scraper App

A web application that receives ProductHunt product data via webhooks from n8n workflows, stores it, and displays analysis results.

## Features

- 📊 **Products Dashboard** - View and manage scraped ProductHunt products
- 🤖 **AI Analysis** - Display AI-powered analysis reports from n8n workflows
- 🔧 **Admin Interface** - Manage n8n workflows and configurations
- 🔐 **Authentication** - Secure access with Supabase Auth
- 🌐 **Webhook Integration** - Receive data from n8n workflows
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL (Railway-hosted) with Drizzle ORM
- **Authentication**: Supabase Auth
- **UI**: NextUI components with Tailwind CSS
- **Deployment**: Railway

## Prerequisites

- Node.js 18+ installed
- Supabase account for authentication
- Railway account for hosting
- n8n instance for workflow automation

## Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/producthunt-scraper-app.git
cd producthunt-scraper-app
npm install
```

### 2. Environment Variables

Create a `.env.local` file based on `.env.local.example`:

```bash
# Railway PostgreSQL connection string
DATABASE_URL=postgresql://postgres:password@host.railway.app:port/railway

# Railway deployment config
RAILWAY_PROJECT_ID=your-railway-project-id
RAILWAY_ENVIRONMENT=production

# Supabase Auth config
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin email (for initial admin access)
ADMIN_EMAIL=admin@example.com
```

### 3. Database Setup

Push the database schema to Railway PostgreSQL:

```bash
npm run db:push
```

Run migrations (if any):

```bash
npm run db:migrate
```

### 4. Supabase Setup

1. Create a new Supabase project
2. Enable Email/Password authentication
3. (Optional) Enable Google OAuth
4. Add your admin email to get admin access

### 5. Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API endpoints
│   ├── auth/              # Authentication pages
│   ├── products/          # Products page
│   ├── analysis/          # Analysis page
│   └── admin/            # Admin dashboard
├── components/           # Reusable UI components
├── lib/                 # Core utilities
│   ├── supabase/       # Supabase client
│   ├── db/             # Database schema
│   └── validations/    # Zod schemas
└── types/              # TypeScript types
```

## n8n Webhook Configuration

### Products Webhook

Configure your n8n workflow to send product data to:
```
POST https://your-app.railway.app/api/webhooks/products
```

Expected payload format:
```json
{
  "workflowId": 1,
  "products": [
    {
      "id": "product-123",
      "name": "Product Name",
      "tagline": "Product tagline",
      "description": "Product description",
      "url": "https://producthunt.com/posts/example",
      "votesCount": 100,
      "commentsCount": 20,
      "featured": true,
      "categories": ["productivity", "developer-tools"]
    }
  ]
}
```

### Analysis Webhook

Configure your n8n workflow to send analysis data to:
```
POST https://your-app.railway.app/api/webhooks/analysis
```

Expected payload format:
```json
{
  "workflowId": 2,
  "analysisType": "comprehensive",
  "results": {
    "summary": "Analysis summary...",
    "insights": [...],
    "metrics": {...}
  }
}
```

## API Documentation

### Authentication

All API endpoints require authentication except webhooks.

### Endpoints

- `GET /api/products` - Get products with filtering
- `POST /api/products` - Create a product
- `GET /api/analysis` - Get analysis reports
- `GET /api/workflows` - Get workflows (admin only)
- `POST /api/workflows` - Create workflow (admin only)

See the API documentation in each endpoint file for detailed usage.

## Deployment to Railway

1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy the application
4. The database will be automatically provisioned

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Database commands
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio

# Linting
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@example.com or create an issue in the GitHub repository.