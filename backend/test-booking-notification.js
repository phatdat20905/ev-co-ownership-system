// test-booking-notification.js - Test booking notification integration
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@evcoownership.com',
      password: 'Password123!'
    });
    
    if (response.data.success) {
      console.log('✅ Login successful');
      console.log('   Token:', response.data.data.token.substring(0, 50) + '...');
      return response.data.data.token;
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    throw error;
  }
}

async function registerFCMToken(token, userId) {
  try {
    console.log('\n📱 Registering FCM token...');
    const fcmToken = `web-token-${Date.now()}`;
    
    const response = await axios.post(
      `${API_URL}/notifications/register-token`,
      {
        userId,
        token: fcmToken,
        platform: 'web'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ FCM token registered:', fcmToken);
    return fcmToken;
  } catch (error) {
    console.error('❌ FCM registration error:', error.response?.data || error.message);
    throw error;
  }
}

async function createTestBooking(token) {
  try {
    console.log('\n🚗 Creating test booking...');
    
    const bookingData = {
      vehicleId: 1,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
      purpose: 'Test FCM notification',
      pickupLocation: 'Test Location'
    };
    
    const response = await axios.post(
      `${API_URL}/bookings`,
      bookingData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.data.success) {
      console.log('✅ Booking created successfully');
      console.log('   Booking ID:', response.data.data.id);
      console.log('   📬 Notification should be sent now!');
      return response.data.data;
    }
  } catch (error) {
    console.error('❌ Booking creation error:', error.response?.data || error.message);
    throw error;
  }
}

async function checkNotifications(token) {
  try {
    console.log('\n📬 Checking notifications...');
    
    const response = await axios.get(
      `${API_URL}/notifications`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.data.success) {
      const notifications = response.data.data.notifications || response.data.data || [];
      console.log('✅ Found', notifications.length, 'notification(s)');
      
      // Show recent notifications
      const recent = notifications.slice(0, 3);
      recent.forEach((notif, i) => {
        console.log(`\n   ${i + 1}. ${notif.title}`);
        console.log(`      ${notif.message || notif.body}`);
        console.log(`      Type: ${notif.type}`);
        console.log(`      Time: ${new Date(notif.createdAt).toLocaleString('vi-VN')}`);
      });
    }
  } catch (error) {
    console.error('❌ Check notifications error:', error.response?.data || error.message);
  }
}

async function testBookingNotification() {
  console.log('🧪 Testing Booking Notification Integration\n');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Login
    const token = await login();
    
    // Extract user ID from token (simple decode, not secure but ok for testing)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const userId = payload.id;
    console.log('   User ID:', userId);
    
    // Step 2: Register FCM token
    const fcmToken = await registerFCMToken(token, userId);
    
    // Step 3: Create booking (should trigger notification)
    await createTestBooking(token);
    
    // Wait a moment for notification to be processed
    console.log('\n⏳ Waiting 2 seconds for notification to be processed...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Check notifications
    await checkNotifications(token);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Check notification-service logs for FCM send attempts');
    console.log('2. Open the app in browser and grant notification permission');
    console.log('3. Create a booking in the app to receive real push notification');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testBookingNotification();
