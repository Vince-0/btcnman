const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get the JWT_SECRET from the environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create a sample user object
const user = {
  id: 1,
  username: 'admin'
};

// Generate a token
const token = jwt.sign(
  { id: user.id, username: user.username },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('JWT_SECRET:', JWT_SECRET);
console.log('Generated token:', token);

// Verify the token
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Decoded token:', decoded);
} catch (error) {
  console.error('Error verifying token:', error);
}
