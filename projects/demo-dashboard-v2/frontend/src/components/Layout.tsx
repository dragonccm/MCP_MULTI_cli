import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Receipt, LogOut, Wallet, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/transactions', label: 'Transactions', icon: <Receipt size={20} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2 font-bold text-xl text-indigo-600">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-sm">
            <Wallet size={24} />
          </div>
          <span>PEM App</span>
        </div>
        <nav className="mt-4 px-4 space-y-2 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm shadow-indigo-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-2 font-bold text-lg text-indigo-600">
          <div className="bg-indigo-600 p-1 rounded-md text-white">
            <Wallet size={18} />
          </div>
          <span>PEM</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-3/4 h-full shadow-2xl flex flex-col p-6 space-y-6" onClick={e => e.stopPropagation()}>
             <div className="flex items-center gap-2 font-bold text-xl text-indigo-600 mb-4">
              <Wallet size={28} />
              <span>PEM App</span>
            </div>
            <nav className="space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                    isActive(item.path)
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className="text-lg">{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={20} />
                <span className="text-lg font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header (optional, for profile) */}
        <header className="h-16 bg-white border-b hidden md:flex items-center justify-end px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
