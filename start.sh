#!/bin/bash

# Start the backend server
echo "Starting Bitcoin Node Manager backend..."
cd backend
npm run dev &
BACKEND_PID=$!

# Start the frontend server
echo "Starting Bitcoin Node Manager frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Start the simple HTTP server for the demo page
echo "Starting demo page server..."
cd ..
python3 -m http.server 8000 &
DEMO_PID=$!

# Function to handle script termination
function cleanup {
  echo "Stopping servers..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  kill $DEMO_PID
  exit
}

# Register the cleanup function for when the script is terminated
trap cleanup SIGINT SIGTERM

echo ""
echo "Bitcoin Node Manager is running!"
echo "- Backend: http://localhost:3001"
echo "- Frontend: http://localhost:3000"
echo "- Demo Page: http://localhost:8000/simple-demo.html"
echo ""
echo "Default login credentials:"
echo "- Username: admin"
echo "- Password: admin123"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to press Ctrl+C
wait
