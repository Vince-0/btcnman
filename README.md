# Bitcoin Node Manager

Modern implementation of Bitcoin Node Manager, a dashboard and control system for Bitcoin nodes.

## Features

- **Dashboard**: Real-time node status, blockchain statistics, and mempool information
- **Peer Management**:
  - View, filter, and sort connected peers
  - Peer geolocation with map visualization
  - Disconnect or ban problematic peers
- **Rule System**:
  - Create automated rules for peer management
  - Condition-based triggers (ping time, version, etc.)
  - Scheduled rule execution
  - Rule execution logs and history
- **Ban Management**: View and manage banned peers
- **Block Explorer**: Browse blocks and transactions
- **Wallet Overview**: Read-only wallet information
- **User Authentication**: Secure login system

## Recent Improvements

- **RPC Data Caching System**:
  - Implemented centralized caching service for Bitcoin RPC data
  - Added manual refresh mechanism with "Refresh" buttons
  - Display cached data by default to reduce load on Bitcoin node
  - Show timestamps for when data was last updated
  - Optimized API endpoints to respect cache preferences

- **Block Explorer Enhancements**:
  - Fixed Bitcoin RPC URL format for proper connection to the Bitcoin node
  - Implemented robust fallback to mock data when RPC calls fail
  - Added comprehensive error handling for RPC connection issues
  - Optimized block and transaction data retrieval with caching

- **Peer Management Enhancements**:
  - Added filtering and sorting capabilities for peer list
  - Implemented geolocation service with IP-API.com integration
  - Created interactive map visualization for peer locations
  - Added caching system for geolocation data to respect rate limits

- **Rule System Implementation**:
  - Created rule execution engine with condition evaluation
  - Implemented scheduled rule execution
  - Added rule logs for execution history
  - Created comprehensive API endpoints for rule management

- **UI Improvements**:
  - Enhanced UI styling with fixed Tailwind CSS configuration
  - Persistent navigation sidebar across all pages
  - Improved error handling with better messages
  - Added loading indicators for asynchronous operations

- **Backend Enhancements**:
  - Increased API request timeouts to 60 seconds for better reliability
  - Implemented automatic fallbacks to mock data when needed
  - Standardized API responses with consistent formats
  - Added robust caching mechanisms to improve performance
  - Created centralized cache service with configurable expiration times
  - Implemented cache-first approach with manual refresh capability
  - Added timestamps to API responses to show when data was last updated

## Technology Stack

### Frontend
- React 18+
- Next.js 13+
- TailwindCSS
- React Query
- Chart.js

### Backend
- Node.js
- Express.js
- SQLite with Prisma ORM
- Socket.io for real-time updates
- JWT authentication

## Getting Started

### Prerequisites

- Node.js 18+ LTS
- Bitcoin Core 28.1+

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/btcnman.git
   cd btcnman
   ```

2. Install dependencies
   ```
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Configure environment variables
   ```
   # In the backend directory, update the .env file with your Bitcoin Core RPC credentials
   # The default .env file is already set up to connect to 169.255.240.110
   ```

4. Initialize the database
   ```
   # In the backend directory
   npm run prisma:migrate
   npm run prisma:seed
   ```

5. Start the development servers
   ```
   # From the project root directory
   ./start.sh

   # Or start the servers separately:
   # Start the backend server (from the backend directory)
   cd backend
   npm run dev

   # Start the frontend server (from the frontend directory)
   cd frontend
   npm run dev
   ```

6. Open your browser and navigate to:
   - Main application: `http://localhost:3000`
   - Demo page (no Tailwind CSS): `http://localhost:8000/simple-demo.html`

### Default Login Credentials
- Username: admin
- Password: admin123

### Troubleshooting

#### Bitcoin Core Connection Issues
If you encounter issues connecting to the Bitcoin Core node:

1. Check that your Bitcoin Core node is running and accessible
2. Verify the RPC credentials in the `.env` file
3. Make sure the Bitcoin Core node has RPC enabled with the following settings in `bitcoin.conf`:
   ```
   server=1
   rpcuser=your_rpc_username
   rpcpassword=your_rpc_password
   rpcallowip=0.0.0.0/0
   ```
4. The RPC URL format has been fixed to properly include authentication credentials:
   ```
   http://username:password@host:port/
   ```
5. If you still have issues, you can set `USE_MOCK=true` in the `.env` file to use mock data instead
6. The application now includes robust fallback mechanisms that will automatically use mock data if the Bitcoin node is unavailable
7. The Block Explorer has been specifically enhanced to handle RPC connection issues gracefully

#### API Timeout Issues
If you encounter timeout errors when making API requests:

1. The default timeout has been increased to 60 seconds (from 30 seconds)
2. You can further increase the timeout by modifying the `timeout` value in:
   - `frontend/src/lib/api.js` for frontend requests
   - `backend/src/services/bitcoin.service.ts` for backend requests
3. The application will display informative error messages when timeouts occur
4. For operations that consistently time out, consider using mock data by setting `USE_MOCK=true` in the `.env` file

#### Caching System
The application now uses a caching system to reduce load on the Bitcoin node:

1. By default, all pages display cached data first instead of making fresh RPC calls
2. Each page shows when the data was last updated
3. Use the "Refresh" button to fetch fresh data from the Bitcoin node
4. The cache expiration time is set to 5 minutes by default
5. You can modify the cache expiration time in `backend/src/services/cache.service.ts`
6. If you need to bypass the cache programmatically, add `useCache=false` to API requests

#### Tailwind CSS Issues

If you encounter issues with Tailwind CSS:

1. Make sure you have the correct dependencies installed:
   ```
   cd frontend
   npm install tailwindcss@3.3.2 autoprefixer@10.4.14 postcss@8.4.24
   ```
2. Check that the Tailwind directives are properly included in `frontend/src/app/globals.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
3. Verify that `frontend/postcss.config.mjs` is correctly configured:
   ```js
   export default {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   }
   ```
4. If you still have issues, you can use the simple demo page at `http://localhost:8000/simple-demo.html` which doesn't rely on Tailwind CSS or Next.js.

The demo page includes:
- A dashboard with sample Bitcoin node information
- A login form that works with the demo credentials
- API connection test buttons to verify backend connectivity

#### JWT Authentication Issues
If you encounter JWT authentication issues:

1. Make sure the `JWT_SECRET` is set in the `.env` file
2. Try clearing your browser's local storage and logging in again
3. Check that the backend server is running and accessible

#### UI Layout Issues
If the navigation sidebar doesn't appear on all pages:

1. The application now uses a template-based layout approach to ensure the sidebar persists across all pages
2. If you're developing new pages, make sure they don't override the template layout
3. The sidebar is automatically hidden on authentication pages (login, register) for a better user experience

## Deployment

For production deployment, follow these steps:

1. Build the frontend
   ```
   cd frontend
   npm run build
   ```

2. Build the backend
   ```
   cd backend
   npm run build
   ```

3. Start the production servers
   ```
   # Start the backend server
   cd backend
   npm start

   # Serve the frontend using a web server like Apache or Nginx
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
