const { generateCompletion } = require('./groq.service');

// Helper to extract unique meals and foods from a previous diet plan
const getMealsFromPlan = (plan) => {
  if (!plan) return [];
  const mealsAndFoods = [];
  const meals = plan.meals || [];
  for (const m of meals) {
    const mealName = m.meal || m.name;
    if (mealName) mealsAndFoods.push(mealName);
    if (m.foods && Array.isArray(m.foods)) {
      for (const f of m.foods) {
        const foodName = typeof f === 'string' ? f : f.name;
        if (foodName) mealsAndFoods.push(foodName);
      }
    }
  }
  const snacks = plan.snacks || [];
  for (const s of snacks) {
    const snackName = typeof s === 'string' ? s : s.name;
    if (snackName) mealsAndFoods.push(snackName);
  }
  return [...new Set(mealsAndFoods)];
};

/**
 * Generate a structured diet plan using AI.
 * @param {object} userData - User diet/nutrition data.
 * @returns {object} Parsed diet plan.
 */
const generateDietPlan = async (userData) => {
  const {
    weight = 70,
    goal = 'maintain',
    dietaryPreference = 'balanced',
    activityLevel = 'moderate',
    allergies = '',
    mealsPerDay = 3,
    seed,
    previousPlan,
  } = userData;

  const prevMeals = getMealsFromPlan(previousPlan);
  let previousPlanInstruction = '';
  if (prevMeals.length > 0) {
    previousPlanInstruction = `\n- Do not repeat exercises or meals from the previous plan unless necessary. Specifically, avoid repeating these meals/foods: ${prevMeals.join(', ')}.`;
  }

  const systemPrompt = `You are a certified nutritionist.

Generate a UNIQUE diet plan.

User Profile:
- Weight: ${weight} kg
- Goal: ${goal}
- Activity Level: ${activityLevel}
- Diet Preference: ${dietaryPreference}

Random Seed: ${seed || 'none'}

Rules:
- Use different meals whenever possible.
- Vary cuisines and ingredients.
- Include breakfast, lunch, dinner, and snacks.
- Include calories, protein, carbs, and fats.
- Return valid JSON only.
- Do not repeat the previous diet plan.${previousPlanInstruction}

You MUST respond ONLY with valid JSON. Do NOT include any markdown formatting, code fences, explanatory text, or anything outside the JSON object.`;

  const userPrompt = `Create a personalized daily diet plan for the user using the guidelines and the random seed.

Respond with ONLY this exact JSON structure, no other text:
{
  "planName": "string - name of the diet plan",
  "dailyCalories": number,
  "macros": {
    "protein": "string - e.g. 150g",
    "carbs": "string - e.g. 200g",
    "fat": "string - e.g. 60g"
  },
  "meals": [
    {
      "meal": "string - e.g. Breakfast",
      "time": "string - e.g. 7:00 AM",
      "foods": [
        {
          "name": "string",
          "portion": "string - e.g. 200g",
          "calories": number,
          "protein": "string",
          "carbs": "string",
          "fat": "string"
        }
      ],
      "totalCalories": number
    }
  ],
  "snacks": [
    {
      "name": "string",
      "portion": "string",
      "calories": number
    }
  ],
  "hydration": "string - daily water intake recommendation",
  "tips": ["string - nutrition tips"]
}`;

  const response = await generateCompletion(systemPrompt, userPrompt, {
    temperature: 0.9,
    max_tokens: 4096,
  });

  try {
    const cleaned = response.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();
    const plan = JSON.parse(cleaned);
    return plan;
  } catch (parseError) {
    console.error('Failed to parse diet plan JSON:', parseError.message);
    console.error('Raw response:', response);
    throw new Error('Failed to parse AI diet response. Please try again.');
  }
};

module.exports = { generateDietPlan };
