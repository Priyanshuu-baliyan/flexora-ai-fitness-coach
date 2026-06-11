import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import progressService from '../services/progress.service';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiOutlineTrendingUp, HiOutlineChartBar, HiOutlineFire, HiOutlineLightningBolt } from 'react-icons/hi';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl px-4 py-2 shadow-lg">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    document.title = 'Dashboard | FlexOra — AI Fitness Coach';
    const fetch = async () => {
      try {
        const { data } = await progressService.getProgress();
        if (data.progress?.length) {
          setProgress(data.progress.map((p) => ({
            date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            weight: p.weight,
            bmi: p.bmi || +(p.weight / ((user?.height / 100) ** 2)).toFixed(1),
            workouts: p.workoutCompleted ? 1 : 0,
            calories: p.caloriesBurned || 0,
          })).reverse());
          setHasData(true);
        }
      } catch { /* ignore error and start with zero */ }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const chartData = hasData ? progress : [];
  const latestWeight = hasData ? progress[progress.length - 1]?.weight : user?.weight || 0;
  const totalCalories = hasData ? progress.reduce((s, p) => s + (p.calories || 0), 0) : 0;
  const totalWorkouts = hasData ? progress.filter((p) => p.workouts).length : 0;
  const goalProgress = hasData ? Math.min(100, Math.round((totalWorkouts / Math.max(progress.length || 7, 1)) * 100)) : 0;

  const stats = [
    { label: 'Current Weight', value: latestWeight ? `${latestWeight} kg` : '0 kg', icon: HiOutlineTrendingUp, color: 'text-primary' },
    { label: 'Goal Progress', value: `${goalProgress}%`, icon: HiOutlineChartBar, color: 'text-secondary' },
    { label: 'Calories Burned', value: totalCalories.toLocaleString(), icon: HiOutlineFire, color: 'text-accent' },
    { label: 'Workouts Done', value: totalWorkouts, icon: HiOutlineLightningBolt, color: 'text-warning' },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-10 h-10" /></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fadeIn">
        <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, <span className="gradient-text">{user?.name || 'Champion'}</span>!</h1>
        <p className="text-text-muted mt-1">{today}</p>
      </div>

      {!hasData && (
        <div className="glass-card px-5 py-4 border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0" />
            <div>
              <p className="text-sm font-semibold text-text-primary">No progress tracked yet</p>
              <p className="text-xs text-text-muted">Start logging your daily workouts, weight, and calorie burn to unlock visual progress tracking.</p>
            </div>
          </div>
          <Link to="/progress" className="btn-secondary text-xs px-4 py-2 shrink-0 text-center">
            Go to Progress Page
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className="glass-card p-5 animate-slideUp" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <HiOutlineTrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-text-muted text-sm">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Chart */}
        <div className="glass-card p-6 animate-slideUp" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold mb-4">Weight Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2} fill="url(#weightGrad)" name="Weight (kg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* BMI Chart */}
        <div className="glass-card p-6 animate-slideUp" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-semibold mb-4">BMI Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="bmiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="bmi" stroke="var(--secondary)" strokeWidth={2} fill="url(#bmiGrad)" name="BMI" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workout Consistency */}
      <div className="glass-card p-6 animate-slideUp" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-semibold mb-4">Weekly Workout Consistency</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="workouts" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Workouts" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
