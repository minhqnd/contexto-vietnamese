# Contexto Vietnamese - AI Coding Guidelines

## Architecture Overview
This is a Next.js 16 app implementing a Vietnamese version of the Contexto word association game. The app uses the App Router with API routes serving game data from pre-computed JSON files in `lib/contexto/`. Each game category has a JSON file containing a `keyword` (secret word) and `rank_map` (word -> semantic similarity rank).

**Key Components:**
- `components/contexto/contexto-game.tsx`: Main game component using `useContextoGame` hook
- `app/api/contexto/route.ts`: API endpoint handling guesses, hints, and closest words with Vietnamese text normalization
- `lib/contexto/*.json`: Game data files (e.g., `am_nhac.json`) with semantic rankings
- `scripts/ranking_pipeline.py`: Daily ranking generation using sentence transformers and FAISS

## Development Workflow
- **Start dev server**: `pnpm dev` (runs on localhost:3000)
- **Build**: `pnpm build` (production build)
- **Lint**: `pnpm lint` (ESLint with Next.js config)
- **Daily rankings**: Automated via `.github/workflows/daily-ranking.yml` using Python embeddings

## Code Patterns
- **State management**: Use `useContextoGame` hook for all game logic; avoid direct state manipulation
- **API calls**: Fetch from `/api/contexto` with query params (`id`, `guess`, `hint`, `closest`)
- **Data persistence**: Use `storage.ts` functions for localStorage; games auto-save progress
- **Vietnamese handling**: Always normalize text using the `normalizeVietnamese` function in API routes
- **Caching**: API uses LRU cache for game data (max 20 games) to handle Vercel serverless limits
- **UI components**: Use shadcn/ui components from `components/ui/`; follow Tailwind classes

## Game Logic
- **Guesses**: Words ranked by semantic similarity (1 = exact match, higher = less similar)
- **Hints**: Progressive ranges (1001-2000, 701-1000, etc.) showing word count in each range
- **Closest words**: Top 10 most similar words to help players
- **Game selection**: Auto-selects latest unplayed game; tracks completion in localStorage

## File Organization
- `components/contexto/modules/`: Game-specific components and utilities
- `lib/contexto/`: Game data and ranking files
- `scripts/`: Python pipeline for generating rankings
- `.github/workflows/`: CI/CD for daily ranking updates

## Common Tasks
- **Add new game category**: Create new JSON file in `lib/contexto/` with keyword and rank_map
- **Update rankings**: Run `scripts/ranking_pipeline.py` locally or wait for daily workflow
- **Modify game UI**: Edit components in `components/contexto/modules/` and update `useContextoGame` hook
- **API changes**: Update `app/api/contexto/route.ts` and ensure cache invalidation logic</content>
<parameter name="filePath">/Users/minhqnd/CODE/contexto-vietnamese/.github/copilot-instructions.md