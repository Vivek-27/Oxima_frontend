import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import BaseURI from '../utils/api';
const LoginPageDriver = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    if (!email || !isEmailValid) {
      toast.error('Enter a valid email');
      return;
    }

    setLoading(true);

    fetch(`${BaseURI}/driver/login/${email.trim()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid response from server');
        return res.json();
      })
      .then((data) => {
        toast.success('OTP sent successfully');
        navigate(`/auth_varification/driver/${data}`);
      })
      .catch((err) => {
        toast.error('Login failed. Try again.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-10 px-6 lg:px-24 py-12">
      {/* Left Section */}
      <div className="flex-1">
        <h1 className="text-4xl font-bold leading-snug mb-4">
          Drive when you want, make what you need
        </h1>
        <p className="text-xl text-gray-700 font-medium">
          Earn on your own schedule.
        </p>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Login with your registered email
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email input */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className="w-full border rounded-lg px-4 py-3 text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium text-white transition ${
              loading
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-black hover:bg-neutral-900'
            }`}
          >
            {loading ? 'Sending OTP...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPageDriver;
