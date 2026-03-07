const axios = require('axios');

async function testAuthIntegration() {
  const baseURL = 'http://localhost:5001/api/auth';
  const testEmail = 'integration_test_otp@example.com';
  const testPassword = 'Password123!';

  try {
    console.log('1. Registering new user...');
    try {
      const res1 = await axios.post(`${baseURL}/register`, {
        name: 'Integration Test',
        email: testEmail,
        password: testPassword,
        phone: '1234567890'
      });
      console.log('Register Response:', res1.data);
    } catch(err) {
      console.log('Register Error:', err.response?.data || err.message);
    }

    console.log('\n2. Fetching OTP directly from DB for verification...');
    const User = require('./models/User');
    const userInDb = await User.getUserByEmail(testEmail);
    const otp = userInDb.otp;
    console.log('Fetched OTP:', otp);

    console.log('\n3. Verifying OTP...');
    try {
      const res2 = await axios.post(`${baseURL}/verify-otp`, {
        email: testEmail,
        otp
      });
      console.log('Verify Response:', res2.data);
    } catch(err) {
      console.log('Verify Error:', err.response?.data || err.message);
    }

    console.log('\n4. Logging in...');
    try {
      const res3 = await axios.post(`${baseURL}/login`, {
        email: testEmail,
        password: testPassword
      });
      console.log('Login Response:', res3.data);
    } catch(err) {
      console.log('Login Error:', err.response?.data || err.message);
    }
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testAuthIntegration();
