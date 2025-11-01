// aiBot.js - WhatsApp Bot AI Command Handler (Deobfuscated & Clean)
const axios = require('axios');
const fetch = require('node-fetch');
const { cmd } = require('./cmd');

// Register the AI command with multiple aliases
cmd({
  name: 'ai',
  alias: ['gemini', 'gpt', 'ai', 'ai1', 'a1', 'a2'],
  desc: 'Ask AI a question 🤔',
  category: 'ai',
  react: '🤔',
  filename: __filename
}, async (client, message, args, { from, q, reply }) => {
  try {
    // Check if user provided a query
    if (!q) {
      return reply('Please provide a query for the AI!');
    }

    // Send thinking reaction
    await client.sendMessage(from, { 
      react: { text: '🤔', key: message.key } 
    });

    let aiResponse = null;

    // Try main API first (api.dreaded.site)
    try {
      const res = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(q)}`);
      
      if (res.data?.response?.message) {
        aiResponse = res.data.response.message;
      }
    } catch (err) {
      console.error('Error calling main AI API:', err.message);
    }

    // Fallback APIs if main API fails
    if (!aiResponse) {
      const fallbackUrls = [
        `https://api.giftedtech.my.id/api/ai?text=${encodeURIComponent(q)}`,
        `https://api.giftedtech.my.id/api/ai1?text=${encodeURIComponent(q)}`,
        `https://api.giftedtech.my.id/api/ai2?text=${encodeURIComponent(q)}`,
        `https://widipe.com/gpt4?text=${encodeURIComponent(q)}`,
        `https://api.yanzbotz.live/api/ai/gpt4?query=${encodeURIComponent(q)}`,
        `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(q)}`
      ];

      for (const url of fallbackUrls) {
        try {
          const res = await fetch(url);
          const data = await res.json();
          
          // Try different response formats
          if (data.message || data.data || data.answer || data.response) {
            aiResponse = data.message || data.data || data.answer || data.response;
            break;
          }
        } catch (err) {
          continue; // Try next API
        }
      }
    }

    // Send response back to user
    if (aiResponse) {
      // Send AI response
      await client.sendMessage(from, { 
        text: `☺️ ${aiResponse}` 
      }, { quoted: message });

      // Send success reaction
      await client.sendMessage(from, { 
        react: { text: '☺️', key: message.key } 
      });
    } else {
      // No response from any API
      await reply('😔 Sorry, I could not get an AI response.');
      
      // Send sad reaction
      await client.sendMessage(from, { 
        react: { text: '😔', key: message.key } 
      });
    }

  } catch (err) {
    console.error('AI command error:', err);
    
    // Send error message
    await client.sendMessage(from, { 
      text: 'AI command error:' 
    }, { quoted: message });
    
    // Send error reaction
    await client.sendMessage(from, { 
      react: { text: '😔', key: message.key } 
    });
  }
});

console.log('✅ AI Bot commands loaded successfully!');
