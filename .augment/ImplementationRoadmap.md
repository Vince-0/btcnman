# Bitcoin Node Manager - Implementation Roadmap for AI-Assisted Development

This document provides a structured roadmap for implementing Bitcoin Node Manager with AI assistance. It's designed to guide Augment Code through the development process by providing clear context, implementation patterns, and decision points.

## Project Overview

Bitcoin Node Manager is being reimplemented as a modern web application while preserving the core functionality of the original PHP application. The new implementation will use React, Next.js, Node.js, and SQLite to create a more maintainable, secure, and user-friendly application.

## Development Approach

The implementation will follow these principles:

1. **Incremental Development**: Build features in small, testable increments
2. **Component-Based Architecture**: Create reusable components with clear interfaces
3. **Type Safety**: Use TypeScript for better code quality and developer experience
4. **Test-Driven Development**: Write tests before or alongside implementation
5. **Clean Code**: Follow best practices for readability and maintainability

## Implementation Sequence

This sequence is designed to build the application in logical layers, starting with the foundation and progressively adding features.

### 1. Project Scaffolding

**Goal**: Set up the basic project structure and development environment.

**Implementation Notes**:
- Use `create-next-app` with TypeScript template for the frontend
- Use `express-generator-typescript` for the backend
- Configure ESLint and Prettier with strict rules
- Set up a monorepo structure with shared types

**Example Commands**:
```bash
# Frontend setup
npx create-next-app@latest frontend --typescript --tailwind --eslint
cd frontend
npm install react-query @tanstack/react-table chart.js react-chartjs-2

# Backend setup
mkdir backend
cd backend
npm init -y
npm install express cors helmet dotenv jsonwebtoken bcrypt prisma sqlite3
npm install --save-dev typescript @types/node @types/express @types/cors
```

**Decision Points**:
- Monorepo vs. separate repositories
- File/folder structure conventions
- Naming conventions for components, functions, and files

### 2. Database Schema and ORM Setup

**Goal**: Define the database schema and set up Prisma ORM.

**Implementation Notes**:
- Define Prisma schema based on the data model
- Create initial migrations
- Implement seed data for development
- Create database utility functions

**Example Schema**:
```prisma
// schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Rule {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  conditions  String    // JSON string
  actions     String    // JSON string
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  RuleLog     RuleLog[]
}

model RuleLog {
  id          Int      @id @default(autoincrement())
  ruleId      Int
  rule        Rule     @relation(fields: [ruleId], references: [id])
  triggeredAt DateTime @default(now())
  peerInfo    String?  // JSON string
  actionTaken String?
  result      String?
}

// Additional models...
```

**Decision Points**:
- SQLite file location and access permissions
- JSON storage strategy for complex objects
- Index creation for performance optimization
- Migration strategy for future updates

### 3. Authentication System

**Goal**: Implement user authentication with JWT.

**Implementation Notes**:
- Create user model and authentication service
- Implement password hashing with bcrypt
- Create JWT generation and validation utilities
- Implement authentication middleware
- Create login/logout API endpoints

**Example Authentication Flow**:
```typescript
// backend/src/services/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function validateUser(username: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;
  
  return user;
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export async function verifyToken(token: string): Promise<any> {
  return jwt.verify(token, JWT_SECRET);
}
```

**Decision Points**:
- Token storage strategy (cookies vs. localStorage)
- Token refresh mechanism
- Password complexity requirements
- Session duration and expiration handling

### 4. Bitcoin Core RPC Integration

**Goal**: Create a service layer for communicating with Bitcoin Core.

**Implementation Notes**:
- Use bitcoin-core npm package for RPC communication
- Create service methods for common operations
- Implement error handling and retry logic
- Add caching for frequently accessed data
- Create TypeScript interfaces for RPC responses

**Example Implementation**:
```typescript
// backend/src/services/bitcoin.service.ts
import Client from 'bitcoin-core';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 }); // Cache for 60 seconds

const client = new Client({
  network: process.env.BITCOIN_NETWORK || 'mainnet',
  username: process.env.BITCOIN_RPC_USER,
  password: process.env.BITCOIN_RPC_PASSWORD,
  host: process.env.BITCOIN_RPC_HOST || '127.0.0.1',
  port: parseInt(process.env.BITCOIN_RPC_PORT || '8332'),
});

export async function getNodeInfo() {
  const cacheKey = 'node_info';
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    const [networkInfo, blockchainInfo, mempoolInfo] = await Promise.all([
      client.getNetworkInfo(),
      client.getBlockchainInfo(),
      client.getMempoolInfo(),
    ]);

    const result = {
      version: networkInfo.version,
      protocolVersion: networkInfo.protocolversion,
      blocks: blockchainInfo.blocks,
      headers: blockchainInfo.headers,
      difficulty: blockchainInfo.difficulty,
      mempool: {
        size: mempoolInfo.size,
        bytes: mempoolInfo.bytes,
      },
      connections: networkInfo.connections,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching node info:', error);
    throw new Error('Failed to fetch Bitcoin node information');
  }
}

// Additional methods for peer management, block info, etc.
```

