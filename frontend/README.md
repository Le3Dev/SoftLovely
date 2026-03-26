StoryOfUs frontend (Next.js + Tailwind)

Run locally:

1. Install dependencies

   npm install

2. Copy environment example and adjust if needed

   copy .env.local.example .env.local

3. Start dev server

   npm run dev

By default the frontend will call the backend API at the URL in `NEXT_PUBLIC_API_BASE_URL` (defaults to http://localhost:8080). Ensure the backend is running (Spring Boot) before trying to load a couple page.

Notes:
- This is a minimal preview designed for evaluation. It consumes these backend endpoints:
  - GET /couples/{slug}
  - GET /partners/{coupleId}
  - GET /events/{coupleId}
  - POST /ai/generate-story/{slug}
- If you need CORS adjustments, the backend now includes a permissive config for dev.

