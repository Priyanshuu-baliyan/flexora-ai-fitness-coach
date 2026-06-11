/**
 * HuggingFace Completion Service
 *
 * Provides `generateHFCompletion(systemPrompt, userPrompt, options)`
 * Used ONLY by workout.service and diet.service for plan generation.
 *
 * Uses Meta Llama 3.1 8B Instruct via HuggingFace serverless
 * Inference API (OpenAI-compatible chat completions endpoint).
 */

const HF_CHAT_URL =
  'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-8B-Instruct/v1/chat/completions';

/**
 * Generate a chat completion from HuggingFace Inference API.
 * @param {string} systemPrompt - System-level instructions.
 * @param {string} userPrompt - User message string.
 * @param {object} options - Optional overrides (temperature, max_tokens).
 * @returns {string} The assistant's response content.
 */
const generateHFCompletion = async (systemPrompt, userPrompt, options = {}) => {
  const {
    temperature = 0.7,
    max_tokens = 4096,
  } = options;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const apiKey = process.env.HF_API_KEY;
  if (!apiKey || apiKey === 'your_huggingface_api_key_here') {
    throw new Error('HuggingFace API key is not configured. Set HF_API_KEY in your .env file.');
  }

  try {
    const response = await fetch(HF_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'x-use-cache': 'false',
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        messages,
        temperature,
        max_tokens,
        stream: false,
      }),
    });

    if (response.status === 429) {
      throw new Error('AI service rate limit exceeded. Please try again in a moment.');
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error('AI service authentication failed. Check your HuggingFace API key.');
    }

    if (response.status === 503) {
      const data = await response.json().catch(() => ({}));
      const eta = data.estimated_time ? ` (~${Math.ceil(data.estimated_time)}s)` : '';
      throw new Error(`AI model is loading${eta}. Please try again shortly.`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`AI service error (${response.status}): ${errorData.error || response.statusText}`);
    }

    const data = await response.json();

    // HuggingFace chat completions return the same shape as OpenAI
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }

    // Fallback for older response format
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text;
    }

    throw new Error('Unexpected response format from AI service.');
  } catch (error) {
    if (error.message.startsWith('AI ') || error.message.startsWith('HuggingFace')) {
      throw error;
    }
    throw new Error(`AI service error: ${error.message}`);
  }
};

module.exports = { generateHFCompletion };