**Decision Points**:
- Error handling strategy for RPC failures
- Caching duration for different types of data
- Retry strategy for intermittent failures
- Handling of version-specific RPC methods

### 5. API Layer

**Goal**: Create RESTful API endpoints for frontend communication.

**Implementation Notes**:
- Organize routes by resource type
- Implement middleware for authentication and validation
- Use consistent error handling
- Add request validation with Zod or Joi
- Implement rate limiting for security

**Example API Structure**:
```typescript
// backend/src/routes/dashboard.routes.ts
import express from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import * as dashboardController from '../controllers/dashboard.controller';

const router = express.Router();

router.get('/summary', authenticateJWT, dashboardController.getSummary);
router.get('/stats', authenticateJWT, dashboardController.getDetailedStats);

export default router;

// backend/src/controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import * as bitcoinService from '../services/bitcoin.service';

export async function getSummary(req: Request, res: Response) {
  try {
    const nodeInfo = await bitcoinService.getNodeInfo();
    const peerCount = await bitcoinService.getPeerCount();
    
    res.json({
      nodeInfo,
      peerCount,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error in dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}

// Additional controller methods...
```

**Decision Points**:
- API versioning strategy
- Error response format
- Pagination implementation for list endpoints
- Request validation approach

### 6. Frontend Components

**Goal**: Create reusable UI components for the application.

**Implementation Notes**:
- Create atomic design components (atoms, molecules, organisms)
- Implement responsive design with Tailwind CSS
- Create custom hooks for data fetching and state management
- Use TypeScript interfaces for props and state

**Example Component**:
```tsx
// frontend/components/ui/Card.tsx
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  children, 
  className = '', 
  actions 
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
```

**Decision Points**:
- Component library organization
- State management approach
- Styling methodology within Tailwind
- Accessibility implementation

### 7. Data Fetching and State Management

**Goal**: Implement data fetching and state management for the frontend.

**Implementation Notes**:
- Use React Query for server state management
- Create custom hooks for API communication
- Implement optimistic updates for better UX
- Add error handling and loading states

**Example Implementation**:
```tsx
// frontend/hooks/useDashboard.ts
import { useQuery } from 'react-query';
import { api } from '../lib/api';

interface DashboardSummary {
  nodeInfo: {
    version: number;
    protocolVersion: number;
    blocks: number;
    headers: number;
    difficulty: number;
    mempool: {
      size: number;
      bytes: number;
    };
    connections: number;
  };
  peerCount: number;
  timestamp: string;
}

export function useDashboardSummary() {
  return useQuery<DashboardSummary>(
    ['dashboard', 'summary'],
    async () => {
      const response = await api.get('/api/dashboard/summary');
      return response.data;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );
}
```

**Decision Points**:
- Caching strategy for different types of data
- Refetch intervals for real-time data
- Error handling and retry strategy
- Loading state visualization

### 8. Page Implementation

**Goal**: Create the application pages using the components and hooks.

**Implementation Notes**:
- Use Next.js pages for routing
- Implement layout components for consistent UI
- Add authentication checks for protected routes
- Create error boundaries for graceful error handling

**Example Page**:
```tsx
// frontend/pages/dashboard.tsx
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { NodeStatusCard } from '../components/dashboard/NodeStatusCard';
import { PeerSummaryCard } from '../components/dashboard/PeerSummaryCard';
import { BlockchainCard } from '../components/dashboard/BlockchainCard';
import { MempoolCard } from '../components/dashboard/MempoolCard';
import { useDashboardSummary } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, error } = useDashboardSummary();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) return <div>Checking authentication...</div>;
  if (!isAuthenticated) return null;

  return (
    <Layout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <NodeStatusCard isLoading={isLoading} data={data?.nodeInfo} />
        <PeerSummaryCard isLoading={isLoading} peerCount={data?.peerCount} />
        <BlockchainCard isLoading={isLoading} data={data?.nodeInfo} />
        <MempoolCard isLoading={isLoading} data={data?.nodeInfo?.mempool} />
      </div>
      
      {/* Additional dashboard content */}
    </Layout>
  );
};

export default Dashboard;
```

**Decision Points**:
- Page organization and routing strategy
- Authentication flow and protected routes
- Error handling at the page level
- Loading state visualization

### 9. WebSocket Integration

**Goal**: Implement real-time updates using WebSockets.

**Implementation Notes**:
- Use Socket.io for WebSocket communication
- Create authentication for WebSocket connections
- Implement event-based updates
- Add reconnection handling

