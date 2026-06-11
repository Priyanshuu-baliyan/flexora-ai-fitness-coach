import { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';
import { HiOutlineUsers, HiOutlineUserAdd, HiOutlineChartBar, HiOutlineTrash, HiOutlineSearch, HiOutlinePencilAlt } from 'react-icons/hi';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'workouts', 'diets'
  
  const [users, setUsers] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [diets, setDiets] = useState([]);
  const [analytics, setAnalytics] = useState({ totalUsers: 0, newUsersThisMonth: 0, totalProgressEntries: 0 });
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal, setEditModal] = useState(null); // { type: 'workout' | 'diet', data: {} }
  const [editJsonStr, setEditJsonStr] = useState('');
  
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const [usersRes, analyticsRes] = await Promise.all([
          adminService.getUsers(page),
          adminService.getAnalytics(),
        ]);
        setUsers(usersRes.data.users || []);
        setAnalytics(analyticsRes.data.analytics || analytics);
      } else if (activeTab === 'workouts') {
        const res = await adminService.getWorkouts();
        setWorkouts(res.data.workouts || []);
      } else if (activeTab === 'diets') {
        const res = await adminService.getDiets();
        setDiets(res.data.diets || []);
      }
    } catch {
      toast.error('Failed to load admin data');
    }
    setLoading(false);
  };

  useEffect(() => {
    document.title = 'Admin Panel | FlexOra — AI Fitness Coach';
    fetchData();
  }, [activeTab, page]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await adminService.deleteUser(deleteModal._id);
      toast.success('User deleted');
      setDeleteModal(null);
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const openEditModal = (type, item) => {
    setEditModal({ type, item });
    // Stringify but remove mongoose internal fields like __v, and user objects to avoid confusion
    const { _id, __v, userId, createdAt, updatedAt, ...cleanData } = item;
    setEditJsonStr(JSON.stringify(cleanData, null, 2));
  };

  const handleSaveEdit = async () => {
    try {
      const parsedData = JSON.parse(editJsonStr);
      if (editModal.type === 'workout') {
        await adminService.updateWorkout(editModal.item._id, parsedData);
        toast.success('Workout updated');
      } else if (editModal.type === 'diet') {
        await adminService.updateDiet(editModal.item._id, parsedData);
        toast.success('Diet updated');
      }
      setEditModal(null);
      fetchData();
    } catch (err) {
      toast.error('Invalid JSON or update failed');
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredWorkouts = workouts.filter((w) =>
    w.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.userId?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDiets = diets.filter((d) =>
    d.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.userId?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Users', value: analytics.totalUsers, icon: HiOutlineUsers, color: 'text-primary' },
    { label: 'New This Month', value: analytics.newUsersThisMonth, icon: HiOutlineUserAdd, color: 'text-secondary' },
    { label: 'Progress Entries', value: analytics.totalProgressEntries, icon: HiOutlineChartBar, color: 'text-warning' },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl lg:text-3xl font-bold"><span className="gradient-text">Admin</span> Dashboard</h1>
        <p className="text-text-muted mt-1">Manage users, workouts, and diets</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-dark-border pb-2">
        {['users', 'workouts', 'diets'].map(tab => (
          <button 
            key={tab} 
            onClick={() => { setActiveTab(tab); setSearch(''); setPage(1); }}
            className={`capitalize font-semibold pb-2 border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <div key={s.label} className="glass-card p-5 animate-slideUp" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 ${s.color} mb-3`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-text-muted text-sm">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-6 animate-slideUp" style={{ animationDelay: '200ms' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold">User Management</h3>
              <div className="relative w-full sm:w-64">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="text" placeholder="Search users..." className="input-field search-icon-padding text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-muted border-b border-dark-border">
                    <th className="text-left pb-3 font-medium">Name</th>
                    <th className="text-left pb-3 font-medium">Email</th>
                    <th className="text-center pb-3 font-medium">Role</th>
                    <th className="text-center pb-3 font-medium">Joined</th>
                    <th className="text-center pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-6 text-text-muted">Loading...</td></tr>
                  ) : filteredUsers.map((u) => (
                    <tr key={u._id} className="border-b border-dark-border/40 last:border-0 hover:bg-dark-surface/30 transition-colors">
                      <td className="py-3 font-medium">{u.name}</td>
                      <td className="py-3 text-text-secondary">{u.email}</td>
                      <td className="py-3 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-accent/15 text-accent' : 'bg-primary/15 text-primary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-center text-text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => setDeleteModal(u)}
                          className="p-2 rounded-lg text-accent hover:bg-accent/10 transition-colors disabled:opacity-30"
                          disabled={u.role === 'admin'}
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center gap-2 mt-4">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30">Prev</button>
              <span className="text-text-muted text-sm self-center">Page {page}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={filteredUsers.length < 20} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30">Next</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workouts' && (
        <div className="glass-card p-6 animate-slideUp">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold">User Workouts</h3>
            <div className="relative w-full sm:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Search by name/email..." className="input-field search-icon-padding text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted border-b border-dark-border">
                  <th className="text-left pb-3 font-medium">User</th>
                  <th className="text-left pb-3 font-medium">Plan Name</th>
                  <th className="text-center pb-3 font-medium">Created</th>
                  <th className="text-center pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-6 text-text-muted">Loading...</td></tr>
                ) : filteredWorkouts.map((w) => (
                  <tr key={w._id} className="border-b border-dark-border/40 last:border-0 hover:bg-dark-surface/30 transition-colors">
                    <td className="py-3 font-medium">
                      {w.userId?.name} <span className="text-text-muted text-xs block">{w.userId?.email}</span>
                    </td>
                    <td className="py-3 text-text-secondary">{w.planName || 'Workout Plan'}</td>
                    <td className="py-3 text-center text-text-muted">{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-center">
                      <button onClick={() => openEditModal('workout', w)} className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                        <HiOutlinePencilAlt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'diets' && (
        <div className="glass-card p-6 animate-slideUp">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold">User Diets</h3>
            <div className="relative w-full sm:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Search by name/email..." className="input-field search-icon-padding text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted border-b border-dark-border">
                  <th className="text-left pb-3 font-medium">User</th>
                  <th className="text-left pb-3 font-medium">Plan Name</th>
                  <th className="text-center pb-3 font-medium">Created</th>
                  <th className="text-center pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-6 text-text-muted">Loading...</td></tr>
                ) : filteredDiets.map((d) => (
                  <tr key={d._id} className="border-b border-dark-border/40 last:border-0 hover:bg-dark-surface/30 transition-colors">
                    <td className="py-3 font-medium">
                      {d.userId?.name} <span className="text-text-muted text-xs block">{d.userId?.email}</span>
                    </td>
                    <td className="py-3 text-text-secondary">{d.planName || 'Diet Plan'}</td>
                    <td className="py-3 text-center text-text-muted">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-center">
                      <button onClick={() => openEditModal('diet', d)} className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                        <HiOutlinePencilAlt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteModal(null)}>
          <div className="glass-card p-6 max-w-sm w-full animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Delete User</h3>
            <p className="text-text-secondary text-sm mb-6">
              Are you sure you want to delete <span className="text-text-primary font-medium">{deleteModal.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-3 rounded-xl font-semibold bg-accent text-white hover:bg-accent-light transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (JSON) */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
          <div className="glass-card p-6 max-w-3xl w-full max-h-[90vh] flex flex-col animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2 capitalize">Edit {editModal.type} Plan</h3>
            <p className="text-text-secondary text-sm mb-4">Edit the raw JSON data to modify the plan.</p>
            <textarea 
              className="w-full flex-1 min-h-[400px] p-4 bg-dark border border-dark-border rounded-xl font-mono text-sm text-text-primary focus:outline-none focus:border-primary/50 mb-4"
              value={editJsonStr}
              onChange={(e) => setEditJsonStr(e.target.value)}
            />
            <div className="flex gap-3 justify-end shrink-0">
              <button onClick={() => setEditModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveEdit} className="btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
