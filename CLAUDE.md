# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

Microfeed is a lightweight CMS self-hosted on Cloudflare that generates feeds (web, RSS, JSON). The application uses a hybrid architecture with both edge-side rendering and client-side React components:

### Directory Structure
- `edge-src/` - Server-side components that run on Cloudflare Workers/Pages
- `client-src/` - Client-side React components that get bundled by webpack
- `common-src/` - Shared utilities and constants used by both edge and client code
- `functions/` - Cloudflare Pages Functions using file-based routing
- `ops/` - Operational scripts for database initialization and deployment
- `public/` - Static assets and webpack build output

### Data Architecture
- **D1 Database**: SQLite database with tables for `channels`, `items`, `settings`, and `comments`
- **R2 Storage**: Media file storage (images, audio, video, documents)
- **Mustache Templating**: Uses mustache.js for rendering web pages with theme customization

### Code Organization
- Edge components (server-side) are in `edge-src/Edge*App/` directories
- Client components are in `client-src/Client*App/` directories
- Database operations are handled by `FeedDb.js` and `FeedCrudManager.js`
- Theme system allows custom HTML/CSS via `Theme.js` and default templates in `edge-src/common/default_themes/`

## Development Commands

### Local Development
```bash
# Start development server (runs both edge and client dev servers)
yarn dev

# Setup development environment
yarn setup:development

# Start only the edge server (Cloudflare Workers)
yarn dev:edge

# Start only the client dev server (webpack)
yarn dev:client
```

### Building and Testing
```bash
# Build for production
yarn build:production

# Run tests
yarn test

# Run specific test with Jest
yarn test FeedCrudManager.test.js
```

### Database Operations
```bash
# Initialize database with schema
node ops/init_feed_db.js

# Execute SQL file on local D1 database
yarn wrangler d1 execute FEED_DB --local -e development --file ops/db/init.sql

# Execute SQL file on remote D1 database
yarn wrangler d1 execute FEED_DB --remote --file ops/db/init.sql
```

### Deployment
```bash
# Deploy to Cloudflare Pages
yarn deploy:cloudflare

# Deploy via GitHub Actions (alternative)
yarn deploy:github

# Setup production environment
yarn setup:production
```

## Key Architecture Patterns

### Dual Rendering System
The application uses both server-side rendering (edge components) and client-side React components. Edge components handle initial page rendering and SEO, while client components provide interactive functionality.

### File-Based Routing
The `functions/` directory uses Cloudflare Pages file-based routing:
- `/i/[slug]/` - Individual item pages
- `/admin/` - Admin dashboard pages  
- `/api/` - API endpoints
- Dynamic routes use bracket notation like `[itemId]`

### Database Access Pattern
All database operations go through the `FeedDb` class which provides:
- SQL query builders (`getInsertSql`, `getUpdateSql`, `getUpsertSql`)
- Content fetching with pagination and filtering
- Support for SQLite JSON data columns

### Theme System
Themes are stored as JSON in the database and can be customized via:
- Mustache templates for different page types (web_item.html, web_feed.html, etc.)
- Default themes in `edge-src/common/default_themes/`
- Runtime theme selection and rendering via `Theme.js`

## Development Notes

### Webpack Configuration
Client-side apps are defined in `webpack.config.js` entry points:
- Each `Client*App` becomes a separate bundle
- Uses SWC for fast JavaScript compilation
- CSS is extracted via MiniCssExtractPlugin

### Environment Variables
Required environment variables (set in `.vars.toml` for local development):
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `CLOUDFLARE_API_TOKEN` - API token with Pages and D1 permissions
- `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` - R2 storage credentials
- `CLOUDFLARE_PROJECT_NAME` - Pages project name

### Constants and Configuration
All application constants are centralized in `common-src/Constants.js` including:
- Status codes for items and channels
- Settings categories and navigation items
- File type mappings and supported enclosure categories

### Testing
Jest is configured with SWC for fast test execution. Tests are located next to their source files (e.g., `FeedCrudManager.test.js`).