const HF_API_URL = 'https://api-inference.huggingface.co/models';

/**
 * Make a request to the HuggingFace Inference API.
 * @param {string} model - Model identifier.
 * @param {object} payload - Request payload.
 * @returns {object} API response data.
 */
const hfRequest = async (model, payload) => {
  const url = `${HF_API_URL}/${model}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 429) {
    throw new Error('HuggingFace API rate limit exceeded. Please try again later.');
  }

  if (response.status === 503) {
    const data = await response.json();
    throw new Error(
      `Model is loading. Estimated time: ${data.estimated_time || 'unknown'} seconds. Please try again shortly.`
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`HuggingFace API error: ${errorData.error || response.statusText}`);
  }

  return response.json();
};

/**
 * Classify exercise text using a zero-shot classification model.
 * @param {string} text - Exercise description to classify.
 * @returns {object} Classification result with labels and scores.
 */
const classifyExercise = async (text) => {
  const model = 'facebook/bart-large-mnli';
  const candidateLabels = [
    'cardio',
    'strength training',
    'flexibility',
    'balance',
    'endurance',
    'HIIT',
    'yoga',
    'stretching',
  ];

  const result = await hfRequest(model, {
    inputs: text,
    parameters: { candidate_labels: candidateLabels },
  });

  return result;
};

/**
 * Analyze text sentiment / intent related to fitness.
 * @param {string} text - Text to analyze.
 * @returns {object} Analysis result.
 */
const analyzeText = async (text) => {
  const model = 'distilbert-base-uncased-finetuned-sst-2-english';

  const result = await hfRequest(model, {
    inputs: text,
  });

  return result;
};

module.exports = { classifyExercise, analyzeText };
