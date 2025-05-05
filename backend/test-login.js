const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    console.log('Login successful!');
    console.log('Token:', response.data.token);
    
    // Test the token by making a request to a protected endpoint
    const infoResponse = await axios.get('http://localhost:3001/api/bitcoin/info', {
      headers: {
        Authorization: `Bearer ${response.data.token}`
      }
    });
    
    console.log('API request successful!');
    console.log('Response:', JSON.stringify(infoResponse.data, null, 2).substring(0, 200) + '...');
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testLogin();
