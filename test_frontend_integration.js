// Test script to verify frontend can connect to backend API
// Run with: node test_frontend_integration.js

const API_BASE_URL = 'http://localhost:5001/api';

async function testAPIConnection() {
  console.log('🧪 Testing Frontend-Backend Integration...\n');

  // Test 1: Health check
  try {
    console.log('1️⃣ Testing health endpoint...');
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();

    if (data.status === 'healthy') {
      console.log('   ✅ Health check passed');
    } else {
      console.log('   ❌ Health check failed:', data);
    }
  } catch (error) {
    console.log('   ❌ Health check error:', error.message);
  }

  // Test 2: Current week
  try {
    console.log('\n2️⃣ Testing current week endpoint...');
    const response = await fetch(`${API_BASE_URL}/current-week`);
    const data = await response.json();

    if (data.success && data.week) {
      console.log(`   ✅ Current week: ${data.week} (Season ${data.season})`);
    } else {
      console.log('   ❌ Current week failed:', data);
    }
  } catch (error) {
    console.log('   ❌ Current week error:', error.message);
  }

  // Test 3: Target share data
  try {
    console.log('\n3️⃣ Testing target share data for KC week 4...');
    const response = await fetch(`${API_BASE_URL}/target-share/KC/4`);
    const data = await response.json();

    if (data.success && data.data && data.data.length > 0) {
      console.log(`   ✅ Found ${data.data.length} players with targets`);
      console.log(`   📊 Top player: ${data.data[0].name} (${data.data[0].targetShare}%)`);
      console.log(`   🔗 Data source: ${data.source}`);
    } else {
      console.log('   ❌ Target share data failed:', data);
    }
  } catch (error) {
    console.log('   ❌ Target share error:', error.message);
  }

  // Test 4: CORS headers (simulate browser request)
  try {
    console.log('\n4️⃣ Testing CORS headers...');
    const response = await fetch(`${API_BASE_URL}/current-week`, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
        'Accept': 'application/json'
      }
    });

    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    if (corsHeader === 'http://localhost:3000') {
      console.log('   ✅ CORS configured correctly');
    } else {
      console.log('   ⚠️ CORS header:', corsHeader);
    }
  } catch (error) {
    console.log('   ❌ CORS test error:', error.message);
  }

  console.log('\n🎯 Integration test complete!');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This test requires Node.js 18+ or a fetch polyfill');
  console.log('💡 Try running this in a browser console instead');
} else {
  testAPIConnection();
}