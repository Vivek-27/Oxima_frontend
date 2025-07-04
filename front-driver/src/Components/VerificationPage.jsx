import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import BaseURI from '../utils/api'; // Adjust the import path as necessary

const VerificationPage = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const { id, usertype } = useParams();

  const handleChange = (element, index) => {
    const value = element.value.replace(/\D/, '');
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);

      if (index > 0 && !otp[index] && inputsRef.current[index - 1]) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    if (fullOtp.length < 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);

    fetch(`${BaseURI}:8080/${usertype}/login/verify-otp/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputOtp: fullOtp })
    })
      .then((res) => {
        if (!res.ok)
          return res.text().then((text) => {
            throw new Error(text);
          });
        return res.json();
      })
      .then((data) => {
        toast.success('OTP verified successfully');
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/');
      })
      .catch((err) => {
        toast.error(err.message || 'OTP verification failed');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      <h1 className="mb-6 text-xl font-semibold text-center text-black">
        Enter the 6-digit OTP sent to your email or phone
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 items-center"
      >
        <div className="flex gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputsRef.current[index] = el)}
              className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-40 h-12 rounded-lg text-white font-medium transition ${
            loading
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-black hover:bg-neutral-900'
          }`}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
};

export default VerificationPage;
