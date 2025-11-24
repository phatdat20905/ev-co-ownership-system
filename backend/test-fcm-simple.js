// test-fcm-simple.js - Simple FCM notification test
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

async function testFCM() {
  console.log('🧪 Testing FCM Notification System\n');
  
  try {
    // Test 1: Register FCM token
    console.log('1️⃣ Registering FCM token...');
    const testToken = `test-token-${Date.now()}`;
    const registerResponse = await axios.post(
      `${API_URL}/notifications/register-token`,
      {
        userId: 'test-user-123',
        token: testToken,
        platform: 'web'
      }
    );
    console.log('✅ Token registered:', registerResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log();

    // Test 2: Get user tokens
    console.log('2️⃣ Getting user tokens...');
    const tokensResponse = await axios.get(
      `${API_URL}/notifications/tokens/test-user-123`
    );
    console.log('✅ User tokens:', tokensResponse.data.data.length, 'token(s)');
    console.log();

    // Test 3: Send notification
    console.log('3️⃣ Sending push notification...');
    const sendResponse = await axios.post(
      `${API_URL}/notifications/send`,
      {
        userId: 'test-user-123',
        title: 'Test Notification',
        body: 'This is a test FCM notification',
        data: { type: 'test', timestamp: new Date().toISOString() }
      }
    );
    console.log('✅ Notification sent:', sendResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log();

    // Test 4: Subscribe to topic
    console.log('4️⃣ Subscribing to topic...');
    const subscribeResponse = await axios.post(
      `${API_URL}/notifications/topic/subscribe`,
      {
        tokens: [testToken],
        topic: 'test-group-123'
      }
    );
    console.log('✅ Topic subscription:', subscribeResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log();

    // Test 5: Send topic notification
    console.log('5️⃣ Sending topic notification...');
    const topicResponse = await axios.post(
      `${API_URL}/notifications/topic/send`,
      {
        topic: 'test-group-123',
        title: 'Group Announcement',
        body: 'Test group notification',
        data: { type: 'announcement' }
      }
    );
    console.log('✅ Topic notification sent:', topicResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log();

    // Test 6: Remove token
    console.log('6️⃣ Removing FCM token...');
    const removeResponse = await axios.delete(
      `${API_URL}/notifications/token/${testToken}`
    );
    console.log('✅ Token removed:', removeResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log();

    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testFCM();
