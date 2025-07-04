import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { VscLoading } from 'react-icons/vsc';
import BaseURI from '../utils/api';
const Auth = () => {
  const [authData, setAuthData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, phone } = authData;

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneValid = /^[0-9]{10,15}$/.test(phone);

    if (!email && !phone) {
      toast.error('Please enter a valid email or phone number');
      return;
    }

    if (email && !isEmailValid) {
      toast.error('Invalid email format');
      return;
    }

    if (phone && !isPhoneValid) {
      toast.error('Phone number must be 10-15 digits');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BaseURI}/customer/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(authData)
      });

      if (res.status === 409) {
        toast.error('⚠️ User already exists');
        return;
      }

      if (!res.ok) throw new Error('Network response was not ok');

      const data = await res.text();
      toast.success('✅ User created successfully!');
      console.log(data);
      navigate('/auth_login');
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error while creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center  px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          What’s your phone number or email?
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col">
            <label htmlFor="contact" className="mb-1 text-sm text-gray-600">
              Phone or Email
            </label>
            <input
              id="contact"
              type="text"
              placeholder="Enter phone number or email"
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value;
                setInputValue(val);

                const trimmed = val.trim();
                const isEmail = trimmed.includes('@') && trimmed.includes('.');
                const isPhone = /^[0-9]{7,15}$/.test(trimmed);

                setAuthData((state) => ({
                  ...state,
                  email: isEmail ? trimmed : '',
                  phone: isPhone ? trimmed : ''
                }));
              }}
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
                Submitting...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
