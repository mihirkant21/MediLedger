require('dotenv').config();
const User = require('./models/User');

async function testDB() {
  try {
    const testEmail = 'testotp@example.com';
    const otp = '123456';
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    console.log('Testing createUser...');
    let user = await User.getUserByEmail(testEmail);
    if (!user) {
      user = await User.createUser({
        name: 'Test',
        email: testEmail,
        password: 'password123',
        phone: '1234567890',
        otp,
        otpExpires
      });
      console.log('Created user:', user);
    } else {
      console.log('Updating user...');
      await User.updateUser(user.userId, {
        otp,
        otpExpires
      });
    }

    console.log('Fetching user again...');
    const fetchedUser = await User.getUserByEmail(testEmail);
    console.log('Fetched OTP:', fetchedUser.otp);
    console.log('Match?', fetchedUser.otp === otp);

  } catch (err) {
    console.error(err);
  }
}

testDB();
