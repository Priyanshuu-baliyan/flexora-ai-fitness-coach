import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import progressService from '../services/progress.service';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiOutlinePlus, HiCheck, HiX } from 'react-icons/hi';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl px-4 py-2 shadow-lg">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function Progress() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ weight: '', caloriesBurned: '', workoutCompleted: false, notes: '' });

  const fetchProgress = async () => {
    try {
      const { data } = await progressService.getProgress();
      setEntries(data.progress || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    document.title = 'Progress Tracker | FlexOra — AI Fitness Coach';
    fetchProgress();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.weight) return toast.error('Weight is required');
    setSubmitting(true);
    try {
      const heightM = (user?.height || 170) / 100;
      const bmi = +(parseFloat(form.weight) / (heightM * heightM)).toFixed(1);
      await progressService.addProgress({ ...form, weight: +form.weight, caloriesBurned: +form.caloriesBurned || 0, bmi });
      toast.success('Progress logged!');
      setForm({ weight: '', caloriesBurned: '', workoutCompleted: false, notes: '' });
      fetchProgress();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log progress');
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = entries.slice().reverse().map((p) => ({
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: p.weight,
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="animate-fadeIn">
        <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Progress Tracking</h1>
        <p className="text-text-muted mt-1">Log and monitor your fitness journey</p>
      </div>

      {/* Add Entry */}
      <form onSubmit={handleAdd} className="glass-card p-6 animate-slideUp">
        <h3 className="text-lg font-semibold mb-4">Log Your Progress</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Weight (kg)*</label>
            <input type="number" step="0.1" placeholder="70.5" className="input-field" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Calories Burned</label>
            <input type="number" placeholder="350" className="input-field" value={form.caloriesBurned} onChange={(e) => setForm({ ...form, caloriesBurned: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Workout Done?</label>
            <button type="button" onClick={() => setForm({ ...form, workoutCompleted: !form.workoutCompleted })} className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${form.workoutCompleted ? 'bg-success/20 border border-success text-success' : 'bg-dark-surface border border-dark-border text-text-muted'}`}>
              {form.workoutCompleted ? '✓ Yes' : 'No'}
            </button>
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Notes</label>
            <input type="text" placeholder="Felt great!" className="input-field" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <div className="spinner" /> : <><HiOutlinePlus className="w-5 h-5" /> Add Entry</>}
          </button>
        </div>
      </form>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="glass-card p-6 animate-slideUp" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold mb-4">Weight Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} name="Weight (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History Table */}
      <div className="glass-card p-6 animate-slideUp" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
        {loading ? (
          <div className="flex justify-center py-8"><div className="spinner w-8 h-8" /></div>
        ) : entries.length === 0 ? (
          <p className="text-text-muted text-center py-8">No entries yet. Start tracking above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted border-b border-dark-border">
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-center pb-3 font-medium">Weight</th>
                  <th className="text-center pb-3 font-medium">BMI</th>
                  <th className="text-center pb-3 font-medium">Calories</th>
                  <th className="text-center pb-3 font-medium">Workout</th>
                  <th className="text-left pb-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={e._id || i} className="border-b border-dark-border/40 last:border-0 hover:bg-dark-surface/30 transition-colors">
                    <td className="py-3 text-text-primary">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="py-3 text-center font-medium">{e.weight} kg</td>
                    <td className="py-3 text-center text-text-secondary">{e.bmi || '—'}</td>
                    <td className="py-3 text-center text-text-secondary">{e.caloriesBurned || 0}</td>
                    <td className="py-3 text-center">{e.workoutCompleted ? <HiCheck className="w-5 h-5 text-success mx-auto" /> : <HiX className="w-5 h-5 text-accent mx-auto" />}</td>
                    <td className="py-3 text-text-muted truncate max-w-[150px]">{e.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
