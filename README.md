# Outranka

Outranka is a SERP-based content analysis app. It compares a draft or URL with the current Google results for a keyword and location, then reports search intent, competitor patterns, content gaps, structure and scannability, language alignment, and ranking opportunities. Signed-in users can save audits and download reports as PDFs.

## Requirements

- Node.js 20.9 or newer
- npm
- A [Supabase](https://supabase.com/) project for authentication and saved audits
- A [SerpAPI](https://serpapi.com/) API key for Google search results
- A [Gemini API](https://ai.google.dev/gemini-api/docs) key for AI analysis

The external services may have usage limits or charges. Check their current plans before running audits.

## Run locally

1. Clone this repository and install dependencies:

   ```sh
   npm install
   ```

2. Create a local environment file from the template:

   ```sh
   cp .env.example .env.local
   ```

3. Fill in `.env.local`:

   ```dotenv
   SERPAPI_API_KEY=your-serpapi-key
   GEMINI_API_KEY=your-gemini-api-key
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   ```

   Get the Supabase URL and publishable key from your project's API settings. The Supabase publishable key is intended for client use; keep the SerpAPI and Gemini keys private. Never commit `.env.local` or real API keys.

4. In the Supabase SQL Editor, run every SQL migration in `supabase/migrations/` in filename order. These create the `audits` table, enable row-level security, and add saved-audit fields and policies.

5. In Supabase Authentication, enable email/password sign-in. Add `http://localhost:3000/auth/callback` to the allowed redirect URLs. If you enable Google or LinkedIn sign-in, configure that provider in Supabase as well.

6. Start the development server and open [http://localhost:3000](http://localhost:3000):

   ```sh
   npm run dev
   ```

Create an account or sign in, enter a target keyword and location, then provide a page URL or paste a content draft. A URL audit requires the app server to be able to fetch that page. Failed competitor page fetches are skipped where possible.

## Production

Deploy as a Node.js Next.js application. Set the same four environment variables in the deployment environment. Add your production `/auth/callback` URL to the Supabase allowed redirect URLs, and configure any enabled auth providers for the production domain. Apply the SQL migrations to the production Supabase project before using saved audits.

Build and run the production server with:

```sh
npm run build
npm run start
```

## Project structure

- `app/` — Next.js pages, authentication callback, and API routes
- `components/` — forms, report views, and report visualizations
- `lib/` — search, page extraction, Gemini analysis, scoring, and Supabase clients
- `public/` — static assets
- `supabase/migrations/` — database schema and row-level security policies

## License

Outranka is licensed under the [MIT License](LICENSE).
