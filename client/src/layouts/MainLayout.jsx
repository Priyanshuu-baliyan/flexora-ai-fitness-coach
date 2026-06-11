import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineLightningBolt,
  HiOutlineChatAlt2,
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineShieldCheck,
  HiOutlineSun,
  HiOutlineMoon,
} from 'react-icons/hi';
import { GiMeal } from 'react-icons/gi';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { path: '/workout', label: 'Workout', icon: HiOutlineLightningBolt },
  { path: '/diet', label: 'Diet Plan', icon: GiMeal },
  { path: '/chat', label: 'AI Coach', icon: HiOutlineChatAlt2 },
  { path: '/progress', label: 'Progress', icon: HiOutlineTrendingUp },
  { path: '/profile', label: 'Profile', icon: HiOutlineUser },
];

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-dark">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-card border-r border-dark-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-xl font-bold text-white">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">FlexOra</h1>
                <p className="text-xs text-text-muted">AI Fitness Coach</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-dark-surface transition-all duration-200 cursor-pointer"
                title="Toggle theme"
              >
                {theme === 'dark' ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-dark-surface transition-all duration-200 cursor-pointer lg:hidden"
                title="Close sidebar"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/15 text-primary glow-primary'
                      : 'text-text-secondary hover:bg-dark-surface hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
            })}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-secondary hover:bg-dark-surface hover:text-text-primary'
                }`}
              >
                <HiOutlineShieldCheck className="w-5 h-5" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* User Section */}
          <div className="px-4 py-4 border-t border-dark-border">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-accent hover:bg-accent/10 transition-all duration-200 cursor-pointer"
            >
              <HiOutlineLogout className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-dark-card/50 backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-dark-surface transition-colors"
          >
            <HiOutlineMenu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold gradient-text">FlexOra</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-dark-surface transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <HiOutlineSun className="w-6 h-6" /> : <HiOutlineMoon className="w-6 h-6" />}
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
