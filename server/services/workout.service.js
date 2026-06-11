const { generateCompletion } = require('./groq.service');

// Focus area to muscle group mapping for explicit prompting
const FOCUS_AREA_DESCRIPTIONS = {
  fullBody: 'Full Body (all major muscle groups: chest, back, shoulders, arms, legs, core equally distributed)',
  upperBody: 'Upper Body ONLY (chest, back, shoulders, biceps, triceps — NO leg exercises at all)',
  lowerBody: 'Lower Body ONLY (quadriceps, hamstrings, glutes, calves, hip flexors — NO upper body exercises at all)',
  push: 'Push muscles ONLY (chest, front deltoids, triceps — exercises like bench press, overhead press, dips, push-ups, chest flies)',
  pull: 'Pull muscles ONLY (back, rear deltoids, biceps — exercises like pull-ups, rows, lat pulldowns, face pulls, curls)',
  cardio: 'Cardio and conditioning ONLY (running, cycling, jump rope, HIIT circuits, burpees, mountain climbers — NO weightlifting)',
};

// Helper to extract unique exercises from a previous workout plan
const getExercisesFromPlan = (plan) => {
  if (!plan) return [];
  const exercises = [];
  const workouts = plan.workouts || plan.weeklyPlan || [];
  for (const day of workouts) {
    if (day.exercises && Array.isArray(day.exercises)) {
      for (const ex of day.exercises) {
        if (ex.name) {
          exercises.push(ex.name);
        }
      }
    }
  }
  return [...new Set(exercises)];
};

/**
 * Generate a structured workout plan using AI.
 * @param {object} userData - User fitness data.
 * @returns {object} Parsed workout plan.
 */
const generateWorkoutPlan = async (userData) => {
  const {
    age = 25,
    weight = 70,
    height = 170,
    goal = 'maintain',
    experienceLevel = 'intermediate',
    availableDays = 4,
    focusArea = 'fullBody',
    seed,
    previousPlan,
  } = userData;

  const focusDescription = FOCUS_AREA_DESCRIPTIONS[focusArea] || FOCUS_AREA_DESCRIPTIONS.fullBody;

  const prevExercises = getExercisesFromPlan(previousPlan);
  let previousPlanInstruction = '';
  if (prevExercises.length > 0) {
    previousPlanInstruction = `\n- Do not repeat exercises or meals from the previous plan unless necessary. Specifically, avoid repeating these exercises: ${prevExercises.join(', ')}.`;
  }

  const systemPrompt = `You are a certified fitness coach.

Generate a UNIQUE workout plan.

User Profile:
- Experience Level: ${experienceLevel}
- Focus Area: ${focusDescription}
- Available Days: ${availableDays}

Random Seed: ${seed || 'none'}

Rules:
- Use different exercises whenever possible.
- Vary workout structure each generation (exercise selection, exercise order, sets, reps, and meal timing/warmups).
- Include sets, reps, and rest time.
- Return valid JSON only.
- Do not repeat the previous workout plan.${previousPlanInstruction}

You MUST respond ONLY with valid JSON. Do NOT include any markdown formatting, code fences, explanatory text, or anything outside the JSON object.
CRITICAL RULES you must follow strictly:
1. ALL exercises must strictly match the requested focus area. Never include exercises from other muscle groups unless it is Full Body.
2. Every workout day must have COMPLETELY DIFFERENT exercises — never repeat the same exercise name across different days.
3. Choose exercises that are appropriate for the user's experience level.
4. Include 5-7 exercises per day, all targeting the specified focus area.`;

  const userPrompt = `Create a personalized ${availableDays}-day workout plan for the following user using the guidelines and the random seed.

Respond with ONLY this exact JSON structure, no other text:
{
  "planName": "string - name of the plan",
  "description": "string - brief overview mentioning the ${focusArea} focus",
  "durationWeeks": number,
  "daysPerWeek": ${availableDays},
  "workouts": [
    {
      "day": "string - e.g. Day 1",
      "focus": "string - specific muscle group focus for this day matching ${focusArea}",
      "exercises": [
        {
          "name": "string - exercise name",
          "sets": number,
          "reps": "string - e.g. 8-12 or 30 seconds",
          "restSeconds": number,
          "notes": "string - form tips and cues"
        }
      ],
      "warmup": "string - warmup instructions relevant to ${focusArea}",
      "cooldown": "string - cooldown instructions",
      "estimatedDurationMinutes": number
    }
  ],
  "tips": ["string - tips specific to ${focusArea} training"]
}`;

  const response = await generateCompletion(systemPrompt, userPrompt, {
    temperature: 0.9,
    max_tokens: 6000,
  });

  try {
    // Strip potential markdown fences
    const cleaned = response.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();
    const plan = JSON.parse(cleaned);
    return plan;
  } catch (parseError) {
    console.error('Failed to parse workout plan JSON:', parseError.message);
    console.error('Raw response:', response);
    throw new Error('Failed to parse AI workout response. Please try again.');
  }
};

module.exports = { generateWorkoutPlan };
