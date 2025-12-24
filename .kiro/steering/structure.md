# Project Structure

```
├── src/
│   ├── api/              # API client (Base44 SDK)
│   ├── components/
│   │   ├── ui/           # shadcn/ui primitives (DO NOT EDIT)
│   │   ├── analytics/    # Dashboard charts
│   │   ├── booking/      # Booking flow components
│   │   ├── dashboard/    # Host dashboard widgets
│   │   ├── listings/     # Listing cards, filters, wizard
│   │   ├── messaging/    # Chat interface
│   │   ├── payments/     # Stripe checkout, escrow
│   │   ├── reviews/      # Review forms and lists
│   │   └── ...           # Feature-specific components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Core utilities
│   │   ├── AuthContext   # Auth provider and hook
│   │   ├── utils.js      # cn() helper for Tailwind
│   │   └── query-client  # React Query instance
│   ├── pages/            # Route page components
│   ├── utils/            # Shared utilities
│   ├── App.jsx           # Root component with providers
│   ├── Layout.jsx        # Page layout wrapper
│   └── pages.config.js   # Route configuration
├── functions/            # Backend functions (Deno/TypeScript)
│   ├── utils/            # Shared function utilities
│   └── *.ts              # Individual function handlers
└── config files          # vite, tailwind, eslint, etc.
```

## Conventions

- **Pages**: One component per file in `src/pages/`, registered in `pages.config.js`
- **Components**: Feature-grouped in `src/components/<feature>/`
- **UI Components**: shadcn/ui in `src/components/ui/` - don't modify directly
- **Imports**: Use `@/` alias for src paths
- **Routing**: Page name becomes URL path (e.g., `ListingDetail` → `/ListingDetail`)
- **Functions**: Each backend function is a separate `.ts` file using Deno.serve()

## Data Flow

1. Components use Supabase client for CRUD operations via `supabase.from('table')`
2. React Query manages caching and refetching
3. Auth state via Supabase Auth with `onAuthStateChange` listener
4. Row Level Security (RLS) enforces data access at database level
5. Edge Functions handle Stripe webhooks and complex operations
6. Realtime subscriptions for messaging and notifications
