# Bitcoin Node Manager - Modern Implementation Technical Specification

## Overview

This document outlines the technical specifications for a modern reimplementation of Bitcoin Node Manager (BNM), a dashboard and control system for Bitcoin nodes. The reimplementation will maintain the core functionality of the original application while utilizing modern frameworks and development practices to improve security, maintainability, and user experience.

## Architecture

### High-Level Architecture

The application will follow a client-server architecture with clear separation of concerns:

1. **Frontend**: React-based single-page application (SPA) with server-side rendering capabilities
2. **Backend**: Node.js API server that communicates with the Bitcoin Core node
3. **Database**: SQLite for persistent storage of application data
4. **Bitcoin Core Interface**: Service layer for interacting with Bitcoin Core RPC API

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React Frontend │◄────►│  Node.js API    │◄────►│  Bitcoin Core   │
│  (Next.js)      │      │  Server         │      │  Node           │
│                 │      │                 │      │                 │
└─────────────────┘      └────────┬────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │                 │
                         │  SQLite         │
                         │  Database       │
                         │                 │
                         └─────────────────┘
```

### Frontend Architecture

The frontend will be built using React with Next.js, providing both server-side rendering for improved initial load performance and client-side navigation for a smooth user experience.

- **Component Structure**: Hierarchical component structure with reusable UI components
- **State Management**: React Query for server state and React Context for application state
- **Styling**: TailwindCSS for utility-first styling approach
- **Routing**: Next.js built-in routing system
- **Data Visualization**: Chart.js for graphs and React Table for data tables

### Backend Architecture

The backend will be built using Node.js with Express.js, providing a RESTful API for the frontend to consume.

- **API Layer**: Express.js routes and controllers
- **Service Layer**: Business logic and Bitcoin Core RPC communication
- **Data Access Layer**: Prisma ORM for database interactions
- **Authentication**: JWT-based authentication with password hashing
- **Real-time Updates**: Socket.io for pushing updates to connected clients

## Technology Stack

### Frontend
- **Framework**: React 18+
- **Meta-framework**: Next.js 13+
- **Styling**: TailwindCSS 3+
- **Data Fetching**: React Query 4+
- **Visualization**: Chart.js 4+ with react-chartjs-2
- **Tables**: React Table 8+
- **Maps**: react-simple-maps for geographical visualizations
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js 4+
- **Database ORM**: Prisma 4+
- **Database**: SQLite 3
- **Authentication**: jsonwebtoken, bcrypt
- **Real-time**: Socket.io 4+
- **Validation**: Zod
- **Bitcoin RPC**: bitcoin-core npm package

### Development & Deployment
- **Containerization**: Docker with docker-compose
- **Package Management**: npm or yarn
- **Linting**: ESLint with Prettier
- **Testing**: Jest, React Testing Library
- **Build Tools**: Webpack (via Next.js)

## Core Features

### 1. Dashboard
- Node status and information
- Blockchain statistics
- Connected peers overview
- Memory pool statistics
- System resource usage

### 2. Peer Management
- List of connected peers with detailed information
- Ability to disconnect or ban peers
- Filtering and sorting capabilities
- Geographical visualization of peer locations

### 3. Rule System
- Create and manage rules for automatic peer management
- Rule conditions based on peer attributes
- Rule actions (ban, disconnect, log)
- Manual and scheduled rule execution

### 4. Ban Management
- View and manage banned peers
- Import/export ban lists
- Generate iptables rules

### 5. Block Explorer
- Recent blocks information
- Fork detection and visualization
- Transaction details

### 6. Wallet Overview
- Read-only wallet information display
- Transaction history
- Address management

### 7. User Authentication
- Username/password authentication
- Session management with JWT
- Password hashing with bcrypt

## Database Schema

### Users Table
```
users
  id INTEGER PRIMARY KEY
  username TEXT NOT NULL UNIQUE
  password_hash TEXT NOT NULL
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  last_login DATETIME
```

### Rules Table
```
rules
  id INTEGER PRIMARY KEY
  name TEXT NOT NULL
  description TEXT
  conditions JSON NOT NULL
  actions JSON NOT NULL
  is_active BOOLEAN DEFAULT 1
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  updated_at DATETIME
```

### Rule Logs Table
```
rule_logs
  id INTEGER PRIMARY KEY
  rule_id INTEGER
  triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP
  peer_info JSON
  action_taken TEXT
  result TEXT
  FOREIGN KEY (rule_id) REFERENCES rules(id)
```

### Settings Table
```
settings
  id INTEGER PRIMARY KEY
  key TEXT NOT NULL UNIQUE
  value TEXT NOT NULL
  updated_at DATETIME
```

### Web Hosters Table
```
web_hosters
  id INTEGER PRIMARY KEY
  name TEXT NOT NULL
  asn TEXT
  ip_range TEXT
  notes TEXT
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/status` - Check authentication status

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary data
- `GET /api/dashboard/stats` - Get detailed node statistics

### Peers
- `GET /api/peers` - Get list of connected peers
- `GET /api/peers/:id` - Get specific peer details
- `POST /api/peers/:id/disconnect` - Disconnect a peer
- `POST /api/peers/:id/ban` - Ban a peer

### Rules
- `GET /api/rules` - Get all rules
- `GET /api/rules/:id` - Get specific rule
- `POST /api/rules` - Create new rule
- `PUT /api/rules/:id` - Update rule
- `DELETE /api/rules/:id` - Delete rule
- `POST /api/rules/:id/execute` - Execute rule manually
- `GET /api/rules/logs` - Get rule execution logs

### Bans
- `GET /api/bans` - Get list of banned peers
- `POST /api/bans/:id/unban` - Unban a peer
- `POST /api/bans/import` - Import ban list
- `GET /api/bans/export` - Export ban list
- `GET /api/bans/iptables` - Generate iptables rules

### Blocks
- `GET /api/blocks/recent` - Get recent blocks
- `GET /api/blocks/:hash` - Get block details
- `GET /api/blocks/forks` - Get detected forks

### Mempool
- `GET /api/mempool/stats` - Get mempool statistics
- `GET /api/mempool/transactions` - Get mempool transactions

### Wallet
- `GET /api/wallet/summary` - Get wallet summary
- `GET /api/wallet/transactions` - Get wallet transactions
- `GET /api/wallet/addresses` - Get wallet addresses

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings

## Security Considerations

### Authentication & Authorization
- Password-based authentication with bcrypt hashing
- JWT tokens for session management
- CSRF protection for API endpoints

### Input Validation
- Zod schema validation for all API inputs
- Sanitization of user inputs

### API Security
- Rate limiting to prevent abuse
- Input validation
- Proper error handling without leaking sensitive information

### Bitcoin RPC Security
- Secure storage of RPC credentials
- Limited RPC capabilities based on user needs

### Web Security
- HTTPS enforcement in production
- Content Security Policy headers
- XSS protection
- Secure cookie settings

## Deployment

### Docker Setup
- Docker Compose configuration for easy deployment
- Separate containers for frontend, backend, and database
- Volume mapping for persistent data

### Configuration
- Environment variables for sensitive configuration
- Configuration file for Bitcoin Core connection details
- Logging configuration

### Backup & Recovery
- Database backup procedures
- Configuration backup

## Performance Considerations

- Server-side rendering for initial page load
- Client-side caching with React Query
- Database indexing for common queries
- Pagination for large data sets
- Optimized API responses (compression, minimal payload)
- WebSocket connections for real-time updates instead of polling

## Bitcoin Core Compatibility

- Support for Bitcoin Core 28.1 RPC API
- Graceful handling of API changes between versions
- Feature detection for version-specific functionality
