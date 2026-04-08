import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  LogOut,
  BarChart3,
  Upload,
  Users,
  Calendar,
  FileText,
  Menu,
  X,
  Home,
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate('/admin/login');
          return;
        }

        setUser(user);
      } catch (err) {
        console.error('Auth check failed:', err);
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate('/admin/login');
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2a2a3e] border-t-[#f5a623] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8a8a9a]">Loading...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Upload, label: 'Upload Race', path: '/admin/upload-race' },
    { icon: Users, label: 'Drivers', path: '/admin/drivers' },
    { icon: Calendar, label: 'Schedule', path: '/admin/schedule' },
    { icon: FileText, label: 'News', path: '/admin/news' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#14141f] border-r border-[#2a2a3e] flex flex-col transition-all duration-300 ${
          sidebarOpen ? '' : 'items-center'
        }`}
      >
        <div className="p-4 border-b border-[#2a2a3e] flex items-center justify-between">
          {sidebarOpen && <h2 className="text-white font-bold">Admin Panel</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#1a1a2e] rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-4 h-4 text-[#8a8a9a]" />
            ) : (
              <Menu className="w-4 h-4 text-[#8a8a9a]" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-[#f5a623] text-[#0a0a0f]'
                    : 'text-[#8a8a9a] hover:bg-[#1a1a2e]'
                } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#2a2a3e] p-4 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#8a8a9a] hover:bg-[#1a1a2e] transition-colors"
            title="Back to Site"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Back to Site</span>}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#e63946] hover:bg-[#1a1a2e] transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>

        {sidebarOpen && (
          <div className="p-4 border-t border-[#2a2a3e] text-xs text-[#8a8a9a]">
            <p className="truncate">{user?.email}</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
