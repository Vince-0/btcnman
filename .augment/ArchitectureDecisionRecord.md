# Architecture Decision Record (ADR)

This document records the architectural decisions made during the design of the modern Bitcoin Node Manager implementation.

## ADR 1: Frontend Framework Selection

### Decision
Use React with Next.js as the frontend framework.

### Context
The application requires a modern, responsive UI with efficient data fetching and rendering capabilities.

### Alternatives Considered
- Vue.js with Nuxt
- Angular
- Svelte with SvelteKit
- Plain React with Create React App

### Decision Rationale
- Next.js provides both server-side rendering and static site generation
- React has a large ecosystem and community support
- Next.js API routes simplify backend integration
- Built-in routing and code-splitting improve performance
- TypeScript integration is seamless
- File-based routing simplifies the application structure

### Consequences
- Developers need to understand React and Next.js concepts
- Server-side rendering adds complexity but improves initial load performance
- Deployment requires a Node.js environment

## ADR 2: CSS Framework Selection

### Decision
Use TailwindCSS for styling.

### Context
The application needs a consistent, responsive design system that allows for rapid UI development.

### Alternatives Considered
- CSS Modules
- Styled Components
- Emotion
- Bootstrap
- Material UI

### Decision Rationale
- Utility-first approach speeds up development
- No context switching between HTML and CSS files
- Built-in responsive design utilities
- Easy customization through configuration
- Small production bundle size with PurgeCSS
- Works well with component-based architecture

### Consequences
- HTML can become verbose with utility classes
- Learning curve for developers unfamiliar with utility-first CSS
- Need for component extraction to avoid repetition

## ADR 3: Backend Framework Selection

### Decision
Use Node.js with Express.js for the backend API.

### Context
The application needs a backend API to communicate with the Bitcoin Core node and manage application data.

### Alternatives Considered
- Fastify
- Koa
- NestJS
- Hapi

### Decision Rationale
- Express is mature and well-documented
- Large ecosystem of middleware
- Flexible and unopinionated
- Good performance characteristics
- Easy to integrate with TypeScript
- Simple to deploy alongside the Next.js frontend

### Consequences
- Less structured than opinionated frameworks like NestJS
- Requires manual setup for features like validation and authentication
- Need to carefully select middleware for security

## ADR 4: Database Selection

### Decision
Use SQLite with Prisma ORM.

### Context
The application needs persistent storage for user data, rules, and application settings.

### Alternatives Considered
- PostgreSQL
- MySQL
- MongoDB
- LevelDB

### Decision Rationale
- SQLite is serverless and requires no separate database process
- Sufficient for the expected load (few users managing a single node)
- File-based storage simplifies deployment and backup
- Prisma provides type-safe database access
- Schema migrations are handled automatically
- SQLite is well-supported on all platforms

### Consequences
- Limited concurrent write performance (not an issue for this use case)
- No built-in replication or clustering
- Need to manage file permissions for the database file
- Regular backups required for data safety

## ADR 5: Authentication Approach

### Decision
Use JWT (JSON Web Tokens) with username/password authentication.

### Context
The application requires secure authentication to protect sensitive Bitcoin node management functions.

### Alternatives Considered
- Session-based authentication
- OAuth/OpenID Connect
- API keys
- HTTP Basic Authentication

### Decision Rationale
- JWTs are stateless and work well with API-based architecture
- Password hashing with bcrypt provides strong security
- Simple to implement and understand
- No dependency on external authentication providers
- Works well with the expected small user base

### Consequences
- Need to handle token storage securely on the client
- Token revocation requires additional implementation
- Password reset functionality needs to be implemented separately
- Need to implement proper password hashing and storage

## ADR 6: API Design

### Decision
Use RESTful API design with JSON payloads.

### Context
The frontend needs to communicate with the backend to retrieve data and perform actions.

### Alternatives Considered
- GraphQL
- RPC
- SOAP

### Decision Rationale
- REST is widely understood and documented
- Simple to implement with Express.js
- JSON is lightweight and native to JavaScript
- Clear separation of concerns with resource-based endpoints
- Easy to test with standard tools
- Good caching capabilities

### Consequences
- Potential for over-fetching or under-fetching data
- Need to version the API for future changes
- Multiple endpoints may be needed for complex data requirements

## ADR 7: State Management

### Decision
Use React Query for server state and React Context for application state.

### Context
The application needs to manage both server data and client-side application state.

### Alternatives Considered
- Redux
- MobX
- Zustand
- Recoil
- SWR

### Decision Rationale
- React Query handles caching, background updates, and stale data
- Reduces boilerplate compared to Redux
- React Context is sufficient for simple application state
- Clear separation between server and client state
- Built-in loading and error states
- Optimistic updates for better UX

### Consequences
- Learning curve for React Query concepts
- Need to carefully manage query invalidation
- Context can cause re-renders if not optimized

## ADR 8: Real-time Updates

### Decision
Use Socket.io for real-time updates.

### Context
The application needs to display real-time updates from the Bitcoin node without constant polling.

### Alternatives Considered
- Server-Sent Events (SSE)
- Plain WebSockets
- Long polling
- Periodic polling

### Decision Rationale
- Socket.io provides fallbacks for environments where WebSockets aren't available
- Built-in reconnection handling
- Room/namespace support for targeted updates
- Compatible with the Node.js/Express backend
- Handles connection management automatically
- Good browser support

### Consequences
- Additional dependency and bundle size
- Need to handle authentication for WebSocket connections
- Potential for duplicate data with the REST API

## ADR 9: Bitcoin Core Integration

### Decision
Use the bitcoin-core npm package for RPC communication.

