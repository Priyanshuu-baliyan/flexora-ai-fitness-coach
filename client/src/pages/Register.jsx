import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiArrowRight, HiArrowLeft, HiCheck, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

const steps = ['Account', 'Body Profile', 'Goals'];

const activityOptions = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Lightly Active' },
  { value: 'moderate', label: 'Moderately Active' },
  { value: 'active', label: 'Active' },
  { value: 'veryActive', label: 'Very Active' },
];
const goalOptions = [
  { value: 'loseFat', label: 'Lose Fat' },
  { value: 'buildMuscle', label: 'Build Muscle' },
  { value: 'maintain', label: 'Maintain Weight' },
  { value: 'improveEndurance', label: 'Improve Endurance' },
];

export default function Register() {
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', gender: 'male', height: '', weight: '',
    activityLevel: 'moderate', fitnessGoal: 'maintain',
  });
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Create Account | FlexOra — AI Fitness Coach';
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = 'Name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      if (form.password.length < 6) e.password = 'Min 6 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    if (step === 1) {
      if (!form.age || form.age < 13) e.age = 'Must be 13+';
      if (!form.height || form.height < 50) e.height = 'Invalid height';
      if (!form.weight || form.weight < 20) e.weight = 'Invalid weight';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 2)); };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register({ ...data, age: +data.age, height: +data.height, weight: +data.weight });
      navigate('/dashboard');
    } catch {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `input-field ${errors[field] ? 'border-accent!' : ''}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden gradient-dark">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl bg-dark-card border border-dark-border text-text-secondary hover:text-text-primary hover:bg-dark-surface transition-all duration-200 shadow-lg cursor-pointer z-50"
        title="Toggle theme"
      >
        {theme === 'dark' ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
      </button>

      <div className="absolute top-[-120px] right-[-80px] w-[400px] h-[400px] bg-primary rounded-full blur-[160px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-100px] w-[350px] h-[350px] bg-secondary rounded-full blur-[140px] opacity-15 pointer-events-none" />

      <div className="w-full max-w-lg animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary mb-3 glow-primary mx-auto">
            <span className="text-2xl font-black text-white leading-none select-none">F</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
          <p className="text-text-muted text-sm mt-1">Start your fitness journey with FlexOra</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < step ? 'gradient-primary text-white' : i === step ? 'border-2 border-primary text-primary bg-primary/10' : 'border-2 border-dark-border text-text-muted bg-dark-card'
                }`}>
                  {i < step ? <HiCheck className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-xs mt-1.5 ${i <= step ? 'text-primary' : 'text-text-muted'}`}>{label}</span>
              </div>
              {i < 2 && <div className={`w-16 h-0.5 mx-2 mb-5 rounded transition-colors duration-300 ${i < step ? 'bg-primary' : 'bg-dark-border'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8">
          {/* Step 0 – Account */}
          {step === 0 && (
            <div className="space-y-4 animate-fadeIn" key="step0">
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">Full Name</label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input type="text" placeholder="John Doe" className={`${inputClass('name')} input-icon-padding`} value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                {errors.name && <p className="text-accent text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">Email</label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input type="email" placeholder="you@example.com" className={`${inputClass('email')} input-icon-padding`} value={form.email} onChange={(e) => set('email', e.target.value)} />
                </div>
                {errors.email && <p className="text-accent text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">Password</label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" className={`${inputClass('password')} input-icon-padding !pr-12`} value={form.password} onChange={(e) => set('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                    {showPass ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-accent text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">Confirm Password</label>
                <input type="password" placeholder="Repeat password" className={inputClass('confirmPassword')} value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} />
                {errors.confirmPassword && <p className="text-accent text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          {/* Step 1 – Body */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn" key="step1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">Age</label>
                  <input type="number" placeholder="25" className={inputClass('age')} value={form.age} onChange={(e) => set('age', e.target.value)} />
                  {errors.age && <p className="text-accent text-xs mt-1">{errors.age}</p>}
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">Gender</label>
                  <select className="input-field" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">Height (cm)</label>
                  <input type="number" placeholder="175" className={inputClass('height')} value={form.height} onChange={(e) => set('height', e.target.value)} />
                  {errors.height && <p className="text-accent text-xs mt-1">{errors.height}</p>}
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">Weight (kg)</label>
                  <input type="number" placeholder="70" className={inputClass('weight')} value={form.weight} onChange={(e) => set('weight', e.target.value)} />
                  {errors.weight && <p className="text-accent text-xs mt-1">{errors.weight}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 – Goals */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn" key="step2">
              <div>
                <label className="text-sm text-text-secondary mb-2 block">Activity Level</label>
                <div className="grid grid-cols-1 gap-2">
                  {activityOptions.map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => set('activityLevel', o.value)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all duration-200 ${
                        form.activityLevel === o.value ? 'bg-primary/20 border border-primary text-primary' : 'bg-dark-surface border border-dark-border text-text-secondary hover:border-primary/40'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-2 block">Fitness Goal</label>
                <div className="grid grid-cols-2 gap-2">
                  {goalOptions.map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => set('fitnessGoal', o.value)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium text-center transition-all duration-200 ${
                        form.fitnessGoal === o.value ? 'bg-secondary/20 border border-secondary text-secondary' : 'bg-dark-surface border border-dark-border text-text-secondary hover:border-secondary/40'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button type="button" onClick={prev} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <HiArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 2 ? (
              <button type="button" onClick={next} className="btn-primary flex-1 flex items-center justify-center gap-2">
                Next <HiArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <div className="spinner" /> : 'Create Account'}
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-text-muted text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-light transition-colors font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
