// aiBot.js - WhatsApp Bot AI Command Handler
const axios = require('axios');
const fetch = require('node-fetch');
const { cmd } = require('./cmd');

// Register the AI command
cmd({
  name: 'ai',
  alias: ['gemini', 'ai1', 'a1', 'a2', 'ai2'],
  desc: 'Ask AI a question 🤔',
  category: 'ai',
  react: '🤔',
  filename: __filename
}, async (client, message, args, { from, q, reply }) => {
  try {
    if (!q) {
      return reply('Please provide a query for the AI!');
    }

    // React "thinking"
    await client.sendMessage(from, { react: '🤔' }, { quoted: message });

    let aiResponse = null;

    // Try main AI API first
    try {
      const res = await axios.get(`https://api.dreamed.site/api/chatgpt?text=${encodeURIComponent(q)}`);
      if (res.data?.answer) aiResponse = res.data.answer;
    } catch (err) {
      console.error('Error calling main AI API:', err.message);
    }

    // Fallback APIs if main API fails
    if (!aiResponse) {
      const fallbackUrls = [
        `https://api.giftedtech.my.id/api/ai?text=${encodeURIComponent(q)}`,
        `https://api.giftedtech.my.id/api/ai1?text=${encodeURIComponent(q)}`
      ];

      for (const url of fallbackUrls) {
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data?.answer) {
            aiResponse = data.answer;
            break;
          }
        } catch (_) {
          continue;
        }
      }
    }

    // Send response back to user
    if (aiResponse) {
      await client.sendMessage(from, { text: aiResponse }, { quoted: message });
    } else {
      await reply('😔 Sorry, I could not get an AI response.');
    }

  } catch (err) {
    console.error('AI command error:', err);
    await reply('😔 Something went wrong while processing your request.');
  }
});

console.log('🤖 AI Bot commands loaded successfully!');