### Context
The application needs to communicate with the Bitcoin Core node via its RPC API.

### Alternatives Considered
- Direct HTTP requests to the RPC endpoint
- Custom RPC client
- bitcoinjs-lib

### Decision Rationale
- Purpose-built for Bitcoin Core RPC communication
- Handles authentication and request formatting
- Type definitions available
- Active maintenance
- Supports all Bitcoin Core RPC methods
- Handles error responses properly

### Consequences
- Dependency on a third-party package
- Need to handle version compatibility with Bitcoin Core
- May need to extend for custom functionality

## ADR 10: Deployment Strategy

### Decision
Use Apache as a reverse proxy to a Node.js application, with PM2 for process management.

### Context
The application needs to be deployed on Linux servers (Debian/Ubuntu) with minimal complexity.

### Alternatives Considered
- Docker containers
- Nginx + Node.js
- Standalone Node.js with a process manager
- Serverless deployment

### Decision Rationale
- Apache is widely available and well-understood
- Reverse proxy provides additional security layer
- PM2 handles process management, logging, and restarts
- Simple to integrate with Let's Encrypt for SSL
- Works well with traditional hosting environments
- No container orchestration required

### Consequences
- More complex setup than containerized deployment
- Need to manage Node.js version and dependencies manually
- Configuration spread across multiple systems (Apache, Node.js, PM2)
- Manual scaling if needed

## ADR 11: Testing Strategy

### Decision
Use Jest for unit/integration tests and React Testing Library for component tests.

### Context
The application needs comprehensive testing to ensure reliability and maintainability.

### Alternatives Considered
- Mocha + Chai
- AVA
- Cypress for all testing
- Vitest

### Decision Rationale
- Jest provides an all-in-one testing solution
- React Testing Library encourages testing from a user perspective
- Good TypeScript support
- Snapshot testing for UI components
- Mock capabilities for external dependencies
- Parallel test execution for speed

### Consequences
- Need to set up proper mocks for external services
- Learning curve for effective component testing
- Need to balance test coverage with development speed

## ADR 12: Code Organization

### Decision
Use a feature-based code organization with shared components and utilities.

### Context
The codebase needs to be organized in a way that's maintainable and scalable.

### Alternatives Considered
- Type-based organization (controllers, services, components)
- Monolithic organization
- Domain-driven design

### Decision Rationale
- Feature-based organization groups related code together
- Easier to understand the purpose of each module
- Shared components and utilities prevent duplication
- Scales well as the application grows
- Facilitates code splitting and lazy loading
- Easier onboarding for new developers

### Consequences
- Need to carefully manage shared code to prevent circular dependencies
- Potential for duplication if boundaries aren't clear
- Need for consistent naming conventions

## ADR 13: Error Handling

### Decision
Implement centralized error handling with custom error classes and consistent error responses.

### Context
The application needs robust error handling to provide a good user experience and facilitate debugging.

### Alternatives Considered
- Local error handling in each component/route
- Global error boundary only
- Third-party error tracking services only

### Decision Rationale
- Centralized handling provides consistency
- Custom error classes allow for specific error types
- Consistent error responses improve API usability
- Error boundaries prevent UI crashes
- Structured logging facilitates debugging
- Can be extended with external error tracking

### Consequences
- Need to define and maintain error types
- All code must use the error handling patterns
- Additional complexity in the error handling layer

## ADR 14: Configuration Management

### Decision
Use environment variables with a .env file for configuration, validated at startup.

### Context
The application needs a secure and flexible way to manage configuration across environments.

### Alternatives Considered
- Configuration files (JSON, YAML)
- Database-stored configuration
- Command-line arguments
- Configuration service

### Decision Rationale
- Environment variables are a standard approach
- Works well with various deployment environments
- Sensitive values aren't stored in the codebase
- .env files simplify local development
- Validation at startup catches configuration errors early
- Easy to override in different environments

### Consequences
- Need to document all configuration options
- Need to validate environment variables at startup
- Need to handle defaults carefully

## ADR 15: Accessibility Approach

### Decision
Implement accessibility features from the beginning, following WCAG 2.1 AA standards.

### Context
The application should be accessible to users with disabilities.

### Alternatives Considered
- Adding accessibility later in development
- Minimal accessibility compliance
- Using a specialized accessibility library

### Decision Rationale
- Accessibility is easier to implement from the start
- WCAG 2.1 AA is a widely accepted standard
- Improves usability for all users
- Semantic HTML and ARIA attributes are simple to implement
- Keyboard navigation is essential for power users
- Color contrast benefits users in various environments

### Consequences
- Need for accessibility knowledge in the development team
- Additional testing requirements
- Some components may need custom implementations

## ADR 16: Internationalization (i18n)

### Decision
Prepare for internationalization but implement English-only initially.

### Context
The application may need to support multiple languages in the future.

### Alternatives Considered
- No internationalization support
- Full multi-language support from the start
- Server-side translation only

### Decision Rationale
- Preparing for i18n from the start avoids costly refactoring
- English-only initially keeps the scope manageable
- Extracting strings to constants is a good practice regardless
- Can be extended with full i18n library when needed
- Minimal performance impact with proper implementation

### Consequences
- Need to extract UI strings to constants
- Some additional complexity in text handling
- Need to consider text expansion in UI design

## Conclusion

These architectural decisions provide the foundation for the modern implementation of Bitcoin Node Manager. They balance modern development practices with the specific requirements of the application, focusing on maintainability, security, and user experience.

The decisions may be revisited as development progresses and requirements evolve, but they provide a solid starting point for implementation.
