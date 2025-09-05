# PindownAI Monorepo

A monorepo containing Next.js frontend and Node.js/Express backend.

## Structure

```
pindownai/
├── frontend/          # Next.js application
├── backend/           # Node.js/Express API server
└── package.json       # Monorepo workspace configuration
```

## Quick Start

```bash
# Install dependencies for all projects
npm run install:all

# Run both frontend and backend in development mode
npm run dev

# Build both projects
npm run build
```

## Individual Commands

### Frontend (Next.js)
```bash
cd frontend
npm run dev     # Development server on http://localhost:3000
npm run build   # Production build
```

### Backend (Node.js/Express)
```bash
cd backend
npm run dev     # Development server on http://localhost:8000
npm start       # Production server
```




