# InventoryPro Frontend

Modern, enterprise-grade inventory management system built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Next.js 14 App Router** - Modern React framework with server components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Query** - Powerful data fetching and caching
- **Zustand** - Lightweight state management
- **Axios** - HTTP client with interceptors
- **React Hook Form + Zod** - Form handling and validation
- **Recharts** - Data visualization
- **Lucide React** - Icon library

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes (login, register)
│   │   ├── (dashboard)/       # Dashboard routes (protected)
│   │   │   ├── products/
│   │   │   ├── inventory/
│   │   │   ├── suppliers/
│   │   │   ├── customers/
│   │   │   ├── purchase-orders/
│   │   │   ├── sales-orders/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Layout components (Sidebar, Header, Footer)
│   │   ├── shared/            # Shared components
│   │   └── features/          # Feature-specific components
│   ├── lib/
│   │   ├── api.ts             # Axios instance with interceptors
│   │   ├── auth.ts            # Authentication API calls
│   │   └── utils.ts           # Utility functions
│   ├── hooks/                 # Custom React hooks
│   ├── store/
│   │   └── authStore.ts       # Zustand auth store
│   ├── types/                 # TypeScript type definitions
│   └── constants/             # Application constants
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local.example
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Update environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

### Linting & Formatting

Lint code:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

## Features Implemented

### Authentication
- Login page with form validation
- Register page with password confirmation
- JWT token management with automatic refresh
- Protected routes with authentication guards
- Zustand store for auth state management

### Dashboard
- Overview with key metrics and stats
- Responsive sidebar navigation
- Header with search and user menu
- Footer component

### Pages (with placeholder UI)
- Products management
- Inventory tracking
- Suppliers management
- Customers management
- Purchase orders
- Sales orders
- Reports generation
- Settings

### API Client
- Axios instance with base configuration
- Request interceptor for auth tokens
- Response interceptor for token refresh
- Automatic retry on 401 errors
- Error handling utilities

### UI Components (shadcn/ui)
- Button
- Input
- Card
- Table
- Badge
- Label

### Styling
- Modern color scheme with CSS variables
- Dark mode support (ready to implement)
- Responsive design
- Tailwind CSS utilities
- Custom theme configuration

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| React Query | Data fetching |
| Zustand | State management |
| Axios | HTTP client |
| React Hook Form | Form handling |
| Zod | Validation |
| Recharts | Charts |
| Lucide React | Icons |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:5000/api/v1 |

## Next Steps

To fully implement the inventory management system:

1. Connect pages to real API endpoints
2. Implement CRUD operations for all entities
3. Add form validation with React Hook Form + Zod
4. Implement data tables with sorting/filtering
5. Add charts and visualizations with Recharts
6. Implement real-time updates with WebSockets
7. Add unit and integration tests
8. Implement error boundaries
9. Add loading skeletons
10. Optimize performance

## License

ISC
