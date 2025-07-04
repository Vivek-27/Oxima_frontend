import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { VscLoading } from 'react-icons/vsc';
import BaseURI from '../utils/api';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email) {
      toast.error('⚠️ Please enter your email');
      return;
    }

    if (!isEmailValid) {
      toast.error('❌ Invalid email format');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BaseURI}:8080/customer/login/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Network response was not ok');

      const data = await res.json();
      toast.success('✅ OTP sent successfully');

      localStorage.setItem('user', data);
      navigate(`/auth_varification/customer/${data}`);
    } catch (err) {
      console.error('Login error:', err);
      toast.error('❌ Error logging in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
          Login with your registered email
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1 text-sm text-gray-600">
              Email
            </label>
            <input
              type="text"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-white transition-all ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-black hover:bg-gray-900'
            }`}
          >
            {loading ? (
              <>
                <VscLoading className="animate-spin text-xl" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
