const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// AI Query endpoint with better error handling
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Received query:', message);
    let aiResponse = null;

    // API 1: Main API - api.dreamed.site
    try {
      console.log('Trying API 1: api.dreamed.site');
      const response = await axios.get(`https://api.dreamed.site/api/chatgpt`, {
        params: { text: message },
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      
      console.log('API 1 Response:', response.data);
      
      if (response.data && response.data.answer) {
        aiResponse = response.data.answer;
        console.log('✅ API 1 Success');
      }
    } catch (err) {
      console.error('❌ API 1 Failed:', err.message);
    }

    // API 2: Fallback - api.giftedtech.my.id/api/ai
    if (!aiResponse) {
      try {
        console.log('Trying API 2: giftedtech ai');
        const response = await axios.get(`https://api.giftedtech.my.id/api/ai`, {
          params: { text: message },
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        
        console.log('API 2 Response:', response.data);
        
        if (response.data && response.data.answer) {
          aiResponse = response.data.answer;
          console.log('✅ API 2 Success');
        }
      } catch (err) {
        console.error('❌ API 2 Failed:', err.message);
      }
    }

    // API 3: Fallback - api.giftedtech.my.id/api/ai1
    if (!aiResponse) {
      try {
        console.log('Trying API 3: giftedtech ai1');
        const response = await axios.get(`https://api.giftedtech.my.id/api/ai1`, {
          params: { text: message },
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        
        console.log('API 3 Response:', response.data);
        
        if (response.data && response.data.answer) {
          aiResponse = response.data.answer;
          console.log('✅ API 3 Success');
        }
      } catch (err) {
        console.error('❌ API 3 Failed:', err.message);
      }
    }

    // API 4: Fallback - widipe.com
    if (!aiResponse) {
      try {
        console.log('Trying API 4: widipe');
        const response = await axios.get(`https://widipe.com/gpt4`, {
          params: { text: message },
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        
        console.log('API 4 Response:', response.data);
        
        if (response.data && response.data.result) {
          aiResponse = response.data.result;
          console.log('✅ API 4 Success');
        }
      } catch (err) {
        console.error('❌ API 4 Failed:', err.message);
      }
    }

    // API 5: Fallback - api.yanzbotz.live
    if (!aiResponse) {
      try {
        console.log('Trying API 5: yanzbotz');
        const response = await axios.get(`https://api.yanzbotz.live/api/ai/gpt4`, {
          params: { query: message },
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        
        console.log('API 5 Response:', response.data);
        
        if (response.data && response.data.result) {
          aiResponse = response.data.result;
          console.log('✅ API 5 Success');
        }
      } catch (err) {
        console.error('❌ API 5 Failed:', err.message);
      }
    }

    // Send response
    if (aiResponse && aiResponse.trim() !== '') {
      console.log('✅ Sending response to client');
      res.json({ 
        response: aiResponse,
        success: true 
      });
    } else {
      console.error('❌ No response from any API');
      res.status(503).json({ 
        error: 'All AI services are temporarily unavailable. Please try again in a moment.',
        success: false
      });
    }

  } catch (error) {
    console.error('❌ Server error:', error.message);
    res.status(500).json({ 
      error: 'Internal server error. Please try again.',
      success: false 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    bot: 'BILAL-GPT', 
    mode: process.env.BOT_MODE || 'production',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to check API availability
app.get('/api/test', async (req, res) => {
  const results = {};
  
  try {
    const testMessage = 'hi';
    
    // Test API 1
    try {
      await axios.get(`https://api.dreamed.site/api/chatgpt?text=${testMessage}`, { timeout: 5000 });
      results.api1 = 'working';
    } catch { results.api1 = 'failed'; }
    
    // Test API 2
    try {
      await axios.get(`https://api.giftedtech.my.id/api/ai?text=${testMessage}`, { timeout: 5000 });
      results.api2 = 'working';
    } catch { results.api2 = 'failed'; }
    
    // Test API 3
    try {
      await axios.get(`https://api.giftedtech.my.id/api/ai1?text=${testMessage}`, { timeout: 5000 });
      results.api3 = 'working';
    } catch { results.api3 = 'failed'; }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 BILAL-GPT Server Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Server running on port: ${PORT}`);
  console.log(`🔧 Bot Mode: ${process.env.BOT_MODE || 'production'}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
