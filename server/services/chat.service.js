const { generateCompletion } = require('./groq.service');

/**
 * Get a chat response from the AI fitness coach.
 * @param {string} message - The user's new message.
 * @param {Array} conversationHistory - Previous messages [{role, content}].
 * @returns {string} The AI assistant's response text.
 */
const getChatResponse = async (message, conversationHistory = []) => {
  const systemPrompt = `You are FlexOra, an AI fitness coach assistant. You are friendly, knowledgeable, and supportive.
You help users with:
- Workout advice and exercise form tips
- Nutrition guidance and meal suggestions
- Motivation and accountability
- Fitness goal setting and progress tracking
- General health and wellness questions

Guidelines:
- Keep responses concise but informative
- Be encouraging and positive
- If asked about medical conditions, recommend consulting a healthcare professional
- Provide evidence-based fitness and nutrition advice
- Use simple language that anyone can understand`;

  // Build messages from conversation history
  const messages = [];

  // Add conversation history
  if (conversationHistory && conversationHistory.length > 0) {
    // Keep only the last 20 messages to stay within context limits
    const recentHistory = conversationHistory.slice(-20);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }
  }

  // Add the new user message
  messages.push({ role: 'user', content: message });

  const response = await generateCompletion(systemPrompt, messages, {
    temperature: 0.8,
    max_tokens: 1024,
  });

  return response;
};

module.exports = { getChatResponse };
