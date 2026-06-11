import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import aiService from '../services/ai.service';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { HiOutlineRefresh } from 'react-icons/hi';
import { GiMeal } from 'react-icons/gi';

const MACRO_COLORS = ['#6C63FF', '#00D9A6', '#FF6B6B'];

export default function DietPlan() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [previousPlan, setPreviousPlan] = useState(null);
  const [form, setForm] = useState({ dietaryPreference: 'anything' });

  useEffect(() => {
    document.title = 'AI Diet Plan | FlexOra — AI Fitness Coach';
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const seed = Date.now() + Math.random();
      const { data } = await aiService.generateDiet({
        ...form,
        weight: user?.weight,
        goal: user?.fitnessGoal,
        activityLevel: user?.activityLevel,
        seed,
        previousPlan,
      });
      setPlan(data.plan);
      setPreviousPlan(data.plan);
      toast.success('Diet plan generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate diet plan');
    } finally {
      setLoading(false);
    }
  };

  // Normalize AI response - handle both {dailyTargets} and {dailyCalories, macros} shapes
  const targets = plan?.dailyTargets || (plan ? {
    calories: plan.dailyCalories || 2000,
    protein: parseInt(plan.macros?.protein) || 150,
    carbs: parseInt(plan.macros?.carbs) || 200,
    fat: parseInt(plan.macros?.fat) || 65,
  } : null);

  const macroData = targets ? [
    { name: 'Protein', value: targets.protein, unit: 'g' },
    { name: 'Carbs', value: targets.carbs, unit: 'g' },
    { name: 'Fat', value: targets.fat, unit: 'g' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl lg:text-3xl font-bold gradient-text">AI Diet Plan</h1>
        <p className="text-text-muted mt-1">Get personalized nutrition recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config */}
        <div className="glass-card p-6 space-y-5 animate-slideUp lg:col-span-1">
          <h3 className="text-lg font-semibold">Preferences</h3>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Dietary Preference</label>
            <select className="input-field" value={form.dietaryPreference} onChange={(e) => setForm({ ...form, dietaryPreference: e.target.value })}>
              <option value="anything">No Restrictions</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
              <option value="paleo">Paleo</option>
              <option value="mediterranean">Mediterranean</option>
            </select>
          </div>
          <div className="glass-card p-4 bg-dark-surface/50">
            <p className="text-xs text-text-muted mb-2">Your Profile</p>
            <div className="space-y-1 text-sm">
              <p className="text-text-secondary">Weight: <span className="text-text-primary font-medium">{user?.weight || '—'} kg</span></p>
              <p className="text-text-secondary">Goal: <span className="text-text-primary font-medium capitalize">{user?.fitnessGoal?.replace(/([A-Z])/g, ' $1') || '—'}</span></p>
              <p className="text-text-secondary">Activity: <span className="text-text-primary font-medium capitalize">{user?.activityLevel || '—'}</span></p>
            </div>
          </div>
          <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="spinner" /> : <><GiMeal className="w-5 h-5" /> Generate Diet Plan</>}
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {!plan && !loading && (
            <div className="glass-card p-12 text-center animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <GiMeal className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Eat Smart</h3>
              <p className="text-text-muted text-sm">Get AI-generated meal recommendations tailored to your goals</p>
            </div>
          )}

          {loading && (
            <div className="glass-card p-12 text-center">
              <div className="spinner w-12 h-12 mx-auto mb-4" />
              <p className="text-text-secondary">Crafting your personalized nutrition plan...</p>
            </div>
          )}

          {plan && !loading && (
            <>
              {/* Macro Overview */}
              <div className="glass-card p-6 animate-slideUp">
                <h3 className="text-lg font-semibold mb-4">Daily Targets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={macroData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                          {macroData.map((_, i) => <Cell key={i} fill={MACRO_COLORS[i]} />)}
                        </Pie>
                        <Tooltip formatter={(val, name) => [`${val}g`, name]} contentStyle={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 12, color: 'var(--text-primary)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-dark-surface">
                      <span className="text-text-secondary text-sm">🔥 Calories</span>
                      <span className="text-xl font-bold text-warning">{targets?.calories || plan?.dailyCalories || '—'}</span>
                    </div>
                    {macroData.map((m, i) => (
                      <div key={m.name} className="flex items-center justify-between p-3 rounded-xl bg-dark-surface">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: MACRO_COLORS[i] }} />
                          <span className="text-text-secondary text-sm">{m.name}</span>
                        </div>
                        <span className="font-bold">{m.value}g</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Meals */}
              {plan.meals?.map((meal, i) => (
                <div key={i} className="glass-card p-5 animate-slideUp" style={{ animationDelay: `${(i + 1) * 80}ms` }}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg">{meal.name || meal.meal}</h4>
                    {meal.time && <span className="text-xs text-text-muted bg-dark-surface px-3 py-1 rounded-full">{meal.time}</span>}
                  </div>
                  {meal.foods && (
                    <ul className="space-y-1.5">
                      {(Array.isArray(meal.foods) ? meal.foods : [meal.foods]).map((f, j) => (
                        <li key={j} className="text-sm text-text-secondary flex items-center gap-2">
                          <span className="text-secondary">•</span> {typeof f === 'string' ? f : f.name || JSON.stringify(f)}
                        </li>
                      ))}
                    </ul>
                  )}
                  {meal.macros && (
                    <div className="flex gap-4 mt-3 pt-3 border-t border-dark-border/50">
                      {Object.entries(meal.macros).map(([k, v]) => (
                        <span key={k} className="text-xs text-text-muted"><span className="text-text-secondary font-medium capitalize">{k}:</span> {v}{typeof v === 'number' ? (k === 'calories' ? '' : 'g') : ''}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {plan.tips?.length > 0 && (
                <div className="glass-card p-5 animate-slideUp">
                  <h3 className="text-lg font-semibold mb-3">🥗 Nutrition Tips</h3>
                  <ul className="space-y-2">
                    {plan.tips.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm text-text-secondary"><span className="text-secondary mt-0.5">•</span> {t}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={handleGenerate} className="btn-secondary flex items-center gap-2 mx-auto">
                <HiOutlineRefresh className="w-4 h-4" /> Regenerate
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
