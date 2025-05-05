# Bitcoin Node Manager

Modern implementation of Bitcoin Node Manager, a dashboard and control system for Bitcoin nodes.

## Features

- Dashboard with node status and information
- Peer management
- Rule system for automatic peer management
- Ban management
- Block explorer
- Wallet overview (read-only)
- User authentication

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
4. If you still have issues, you can set `USE_MOCK=true` in the `.env` file to use mock data instead

#### Tailwind CSS Issues

If you encounter issues with Tailwind CSS, you can use the simple demo page at `http://localhost:8000/simple-demo.html` which doesn't rely on Tailwind CSS or Next.js.

The demo page includes:
- A dashboard with sample Bitcoin node information
- A login form that works with the demo credentials
- API connection test buttons to verify backend connectivity

#### JWT Authentication Issues
If you encounter JWT authentication issues:

1. Make sure the `JWT_SECRET` is set in the `.env` file
2. Try clearing your browser's local storage and logging in again
3. Check that the backend server is running and accessible

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
