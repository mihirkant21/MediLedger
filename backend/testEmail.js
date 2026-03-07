require('dotenv').config();
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

const { sendOTP } = require('./utils/emailService');

async function test() {
  const result = await sendOTP('lighten.flame.1@gmail.com', '123456');
  console.log('Result:', result);
}

test();
