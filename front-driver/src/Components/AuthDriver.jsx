import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import BaseURI from '../utils/api';
const AuthDriver = () => {
  const [authData, setAuthData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, phone, name } = authData;

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneValid = /^[0-9]{10,15}$/.test(phone);
    const isNameValid = /^[a-zA-Z\s]{2,50}$/.test(name);

    if (!email && !phone) {
      toast.error('Enter phone or email');
      return;
    }

    if (email && !isEmailValid) {
      toast.error('Invalid email format');
      return;
    }

    if (!isNameValid) {
      toast.error('Invalid name (2–50 characters)');
      return;
    }

    if (!isPhoneValid) {
      toast.error('Phone must be 10–15 digits');
      return;
    }

    fetch(`${BaseURI}/driver/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(authData)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.text();
      })
      .then((data) => {
        toast.success('Driver registered successfully!');
        navigate('/auth_login');
      })
      .catch((err) => {
        console.error('Error:', err);
        toast.error('Registration failed');
      });
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center items-start px-6 lg:px-24 py-12 gap-10">
      {/* Left Text Content */}
      <div className="flex-1">
        <h1 className="text-4xl font-bold leading-snug mb-4">
          Drive when you want, make what you need.
        </h1>
        <p className="text-xl font-medium text-gray-700">
          Earn on your own schedule.
        </p>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          What's your phone number or email?
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name Input */}
          <input
            type="text"
            placeholder="Full Name"
            value={authData.name}
            onChange={(e) =>
              setAuthData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-black bg-gray-100"
          />

          {/* Email Input */}
          <input
            type="email"
            placeholder="Email"
            value={authData.email}
            onChange={(e) =>
              setAuthData((prev) => ({ ...prev, email: e.target.value.trim() }))
            }
            className="w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-black bg-gray-100"
          />

          {/* Phone Input */}
          <PhoneInput
            country={'in'}
            value={authData.phone}
            onChange={(phone) => setAuthData((prev) => ({ ...prev, phone }))}
            inputStyle={{
              width: '100%',
              padding: '14px',
              borderRadius: '0.5rem',
              border: '1px solid #d1d5db',
              backgroundColor: '#f3f4f6'
            }}
            inputClass="focus:outline-none"
            containerStyle={{ width: '100%' }}
            placeholder="Enter phone number"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-black text-white py-3 rounded-lg font-medium hover:bg-neutral-900 transition"
          >
            Get Started
          </button>
        </form>

        <p className="mt-4 text-gray-600">
          Already have an account?{' '}
          <Link
            className="text-blue-600 hover:underline"
            to="/driver/auth_login"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthDriver;
