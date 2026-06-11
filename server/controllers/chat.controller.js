const { getChatResponse } = require('../services/chat.service');

/**
 * @desc    Send a message to AI fitness coach
 * @route   POST /api/chat
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const response = await getChatResponse(message, conversationHistory);

    res.json({
      message: 'Response generated successfully',
      response,
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({
      error: 'Failed to get AI response. Please try again.',
    });
  }
};

module.exports = { sendMessage };
