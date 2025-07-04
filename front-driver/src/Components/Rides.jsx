import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import BaseURI from '../utils/api'; // Adjust the import path as necessary
const Rides = () => {
  const [rides, setRides] = useState([]);

  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

  const getAllRides = async () => {
    try {
      const response = await fetch(
        `${BaseURI}:8080/trip/getAllRides/${user.id}`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setRides(data);
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Failed to fetch rides');
    }
  };

  useEffect(() => {
    if (user) {
      getAllRides();
    }
  }, []);

  const statusColors = {
    REQUESTED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-300',
    COMPLETED: 'bg-green-100 text-green-800 border-green-300',
    CANCELED: 'bg-red-100 text-red-800 border-red-300',
    PENDING: 'bg-gray-100 text-gray-800 border-gray-300'
  };

  return (
    <div
      id="rides"
      className="backdrop-blur-md bg-white/60 border border-gray-200 shadow-xl rounded-2xl max-w-3xl mx-auto  p-6 max-h-[550px] overflow-hidden"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-md pb-2 mb-2 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 tracking-wide">
          Recent Rides
        </h2>
      </div>

      {/* Ride List */}
      <ul className="overflow-y-auto max-h-[450px] pr-2 custom-scrollbar space-y-5">
        {rides.length > 0 ? (
          rides.map((ride, index) => {
            const statusClass =
              statusColors[ride.status] ||
              'bg-gray-100 text-gray-700 border-gray-300';

            return (
              <li
                key={index}
                className="rounded-2xl p-5 bg-white shadow-md border border-gray-200 hover:shadow-lg hover:scale-[1.01] transition-transform duration-300"
              >
                <div className="flex justify-between items-center mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}
                  >
                    {ride.status}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold `}>
                    {ride.paymentStatus}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold `}>
                    ₹ {ride.fare}
                  </span>
                  <span className="text-sm text-gray-500">
                    {ride.createdAt
                      ? new Date(ride.createdAt).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800 mb-1">
                    {ride.source.address} → {ride.destination.address}
                  </p>
                  <p className="text-sm text-gray-500">
                    Trip ID: <span className="font-mono">{ride.id}</span>
                  </p>
                </div>
              </li>
            );
          })
        ) : (
          <li className="text-center text-gray-600 py-20 bg-gray-100 rounded-xl shadow-inner">
            No recent rides found.
          </li>
        )}
      </ul>
    </div>
  );
};

export default Rides;
