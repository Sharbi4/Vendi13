# Tech Stack

## Frontend

- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **State/Data**: TanStack React Query for server state
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui (New York style, JSX, Radix primitives)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Maps**: React Leaflet

## Backend

- **Platform**: Supabase (PostgreSQL, Auth, Edge Functions)
- **SDK**: @supabase/supabase-js for database, auth, and realtime
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Functions**: Supabase Edge Functions (Deno runtime)
- **Payments**: Stripe (Connect, Checkout, Identity, Subscriptions)
- **Realtime**: Supabase Realtime for messaging and notifications

## Key Libraries

- `date-fns` / `moment` - Date handling
- `lodash` - Utilities
- `fuse.js` - Fuzzy search
- `jspdf` / `html2canvas` - PDF generation
- `sonner` / `react-hot-toast` - Notifications
- `react-quill` - Rich text editor

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint
npm run lint:fix

# Type check
npm run typecheck

# Preview production build
npm run preview
```

## Environment

- Node.js with ES modules (`"type": "module"`)
- Path aliases via `@/` prefix (configured in vite/jsconfig)
- Functions use Deno with npm: imports
