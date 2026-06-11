import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import profileService from '../services/profile.service';
import toast from 'react-hot-toast';
import { HiOutlineCamera } from 'react-icons/hi';

const activityLabels = { sedentary: 'Sedentary', light: 'Lightly Active', moderate: 'Moderately Active', active: 'Active', veryActive: 'Very Active' };
const goalLabels = { loseFat: 'Lose Fat', buildMuscle: 'Build Muscle', maintain: 'Maintain Weight', improveEndurance: 'Improve Endurance' };

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: '', age: '', gender: 'male', height: '', weight: '', activityLevel: 'moderate', fitnessGoal: 'maintain',
  });

  useEffect(() => {
    document.title = 'My Profile | FlexOra — AI Fitness Coach';
    const load = async () => {
      try {
        const { data } = await profileService.getProfile();
        const u = data.user;
        setForm({ name: u.name || '', age: u.age || '', gender: u.gender || 'male', height: u.height || '', weight: u.weight || '', activityLevel: u.activityLevel || 'moderate', fitnessGoal: u.fitnessGoal || 'maintain' });
      } catch { /* fallback to context */ }
      setFetching(false);
    };
    load();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await profileService.updateProfile({ ...form, age: +form.age, height: +form.height, weight: +form.weight });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await profileService.uploadAvatar(fd);
      updateUser(data.user);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Upload failed');
    }
  };

  if (fetching) return <div className="flex justify-center py-20"><div className="spinner w-10 h-10" /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="animate-fadeIn">
        <h1 className="text-2xl lg:text-3xl font-bold gradient-text">My Profile</h1>
        <p className="text-text-muted mt-1">Manage your personal information and fitness data</p>
      </div>

      {/* Avatar & Info */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6 animate-slideUp">
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-3xl font-bold text-white">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-2xl object-cover" /> : user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <label className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
            <HiOutlineCamera className="w-6 h-6 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-text-muted text-sm">{user?.email}</p>
          <p className="text-text-muted text-xs mt-1">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="glass-card p-6 animate-slideUp" style={{ animationDelay: '100ms' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {/* Left Column */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-primary">Personal Info</h3>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Full Name</label>
              <input type="text" className="input-field" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Email</label>
              <input type="email" className="input-field opacity-60" value={user?.email || ''} readOnly />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">Age</label>
                <input type="number" className="input-field" value={form.age} onChange={(e) => set('age', e.target.value)} />
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
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-secondary">Fitness Data</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">Height (cm)</label>
                <input type="number" className="input-field" value={form.height} onChange={(e) => set('height', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">Weight (kg)</label>
                <input type="number" className="input-field" value={form.weight} onChange={(e) => set('weight', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Activity Level</label>
              <select className="input-field" value={form.activityLevel} onChange={(e) => set('activityLevel', e.target.value)}>
                {Object.entries(activityLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Fitness Goal</label>
              <select className="input-field" value={form.fitnessGoal} onChange={(e) => set('fitnessGoal', e.target.value)}>
                {Object.entries(goalLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {loading ? <div className="spinner" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
