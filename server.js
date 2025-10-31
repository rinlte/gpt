const express = require('express');
const axios = require('axios');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// AI Query endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let aiResponse = null;

    // Try main AI API first
    try {
      const response = await axios.get(`https://api.dreamed.site/api/chatgpt?text=${encodeURIComponent(message)}`);
      if (response.data?.answer) aiResponse = response.data.answer;
    } catch (err) {
      console.error('Main API error:', err.message);
    }

    // Fallback APIs
    if (!aiResponse) {
      const fallbackUrls = [
        `https://api.giftedtech.my.id/api/ai?text=${encodeURIComponent(message)}`,
        `https://api.giftedtech.my.id/api/ai1?text=${encodeURIComponent(message)}`
      ];

      for (const url of fallbackUrls) {
        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data?.answer) {
            aiResponse = data.answer;
            break;
          }
        } catch (_) {
          continue;
        }
      }
    }

    if (aiResponse) {
      res.json({ response: aiResponse });
    } else {
      res.status(500).json({ error: 'Could not get AI response' });
    }

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', bot: 'BILAL-GPT', mode: process.env.BOT_MODE || 'production' });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🤖 BILAL-GPT Server running on port ${PORT}`);
  console.log(`🌐 Bot Mode: ${process.env.BOT_MODE || 'production'}`);
});
