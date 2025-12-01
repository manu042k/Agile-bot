# NFrontend

This directory contains the Next.js frontend application for the Agile-bot platform. It provides a modern, responsive user interface for project management, task generation, and team collaboration.

## Overview

The frontend is built with Next.js 14 and React 18, featuring:
- Server-side rendering (SSR) and static site generation (SSG)
- Modern UI components with Shadcn/ui and Radix UI
- Responsive design with Tailwind CSS
- NextAuth.js for authentication
- Real-time WebSocket connections
- PDF document viewing and processing
- Drag-and-drop task management
- Interactive charts and visualizations

## Architecture

### Directory Structure

- **src/app/**: Next.js app directory
  - Page routes and layouts
  - API routes for NextAuth
  - Provider components

- **src/components/**: Reusable React components
  - UI components (buttons, dialogs, forms)
  - Feature components (task cards, project views)
  - Layout components (navigation, sidebars)

- **src/lib/**: Utility functions and configurations
  - API client setup
  - Authentication helpers
  - Utility functions

- **src/styles/**: Global styles and Tailwind configuration

- **public/**: Static assets
  - Images and icons
  - Fonts
  - Favicon

## Features

### Authentication
- Email/password authentication
- Google OAuth integration
- JWT token management
- Automatic token refresh
- Protected routes
- Session persistence

### Project Management
- Create and manage projects
- Upload requirement documents (PDF, DOCX)
- View project overview and statistics
- Project member management
- Document preview with PDF viewer

### Task Management
- View generated user stories
- Edit task details and acceptance criteria
- Assign story points and priorities
- Set task dependencies
- Drag-and-drop task organization
- Task filtering and search

### Sprint Planning
- Create and manage sprints
- Allocate tasks to sprints
- Track sprint capacity
- View sprint progress
- Sprint velocity charts

### Team Collaboration
- Create and join teams
- Invite team members via email
- Role-based access control
- Team capacity planning
- Member profiles

### Real-time Updates
- WebSocket connections for live updates
- Real-time task generation progress
- Live collaboration notifications
- Document processing status

### Document Viewing
- PDF document viewer
- Zoom and navigation controls
- Page thumbnails
- Search within documents
- Highlight and annotations

## Technologies Used

### Core Framework
- **Next.js 14**: React framework with SSR/SSG
- **React 18**: UI library
- **TypeScript 5**: Type-safe JavaScript

### UI Components
- **Shadcn/ui**: Customizable component collection
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Tailwind CSS 3**: Utility-first CSS framework
- **tailwindcss-animate**: Animation utilities

### Authentication
- **NextAuth.js 4**: Authentication for Next.js
- **js-cookie**: Cookie management
- **bcryptjs**: Password hashing

### Forms & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Form validation resolvers

### Data Visualization
- **Recharts**: Chart library
- **React Flow**: Node-based UI

### Document Handling
- **React PDF**: PDF rendering
- **@react-pdf-viewer**: PDF viewer components
- **pdfjs-dist**: PDF.js library

### UI Interactions
- **@dnd-kit**: Drag and drop toolkit
- **cmdk**: Command menu
- **react-select**: Select component
- **react-day-picker**: Date picker

### HTTP & WebSockets
- **Axios**: HTTP client
- **WebSocket API**: Real-time communication

### Utilities
- **date-fns**: Date manipulation
- **clsx**: Conditional classnames
- **tailwind-merge**: Merge Tailwind classes
- **react-hot-toast**: Toast notifications
- **react-markdown**: Markdown rendering

## Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Backend API running (see Backend README)

### Installation

1. Navigate to the NFrontend directory:
```bash
cd NFrontend
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

Note: `--legacy-peer-deps` flag is used to handle peer dependency conflicts.

3. Configure environment variables:
```bash
cp .env.production.template .env.local
# Edit .env.local with your configuration
```

### Running the Application

#### Development Mode

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

#### Production Build

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

#### Linting

Run ESLint:
```bash
npm run lint
```

### Docker Deployment

Build and run with Docker:
```bash
docker build -t agilebot-frontend .
docker run -p 3000:3000 agilebot-frontend
```

Or use Docker Compose from the root directory:
```bash
docker-compose up frontend
```

## Configuration

### Environment Variables

Key configuration options in `.env.local`:

#### NextAuth Configuration
- `NEXTAUTH_URL`: Application URL (e.g., http://localhost:3000)
- `NEXTAUTH_SECRET`: Secret for session encryption (generate with `openssl rand -base64 32`)
- `NEXTAUTH_SESSION_MAX_AGE`: Session max age in seconds (default: 43200 = 12 hours)
- `NEXTAUTH_SESSION_UPDATE_AGE`: Session update interval in seconds (default: 3600 = 1 hour)

#### Google OAuth
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

#### API Configuration
- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., http://localhost:8000)
- `NEXT_PUBLIC_WS_URL`: WebSocket URL (e.g., ws://localhost:8000)

Note: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Application Structure

### Pages

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard
- `/projects` - Projects list
- `/projects/[id]` - Project details
- `/projects/[id]/tasks` - Task management
- `/projects/[id]/sprints` - Sprint planning
- `/teams` - Teams management
- `/teams/[id]` - Team details
- `/profile` - User profile

### Key Components

#### UI Components
- `Button`: Customizable button component
- `Dialog`: Modal dialog
- `Form`: Form components with validation
- `Input`: Text input field
- `Select`: Dropdown select
- `Toast`: Notification toasts
- `Card`: Content card
- `Tabs`: Tabbed interface
- `Progress`: Progress bar

#### Feature Components
- `ProjectCard`: Project overview card
- `TaskCard`: Task display card
- `TaskForm`: Task creation/editing form
- `SprintBoard`: Sprint planning board
- `TeamMemberList`: Team member display
- `DocumentViewer`: PDF document viewer
- `ProgressTracker`: Task generation progress

### API Integration

The frontend communicates with the backend through:

1. **REST API**: HTTP requests using Axios
   - Authentication endpoints
   - CRUD operations
   - File uploads

2. **WebSocket**: Real-time updates
   - Task generation progress
   - Live notifications
   - Collaboration updates

Example API client setup:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Authentication Flow

1. User logs in via email/password or Google OAuth
2. NextAuth.js creates a session
3. JWT token stored in secure HTTP-only cookie
4. Token included in API requests
5. Automatic token refresh before expiration
6. Protected routes redirect to login if unauthenticated

### State Management

The application uses:
- React Context for global state (auth, theme)
- React hooks (useState, useEffect) for local state
- Custom hooks for reusable logic
- URL parameters for shareable state

### Styling

Tailwind CSS utility classes are used throughout:
```tsx
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  Click me
</button>
```

Custom components use the `cn()` utility to merge classes:
```tsx
import { cn } from '@/lib/utils';

<div className={cn('base-class', conditional && 'conditional-class')} />
```

## Development Guidelines

### Component Structure

Follow this pattern for new components:
```tsx
import { FC } from 'react';

interface ComponentProps {
  // Props definition
}

export const Component: FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  
  return (
    // JSX
  );
};
```

### Adding New Pages

1. Create file in `src/app/[route]/page.tsx`
2. Export default component
3. Add metadata export for SEO
4. Implement page logic

### Adding UI Components

Shadcn/ui components can be added with:
```bash
npx shadcn-ui@latest add [component-name]
```

This copies the component source to your project for customization.

### API Calls

Create API functions in separate files:
```typescript
// src/lib/api/projects.ts
export const getProjects = async () => {
  const response = await api.get('/api/projects/');
  return response.data;
};
```

Use in components with error handling:
```tsx
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  getProjects()
    .then(setProjects)
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);
```

### WebSocket Integration

Connect to WebSocket for real-time updates:
```typescript
const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/tasks/${projectId}/`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle update
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// Clean up on unmount
return () => ws.close();
```

## Customization

### Theme

Customize colors in `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    },
  },
}
```

### Fonts

Add custom fonts in `src/app/layout.tsx`:
```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
```

### Components

Shadcn/ui components are fully customizable since they're copied to your project. Edit them in `src/components/ui/`.

## Performance Optimization

- Use Next.js Image component for optimized images
- Implement code splitting with dynamic imports
- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Optimize bundle size with tree shaking
- Use server components where possible
- Implement proper caching strategies



### Docker Production

Build production image:
```bash
docker build -t agilebot-frontend -f dockerfile .
docker run -p 3000:3000 agilebot-frontend
```

### Static Export

For static hosting:
```bash
npm run build
# Output in 'out' directory
```

