import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import aiService from '../services/ai.service';
import toast from 'react-hot-toast';
import {
  HiOutlineLightningBolt,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineFire,
} from 'react-icons/hi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const FOCUS_LABELS = {
  fullBody: 'Full Body',
  upperBody: 'Upper Body',
  lowerBody: 'Lower Body',
  push: 'Push (Chest / Shoulders / Triceps)',
  pull: 'Pull (Back / Biceps)',
  cardio: 'Cardio & Conditioning',
};

export default function WorkoutPlan() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [previousPlan, setPreviousPlan] = useState(null);
  const [form, setForm] = useState({
    experienceLevel: 'beginner',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    focusArea: 'fullBody',
  });

  useEffect(() => {
    document.title = 'AI Workout Plan | FlexOra — AI Fitness Coach';
  }, []);

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter((d) => d !== day)
        : [...f.availableDays, day],
    }));
  };

  const handleGenerate = async () => {
    if (!form.availableDays.length) return toast.error('Select at least one day');
    setLoading(true);
    setPlan(null);
    try {
      const seed = Date.now() + Math.random();
      const { data } = await aiService.generateWorkout({
        age: user?.age,
        weight: user?.weight,
        height: user?.height,
        goal: user?.fitnessGoal,
        experienceLevel: form.experienceLevel,
        focusArea: form.focusArea,
        availableDays: form.availableDays.length,
        seed,
        previousPlan,
      });
      setPlan(data.plan);
      setPreviousPlan(data.plan);
      toast.success('Workout plan generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fadeIn">
        <h1 className="text-2xl lg:text-3xl font-bold gradient-text">AI Workout Plan</h1>
        <p className="text-text-muted mt-1">Generate a personalized workout plan powered by AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Config Panel ── */}
        <div className="glass-card p-6 space-y-5 animate-slideUp lg:col-span-1">
          <h3 className="text-lg font-semibold">Configure Your Plan</h3>

          {/* Experience Level */}
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block font-medium">
              Experience Level
            </label>
            <select
              className="input-field"
              value={form.experienceLevel}
              onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Focus Area */}
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block font-medium">
              Focus Area
            </label>
            <select
              className="input-field"
              value={form.focusArea}
              onChange={(e) => setForm({ ...form, focusArea: e.target.value })}
            >
              <option value="fullBody">Full Body</option>
              <option value="upperBody">Upper Body</option>
              <option value="lowerBody">Lower Body</option>
              <option value="push">Push (Chest / Shoulders / Triceps)</option>
              <option value="pull">Pull (Back / Biceps)</option>
              <option value="cardio">Cardio &amp; Conditioning</option>
            </select>
          </div>

          {/* Available Days */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block font-medium">
              Available Days
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    form.availableDays.includes(d)
                      ? 'bg-primary/20 border border-primary text-primary'
                      : 'bg-dark-surface border border-dark-border text-text-muted hover:border-primary/40'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-2">
              {form.availableDays.length} day{form.availableDays.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="spinner" />
            ) : (
              <>
                <HiOutlineLightningBolt className="w-5 h-5" />
                Generate Plan
              </>
            )}
          </button>
        </div>

        {/* ── Results Panel ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Empty state */}
          {!plan && !loading && (
            <div className="glass-card p-12 text-center animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <HiOutlineLightningBolt className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to Train?</h3>
              <p className="text-text-muted text-sm">
                Configure your preferences and generate a personalised AI workout plan
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="glass-card p-12 text-center">
              <div className="spinner w-12 h-12 mx-auto mb-4" />
              <p className="text-text-secondary font-medium">
                AI is crafting your {FOCUS_LABELS[form.focusArea]} plan…
              </p>
              <p className="text-text-muted text-sm mt-1">This may take a few seconds</p>
            </div>
          )}

          {/* Plan results */}
          {plan && !loading && (
            <>
              {/* Plan overview card */}
              <div className="glass-card p-5 animate-fadeIn">
                <h2 className="text-xl font-bold">{plan.planName}</h2>
                <p className="text-text-secondary text-sm mt-1">{plan.description}</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-primary/15 text-primary font-medium">
                    🎯 {FOCUS_LABELS[form.focusArea]}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-dark-surface text-text-secondary">
                    📅 {plan.daysPerWeek ?? form.availableDays.length} days / week
                  </span>
                  {plan.durationWeeks && (
                    <span className="text-xs px-3 py-1 rounded-full bg-dark-surface text-text-secondary">
                      ⏱ {plan.durationWeeks} weeks
                    </span>
                  )}
                </div>
              </div>

              {/* Workout day cards */}
              {(plan.weeklyPlan || plan.workouts || []).map((day, i) => (
                <div
                  key={i}
                  className="glass-card p-5 animate-slideUp"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Day header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{day.day}</h3>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/15 text-primary">
                        {day.focus}
                      </span>
                    </div>
                    {day.estimatedDurationMinutes && (
                      <div className="flex items-center gap-1 text-text-muted text-sm shrink-0">
                        <HiOutlineClock className="w-4 h-4" />
                        <span>{day.estimatedDurationMinutes} min</span>
                      </div>
                    )}
                  </div>

                  {/* Warm-up */}
                  {day.warmup && (
                    <div className="mb-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                        Warm-up
                      </p>
                      <p className="text-sm text-text-secondary">{day.warmup}</p>
                    </div>
                  )}

                  {/* Exercise table */}
                  {day.exercises?.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-text-muted border-b border-dark-border">
                            <th className="text-left pb-2 font-medium">Exercise</th>
                            <th className="text-center pb-2 font-medium">Sets</th>
                            <th className="text-center pb-2 font-medium">Reps</th>
                            <th className="text-center pb-2 font-medium">Rest</th>
                          </tr>
                        </thead>
                        <tbody>
                          {day.exercises.map((ex, j) => (
                            <tr key={j} className="border-b border-dark-border/50 last:border-0">
                              <td className="py-2.5 pr-2">
                                <p className="text-text-primary font-medium">{ex.name}</p>
                                {ex.notes && (
                                  <p className="text-xs text-text-muted mt-0.5 italic">{ex.notes}</p>
                                )}
                              </td>
                              <td className="py-2.5 text-center text-text-secondary">{ex.sets}</td>
                              <td className="py-2.5 text-center text-text-secondary">{ex.reps}</td>
                              <td className="py-2.5 text-center text-text-secondary">
                                <span className="flex items-center justify-center gap-1">
                                  <HiOutlineClock className="w-3.5 h-3.5" />
                                  {ex.rest || (ex.restSeconds ? `${ex.restSeconds}s` : '60s')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-text-muted text-sm italic">Rest Day 🧘</p>
                  )}

                  {/* Cool-down */}
                  {day.cooldown && (
                    <div className="mt-3 p-3 rounded-lg bg-dark-surface border border-dark-border">
                      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                        Cool-down
                      </p>
                      <p className="text-sm text-text-muted">{day.cooldown}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* Pro Tips */}
              {plan.tips?.length > 0 && (
                <div className="glass-card p-5 animate-slideUp">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <HiOutlineFire className="w-5 h-5 text-primary" />
                    Pro Tips
                  </h3>
                  <ul className="space-y-2">
                    {plan.tips.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm text-text-secondary">
                        <span className="text-primary mt-0.5">•</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regenerate */}
              <button
                onClick={handleGenerate}
                className="btn-secondary flex items-center gap-2 mx-auto"
              >
                <HiOutlineRefresh className="w-4 h-4" />
                Regenerate Plan
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
