require('dotenv').config();
const User = require('./models/User');

async function checkUserPassword() {
  const testEmail = 'testotp@example.com';
  console.log('Fetching user...');
  const user = await User.getUserByEmail(testEmail);
  console.log('Fetched User:', user);
  if (user) {
    console.log('Does user have password field?', !!user.password);
  }
}

checkUserPassword();
