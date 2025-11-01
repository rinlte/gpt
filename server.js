const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// AI Query endpoint with better, more reliable APIs
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('📩 Received query:', message);
    let aiResponse = null;
    let successfulApi = null;

    // List of working APIs (tested and reliable)
    const apis = [
      {
        name: 'Gemini Pro',
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyD7ciBCgOP1Head6kmtDU0qFf_s_NILqJg`,
        method: 'POST',
        format: (msg) => ({
          contents: [{
            parts: [{ text: msg }]
          }]
        }),
        extract: (data) => data?.candidates?.[0]?.content?.parts?.[0]?.text
      },
      {
        name: 'OpenAI Mirror',
        url: 'https://api.pawan.krd/v1/chat/completions',
        method: 'POST',
        format: (msg) => ({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: msg }]
        }),
        extract: (data) => data?.choices?.[0]?.message?.content
      },
      {
        name: 'Claude Mirror',
        url: 'https://api.kastg.xyz/api/ai/claude',
        method: 'GET',
        format: (msg) => null,
        query: (msg) => ({ prompt: msg }),
        extract: (data) => data?.response || data?.result || data?.message
      },
      {
        name: 'GPT4 Free',
        url: 'https://api.kastg.xyz/api/ai/chatgptv2',
        method: 'GET',
        format: (msg) => null,
        query: (msg) => ({ prompt: msg }),
        extract: (data) => data?.response || data?.result
      },
      {
        name: 'Blackbox AI',
        url: 'https://api.blackbox.ai/api/chat',
        method: 'POST',
        format: (msg) => ({
          messages: [{ role: 'user', content: msg }],
          previewToken: null,
          userId: null,
          codeModelMode: true,
          agentMode: {},
          trendingAgentMode: {},
          isMicMode: false
        }),
        extract: (data) => {
          if (typeof data === 'string') return data;
          return data?.response || data?.message;
        }
      },
      {
        name: 'DeepAI',
        url: 'https://api.deepai.org/api/text-generator',
        method: 'POST',
        format: (msg) => new URLSearchParams({ text: msg }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        extract: (data) => data?.output
      }
    ];

    // Try each API
    for (const api of apis) {
      try {
        console.log(`🔄 Trying ${api.name}...`);
        
        let response;
        const config = {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Type': 'application/json',
            ...api.headers
          }
        };

        if (api.method === 'POST') {
          const body = api.format(message);
          response = await axios.post(api.url, body, config);
        } else {
          const params = api.query ? api.query(message) : { text: message };
          response = await axios.get(api.url, { ...config, params });
        }

        console.log(`📦 ${api.name} Response Status:`, response.status);
        
        const extracted = api.extract(response.data);
        
        if (extracted && extracted.trim() !== '') {
          aiResponse = extracted.trim();
          successfulApi = api.name;
          console.log(`✅ ${api.name} Success!`);
          break;
        }
      } catch (err) {
        console.error(`❌ ${api.name} Failed:`, err.message);
      }
    }

    // Send response
    if (aiResponse && aiResponse.trim() !== '') {
      console.log(`✅ Sending response from ${successfulApi}`);
      res.json({ 
        response: aiResponse,
        success: true,
        source: successfulApi
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

// Test endpoint for API availability
app.get('/api/test', async (req, res) => {
  const results = {
    gemini: 'testing...',
    openai: 'testing...',
    claude: 'testing...',
    gpt4: 'testing...',
    blackbox: 'testing...',
    deepai: 'testing...'
  };
  
  try {
    // Test Gemini
    try {
      await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyD7ciBCgOP1Head6kmtDU0qFf_s_NILqJg',
        { contents: [{ parts: [{ text: 'hi' }] }] },
        { timeout: 5000 }
      );
      results.gemini = '✅ working';
    } catch { results.gemini = '❌ failed'; }

    // Test OpenAI Mirror
    try {
      await axios.post(
        'https://api.pawan.krd/v1/chat/completions',
        { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: 'hi' }] },
        { timeout: 5000 }
      );
      results.openai = '✅ working';
    } catch { results.openai = '❌ failed'; }

    // Test Claude
    try {
      await axios.get('https://api.kastg.xyz/api/ai/claude', {
        params: { prompt: 'hi' },
        timeout: 5000
      });
      results.claude = '✅ working';
    } catch { results.claude = '❌ failed'; }

    // Test GPT4
    try {
      await axios.get('https://api.kastg.xyz/api/ai/chatgptv2', {
        params: { prompt: 'hi' },
        timeout: 5000
      });
      results.gpt4 = '✅ working';
    } catch { results.gpt4 = '❌ failed'; }

    // Test Blackbox
    try {
      await axios.post('https://api.blackbox.ai/api/chat', {
        messages: [{ role: 'user', content: 'hi' }],
        previewToken: null
      }, { timeout: 5000 });
      results.blackbox = '✅ working';
    } catch { results.blackbox = '❌ failed'; }

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