**Example Implementation**:
```typescript
// backend/src/services/socket.service.ts
import { Server } from 'socket.io';
import http from 'http';
import { verifyToken } from './auth.service';

export function initializeSocketServer(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = await verifyToken(token);
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribe', (channel) => {
      socket.join(channel);
      console.log(`Client ${socket.id} subscribed to ${channel}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function broadcastNodeUpdate(io: Server, data: any) {
  io.to('node_updates').emit('node_update', data);
}
```

**Decision Points**:
- Event naming conventions
- Channel/room organization
- Authentication token handling
- Reconnection strategy

### 10. Testing Implementation

**Goal**: Create comprehensive tests for the application.

**Implementation Notes**:
- Use Jest for unit and integration tests
- Use React Testing Library for component tests
- Create mock services for external dependencies
- Implement end-to-end tests with Cypress

**Example Test**:
```typescript
// backend/src/services/__tests__/auth.service.test.ts
import { validateUser, generateToken, verifyToken } from '../auth.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
    },
  })),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return null if user not found', async () => {
      // Mock implementation
      const prismaClientMock = require('@prisma/client').PrismaClient;
      prismaClientMock().user.findUnique.mockResolvedValue(null);

      const result = await validateUser('testuser', 'password');
      expect(result).toBeNull();
      expect(prismaClientMock().user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });

    // Additional tests...
  });

  // Tests for generateToken and verifyToken...
});
```

**Decision Points**:
- Test coverage requirements
- Mock strategy for external services
- Test data generation
- CI/CD integration for tests

### 11. Deployment Preparation

**Goal**: Prepare the application for deployment.

**Implementation Notes**:
- Create production build scripts
- Configure environment variables for production
- Implement database migration scripts
- Create deployment documentation

**Example Build Script**:
```json
// package.json
{
  "scripts": {
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build",
    "start": "cd backend && npm run start:prod",
    "migrate": "cd backend && npx prisma migrate deploy",
    "seed": "cd backend && npx prisma db seed"
  }
}
```

**Decision Points**:
- Build optimization strategy
- Environment variable management
- Database migration approach
- Deployment automation

## Implementation Patterns

### API Request Pattern

```typescript
// frontend/lib/api.ts
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Component Pattern

```tsx
// Component structure pattern
import React from 'react';
import { useQuery } from 'react-query';
import { Spinner } from './ui/Spinner';
import { ErrorMessage } from './ui/ErrorMessage';

interface DataComponentProps {
  title: string;
  queryKey: string | string[];
  queryFn: () => Promise<any>;
  renderData: (data: any) => React.ReactNode;
  refetchInterval?: number;
}

export const DataComponent: React.FC<DataComponentProps> = ({
  title,
  queryKey,
  queryFn,
  renderData,
  refetchInterval,
}) => {
  const { data, isLoading, error } = useQuery(queryKey, queryFn, {
    refetchInterval,
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      
      {isLoading && <Spinner />}
      
      {error && <ErrorMessage message="Failed to load data" />}
      
      {!isLoading && !error && data && renderData(data)}
    </div>
  );
};
```

### Form Pattern

```tsx
// Form pattern with validation
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { FormError } from './ui/FormError';

// Define schema with Zod
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  error,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <FormError message={error} />}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          Username
        </label>
        <Input
          id="username"
          type="text"
          {...register('username')}
          error={!!errors.username}
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          error={!!errors.password}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>
      
      <Button type="submit" isLoading={isLoading} className="w-full">
        Log In
      </Button>
    </form>
  );
};
```

## Development Tips for AI-Assisted Implementation

1. **Start with Type Definitions**: Define TypeScript interfaces for data models and API responses first to provide clear structure.

2. **Component-First Approach**: Implement reusable UI components before building pages to establish consistent patterns.

3. **Incremental Testing**: Write tests alongside implementation to verify functionality.

4. **Documentation Comments**: Include detailed JSDoc comments to explain complex logic and component usage.

5. **Consistent Naming**: Use consistent naming conventions for files, functions, and variables.

6. **Error Handling**: Implement comprehensive error handling at all levels (API, components, pages).

7. **Progressive Enhancement**: Start with basic functionality and progressively add features.

8. **Responsive Design**: Implement mobile-first responsive design from the beginning.

9. **Accessibility**: Include accessibility attributes and keyboard navigation support.

10. **Performance Optimization**: Consider performance implications during implementation, especially for data-heavy features.

## Conclusion

This implementation roadmap provides a structured approach to developing Bitcoin Node Manager with AI assistance. By following this guide, Augment Code can implement the application in a systematic way, ensuring high-quality code and a maintainable architecture.

The roadmap is designed to be flexible, allowing for adjustments based on feedback and changing requirements during the development process.
