# SearchSphere

A production-quality search engine that crawls websites, builds an inverted index, ranks documents using TF-IDF and PageRank-style scoring, and delivers a modern search experience.

## Architecture

```
Crawler → Content Extraction → Tokenizer → Stop Word Removal → Indexer
    → PostgreSQL → Search Engine → Ranking Engine → REST API → React Frontend
```

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React, React Router, Axios, TailwindCSS, Context API |
| Backend    | Node.js, Express.js                 |
| Database   | PostgreSQL (Neon)                   |
| Deployment | Vercel (frontend), Render (backend) |

## Features

### Phase 1 — MVP Search Engine
- URL submission and validation
- Single-page HTML crawling and content extraction
- Tokenization with lowercase normalization and punctuation removal
- Stop word removal
- Term frequency calculation
- Inverted index generation (PostgreSQL)
- Search endpoint with pagination (10 results/page)
- Search results page with title, URL, and snippet

### Phase 2 — Ranking Engine
- TF-IDF scoring
- Relevance score display
- Keyword highlighting in results

### Phase 3 — Advanced Search
- Phrase search (`"machine learning"`)
- Boolean search (`react AND node`, `react OR vue`, `react NOT angular`)
- Multi-keyword search
- Fuzzy search with Levenshtein distance
- Autocomplete with debounced suggestions

### Phase 4 — Advanced Crawling
- Recursive crawling with max depth
- Domain restriction
- SHA-256 duplicate content detection
- robots.txt support
- Retry mechanism and timeout handling

### Phase 5–9 — Additional
- Incremental indexing (content hash comparison)
- Analytics dashboard with metrics and charts
- JWT authentication
- Bookmarks and search history
- Title/exact-match/recency ranking boosts
- Connection pooling, compression, rate limiting, Helmet security
- Code splitting and lazy-loaded routes

## Project Structure

```
SearchSphere/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection pool
│   │   ├── db/             # Schema and migrations
│   │   ├── middleware/     # Auth, rate limiting, error handling
│   │   ├── routes/         # REST API endpoints
│   │   ├── services/       # Crawler, indexer, search, ranking
│   │   └── utils/          # Tokenizer, stop words, Levenshtein
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Theme and auth providers
│   │   └── pages/          # Route pages
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Neon](https://neon.tech))

### 1. Database Setup

Create a PostgreSQL database and copy the connection string.

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
npm run migrate
```

### 2. Backend

```bash
cd backend
npm run dev
```

API runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173`.

### 4. Index Your First Page

1. Open `http://localhost:5173/crawl`
2. Submit a URL (e.g. `https://example.com`)
3. Search for content on the landing page

## API Endpoints

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q=term&page=1` | Search indexed pages |
| GET | `/api/search/autocomplete?q=term` | Autocomplete suggestions |

### Crawler
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/crawl/submit` | Submit URL for crawling |
| GET | `/api/crawl/pages` | List crawled pages |
| GET | `/api/crawl/history` | Crawl history log |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard metrics |
| GET | `/api/analytics/searches-over-time` | Search volume chart data |
| GET | `/api/analytics/top-terms` | Top searched queries |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/history` | Search history (auth required) |

### Bookmarks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookmarks` | List bookmarks |
| POST | `/api/bookmarks` | Add bookmark |
| DELETE | `/api/bookmarks/:pageId` | Remove bookmark |

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-api.onrender.com/api`

### Backend (Render)

1. Create a new Web Service
2. Set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Environment variables:
   - `DATABASE_URL` — Neon connection string
   - `JWT_SECRET` — strong random secret
   - `PORT` — `5000`
   - `CORS_ORIGIN` — your Vercel URL
   - `NODE_ENV` — `production`

### Database (Neon)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL`
3. Run migrations: `npm run migrate`

## Testing

```bash
cd backend
npm test
```

## Search Query Examples

```
machine learning              # multi-keyword
"machine learning"            # phrase search
react AND node                # boolean AND
react OR vue                  # boolean OR
react NOT angular             # boolean NOT
javscript                     # fuzzy → javascript
```

## Resume Highlights

- **Search Engine Architecture**: Full pipeline from crawl to ranked results
- **Information Retrieval**: TF-IDF, inverted index, boolean/phrase/fuzzy search
- **Database Systems**: PostgreSQL schema with optimized indexes and connection pooling
- **Web Crawling**: Recursive crawl, robots.txt, duplicate detection, retry logic
- **System Design**: Rate limiting, caching-ready architecture, incremental indexing
- **Full-Stack**: React SPA with dark mode, auth, analytics dashboard
- **Production Deployment**: Vercel + Render + Neon
