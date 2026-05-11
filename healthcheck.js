const https = require('https');
const http = require('http');

// Health check function
async function healthCheck() {
  try {
    // Check if the server is responding
    const response = await fetchHealth();
    
    if (response.success) {
      console.log('✅ Health check passed');
      process.exit(0);
    } else {
      console.error('❌ Health check failed:', response.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    process.exit(1);
  }
}

// Fetch health endpoint
function fetchHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 3003,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };
    
    const protocol = options.port === 443 ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (error) {
            resolve({ success: false, message: 'Invalid JSON response' });
          }
        } else {
          resolve({ success: false, message: `HTTP ${res.statusCode}` });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ success: false, message: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, message: 'Request timeout' });
    });
    
    req.end();
  });
}

// Run health check
healthCheck();