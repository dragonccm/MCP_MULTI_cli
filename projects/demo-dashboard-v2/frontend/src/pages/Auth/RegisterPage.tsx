import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import { Wallet } from 'lucide-react';
import axios from 'axios';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <Wallet className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500">Start managing your personal finances</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
