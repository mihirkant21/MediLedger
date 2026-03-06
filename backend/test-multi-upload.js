const axios = require('axios');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function runTests() {
  try {
    const dummyEmail = 'multitest' + Date.now() + '@example.com';
    await User.createUser({
      name: 'Test Multi',
      email: dummyEmail,
      password: 'password123',
      isVerified: true
    });
    
    // Login
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: dummyEmail,
      password: 'password123'
    });
    const token = loginRes.data.token;

    // Create 3 dummy files
    const form = new FormData();
    for (let i = 1; i <= 3; i++) {
        const filePath = path.join(__dirname, `dummy${i}.png`);
        fs.writeFileSync(filePath, `Test file content ${i}`);
        form.append('files', fs.createReadStream(filePath), { filename: `dummy${i}.png`, contentType: 'image/png' });
    }
    
    form.append('metadata', JSON.stringify({
      title: 'Multi Upload Test',
      documentType: 'other' // General metadata type
    }));
    form.append('fileTypes', JSON.stringify(['prescription', 'xray', 'lab-report']));

    // Upload
    console.log('Testing Multiple File Upload...');
    const uploadRes = await axios.post('http://localhost:5001/api/documents/upload', form, {
      headers: { ...form.getHeaders(), Authorization: 'Bearer ' + token }
    });

    const doc = uploadRes.data.document;
    console.log('Upload successful! ID:', doc._id);
    console.log(`Document contains ${doc.files?.length} files inside the array.`);

    // Fetch details
    const getRes = await axios.get('http://localhost:5001/api/documents/' + doc._id, {
        headers: { Authorization: 'Bearer ' + token }
    });
    console.log('Details fetched correctly:', getRes.data.document.files.length === 3 ? 'PASS' : 'FAIL');

    // Test Delete
    console.log('Testing Deletion from S3 and DynamoDB...');
    await axios.delete('http://localhost:5001/api/documents/' + doc._id, {
        headers: { Authorization: 'Bearer ' + token }
    });
    
    // Attempt re-fetch
    try {
        await axios.get('http://localhost:5001/api/documents/' + doc._id, {
            headers: { Authorization: 'Bearer ' + token }
        });
        console.log('Deletion failed, document still accessible.');
    } catch(err) {
        if(err.response.status === 404) {
            console.log('Deletion successful! Document 404s properly.');
        } else {
            console.log('Unexpected error running deletion verify:', err.message);
        }
    }

  } catch (err) {
    if (err.response) {
      console.error('API ERROR RESPONSE:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
}
runTests();
