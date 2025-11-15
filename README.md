# Budget Analyzer Web

> **⚠️ Work in Progress**: This project is under active development. Features and documentation are subject to change.

Modern React web application for Budget Analyzer - a personal finance management tool for tracking transactions, analyzing spending patterns, and managing budgets.

## Overview

Budget Analyzer Web is a full-featured React application that provides:

- **Transaction Management**: View, search, and filter financial transactions
- **Real-time Analytics**: Credits, debits, net balance, and spending insights
- **Multi-currency Support**: Handle transactions in different currencies
- **Responsive Design**: Mobile-first design with dark mode support
- **Advanced Table**: Sortable, filterable, and paginated transaction views

## Technology Stack

- **React 19** with modern hooks and concurrent features
- **TypeScript** for type safety
- **Vite** for lightning-fast development and builds
- **React Router v7** for client-side routing
- **TanStack Query (React Query)** for async state management
- **Redux Toolkit** for UI state
- **TanStack Table** for advanced table features
- **Tailwind CSS** for styling
- **Shadcn/UI** for accessible components
- **Axios** for API communication
- **Vitest** for testing

## Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

The application will open at `http://localhost:3000`

### Environment Configuration

Edit `.env` to configure your API endpoint:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK_DATA=true
```

Set `VITE_USE_MOCK_DATA=false` when connecting to a real backend.

## Features

### Mock Data Mode

By default, the app runs with mock data for:
- Testing UI without a backend
- Independent feature development
- Simulating API errors and edge cases

### Transaction List

- Summary cards with financial statistics
- Searchable and sortable transaction table
- Pagination controls
- Click rows to view details

### Dark Mode

Toggle between light and dark themes using the theme toggle. Preference is saved to localStorage.

### Error Handling

Comprehensive error handling with:
- Network error recovery
- User-friendly error messages
- Retry functionality
- Error boundaries for graceful degradation

## Development

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run format    # Format with Prettier
npm test          # Run tests
npm run test:ui   # Run tests with UI
```

### Project Structure

```
src/
├── api/                    # API client and endpoints
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   └── ...               # Feature components
├── hooks/                # Custom React hooks
├── pages/                # Page components
├── store/                # Redux store
├── types/                # TypeScript types
└── lib/                  # Utilities
```

### Code Quality

- **ESLint** for code quality
- **Prettier** for formatting
- **TypeScript** for type safety
- **Vitest** for unit testing
- **React Testing Library** for component testing

## API Integration

### Connecting to Backend

Update `.env` to point to your backend:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK_DATA=false
```

### Expected Endpoints

- `GET /transactions` - List all transactions
- `GET /transactions/{id}` - Get single transaction
- `GET /currencies` - List currencies
- `GET /exchange-rates` - Get exchange rates

### Error Format

The app expects RFC 7807-inspired error responses:

```json
{
  "type": "not_found",
  "title": "Transaction Not Found",
  "status": 404,
  "detail": "Transaction with ID 123 could not be located",
  "instance": "/transactions/123",
  "timestamp": "2025-10-20T12:00:00Z"
}
```

## Architecture

### State Management

- **React Query**: Server state (API data, caching, loading states)
- **Redux Toolkit**: Client state (theme, UI preferences)

This separation provides optimal performance and developer experience.

### Component Strategy

Using Shadcn/UI for:
- Copy-paste components (no package bloat)
- Full customization control
- Tailwind CSS integration
- Built-in accessibility

## Deployment

Build for production:

```bash
npm run build
```

The optimized files will be in `dist/`. Deploy to any static hosting:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## Integration

This frontend integrates with the Budget Analyzer microservices:
- **Transaction Service** for transaction data
- **Currency Service** for currency and exchange rates
- **API Gateway** (NGINX) for unified routing

See the [orchestration repository](https://github.com/budget-analyzer/orchestration) for full system setup.

## Related Repositories

- **Orchestration**: https://github.com/budget-analyzer/orchestration
- **Service Common**: https://github.com/budget-analyzer/service-common
- **Transaction Service**: https://github.com/budget-analyzer/transaction-service
- **Currency Service**: https://github.com/budget-analyzer/currency-service

## License

MIT

## Contributing

This project is currently in early development. Contributions, issues, and feature requests are welcome as we build toward a stable release.
