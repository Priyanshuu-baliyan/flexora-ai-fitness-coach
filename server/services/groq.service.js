const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate a completion from Groq LLM.
 * Used by the chat service.
 * @param {string} systemPrompt - System-level instructions.
 * @param {string|Array} userPrompt - User message string or full messages array.
 * @param {object} options - Optional overrides (temperature, max_tokens, model).
 * @returns {string} The assistant's response content.
 */
const generateCompletion = async (systemPrompt, userPrompt, options = {}) => {
  try {
    const {
      temperature = 0.7,
      max_tokens = 4096,
      model = 'llama-3.3-70b-versatile',
    } = options;

    // Build messages array
    let messages;
    if (Array.isArray(userPrompt)) {
      // If a full messages array is provided, prepend the system prompt
      messages = [{ role: 'system', content: systemPrompt }, ...userPrompt];
    } else {
      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];
    }

    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    if (error.status === 429) {
      throw new Error('AI service rate limit exceeded. Please try again in a moment.');
    }
    if (error.status === 401) {
      throw new Error('AI service authentication failed. Check your API key.');
    }
    throw new Error(`AI service error: ${error.message}`);
  }
};

module.exports = { generateCompletion };
