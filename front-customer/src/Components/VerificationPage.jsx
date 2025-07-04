import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { VscLoading } from 'react-icons/vsc';
import BaseURI from '../utils/api';
const VerificationPage = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const { id, usertype } = useParams();

  const handleChange = (element, index) => {
    const value = element.value.replace(/\D/, ''); // Allow only digits
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
    if (index < 5 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);

      if (index > 0 && inputsRef.current[index - 1]) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${BaseURI}:8080/${usertype}/login/verify-otp/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputOtp: fullOtp })
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const data = await res.json();
      toast.success('✅ OTP verified successfully!');
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/');
    } catch (err) {
      console.error('OTP Verification Error:', err);
      toast.error(err.message || '❌ Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-xl font-semibold text-center mb-6 text-gray-800">
          Enter the 6-digit OTP sent to your phone or email
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputsRef.current[index] = el)}
                className="w-12 h-12 border text-center text-xl rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-medium flex justify-center items-center gap-2 ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-black hover:bg-gray-900'
            }`}
          >
            {loading ? (
              <>
                <VscLoading className="animate-spin text-xl" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerificationPage;
