import React, { useEffect } from 'react';
import { IoWallet } from 'react-icons/io5';
import BaseURI from '../utils/api';
const Wallet = () => {
  const [totalEarnings, setTotalEarnings] = React.useState(0);
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const getAllRides = async () => {
    try {
      const response = await fetch(
        `${BaseURI}:8080/trip/getAllRides/${user.id}`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      //
      // Calculate total fare of only paid and completed trips
      const total = data
        .filter(
          (ride) => ride.status === 'ACCEPTED' && ride.paymentStatus === 'PAID'
        )
        .reduce((acc, ride) => acc + ride.fare, 0);

      setTotalEarnings(total);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  useEffect(() => {
    getAllRides();
  }, []);
  return (
    <div className=" pt-14 flex justify-center items-start px-4">
      <div className="w-[50rem] bg-white  border rounded-2xl shadow-lg p-6 space-y-6">
        {/* Header: Total Earnings */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-semibold text-gray-800">
              Total Earnings
            </p>
            <h1 className="text-4xl font-bold text-green-600 mt-1">
              ₹ {totalEarnings.toFixed(2)}
            </h1>
            <p className="text-sm text-gray-500">Last updated: Today</p>
          </div>
          <IoWallet className=" text-4xl" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl border text-center">
            <p className="text-sm text-gray-500">This Week</p>
            <p className="text-lg font-semibold text-gray-800">comming soon</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border text-center">
            <p className="text-sm text-gray-500">This Month</p>
            <p className="text-lg font-semibold text-gray-800">comming soon</p>
          </div>
        </div>

        {/* Withdraw Button */}
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-black text-white line-through rounded-xl hover:bg-gray-800 transition font-medium">
            Withdraw Funds
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
