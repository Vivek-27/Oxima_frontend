import { useEffect, useState } from 'react';
import { IoNavigateCircle } from 'react-icons/io5';
import Map from './Map';
import toast from 'react-hot-toast';
import { RotatingLines } from 'react-loader-spinner';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { IoClose } from 'react-icons/io5';
import { IoCheckmarkSharp } from 'react-icons/io5';
import BaseURI from '../utils/api.js';

import useTripStore from '../store/store.js'; // ✅ Import the store

const HomeDriver = () => {
  const [myLocation, setMyLocation] = useState(null);

  const [destination, setDestination] = useState(null);
  const [source, setSource] = useState(null);

  const { trip, setTrip, resetTrip, status, paymentStatus, setPaymentStatus } =
    useTripStore();

  const [tripConfirmed, setTripConfirmed] = useState(!!trip);

  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

  const ensureLoggedIn = () => {
    if (!user) {
      toast.error('⚠️ Please log in first');
      return false;
    }
    return true;
  };
  const resetUIStates = () => {
    resetTrip(); // Zustand
    setTripConfirmed(false);
    setDestination(null);
    setSource(null);
    setMyLocation(null);
    setCustomer(null);
    setIsOnline(false);
  };

  const isAtDestination =
    destination &&
    myLocation &&
    calculateDistance(
      myLocation?.lat,
      myLocation?.lng,
      destination?.lat,
      destination?.lng
    ) < 100; // less than 100 meters

  useEffect(() => {
    // setPaymentStatus({ status: 'PAID' });

    const connectWebSocket = () => {
      const sock = new SockJS(`${BaseURI}/ws`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);
        toast.success('connected');

        client.subscribe(`/topic/messages/${user.id}`, (message) => {
          const msg = message.body;

          toast((t) => (
            <span>
              {msg + ' '}
              <button onClick={() => toast.dismiss(t.id)}> Dismiss</button>
            </span>
          ));

          if (msg === 'Trip Canceled' || msg === 'Trip Completed') {
            resetTrip();
            resetUIStates(); // ✅ calls both Zustand and local setters
          }
        });

        client.subscribe(`/topic/ride-assignments/${user.id}`, (message) => {
          const newTrip = JSON.parse(message.body);
          setTrip(newTrip);
        });

        client.subscribe(`/topic/payment/${user.id}`, (message) => {
          const body = message.body;

          console.log('Payment received:', body);

          // If body is just "PAID" as string, don't parse — directly store it
          if (body === 'PAID' || body === 'RETRY' || body === 'PENDING') {
            setPaymentStatus({ status: body });
          } else {
            try {
              const parsed = JSON.parse(body);
              setPaymentStatus(parsed);
            } catch (e) {
              console.error('Invalid JSON in payment message:', e);
            }
          }
        });
      });
    };
    const client = connectWebSocket();

    return () => {
      if (client && client.connected) {
        client.disconnect(() => {
          console.log('WebSocket disconnected');
        });
      }
    };
  }, []);

  useEffect(() => {
    if (trip) {
      getCustomer({ customerID: trip.customerID });
      setDestination({
        address: trip.destination.address,
        lat: trip.destination.latitude,
        lng: trip.destination.longitude
      });
      setSource({
        address: trip.source.address,
        lat: trip.source.latitude,
        lng: trip.source.longitude
      });
    }
  }, [trip]);

  const getCustomer = async ({ customerID }) => {
    const res = await fetch(`${BaseURI}:8080/customer/${customerID}`);
    setCustomer(await res.json());
  };

  const handleRideRequest = async (accepted) => {
    if (!ensureLoggedIn() || !trip) return;
    if (trip && user) {
      try {
        const res = await fetch(
          `${BaseURI}:8080/customer/driver/respond?tripId=${trip.id}&driverId=${user.id}&accepted=${accepted}`,
          {
            method: 'POST'
          }
        );

        if (!res.ok) throw new Error('Network response was not ok');

        const data = await res.text();
        toast.success('Response sent successfully');

        if (accepted) {
          setTripConfirmed(true);
          setIsOnline(true);
          toast.success('Ride accepted');
        } else {
          setCustomer(null);
          resetTrip();
        }
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    }
  };

  const handleGetCurrentLocation = () => {
    if (!ensureLoggedIn()) return;
    setLoading(true);

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();

        if (data?.display_name) {
          setMyLocation({
            address: data.display_name,
            lat: latitude,
            lng: longitude
          });

          updateLocaton(data);
        } else {
          toast.error('Unable to fetch address');
        }

        setLoading(false);
      },
      (err) => {
        toast.error('Location access denied or unavailable');
        console.log(err);
      }
    );
  };

  const updateLocaton = (data) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const LocationUpdateRequest = {
      driverId: user.id,
      location: {
        type: 'Point',
        coordinates: [data.lat, data.lon]
      }
    };

    fetch('https://oxima-backend-s0ov.onrender.com/driver/updateLocation_', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(LocationUpdateRequest)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.text();
      })
      .then((data) => {
        if (data === 'Location updated successfully') {
          setIsOnline(true);
        }
        toast.success('Location updated');
      })
      .catch((err) => {
        toast.error('Error while updating location');
        console.error('Error:', err);
      });
  };

  const cancleRide = () => {
    if (!ensureLoggedIn()) return;
    fetch(`${BaseURI}:8080/trip/cancelTrip/${trip.id}/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.text();
      })
      .then((data) => {
        toast.success('Ride cancelled successfully');
        resetTrip();
        resetUIStates();
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
        toast.error('Error while cancelling ride');
      });
  };

  useEffect(() => {
    if (isOnline && stompClient && trip?.customerID) {
      const intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          const locationPayload = {
            latitude,
            longitude,
            address: myLocation?.address || 'Unknown Location'
          };
          stompClient.send(
            `/app/driver-location/${trip.customerID}`,
            {},
            JSON.stringify(locationPayload)
          );
        });
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [isOnline, stompClient, trip]);

  const [onTrip, setOnTrip] = useState(false);
  useEffect(() => {
    setOnTrip(!!trip);
  }, [trip]);

  const completeRide = () => {
    if (!ensureLoggedIn()) return;
    fetch(`${BaseURI}:8080/trip/completeTrip/${trip.id}/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.text();
      })
      .then((data) => {
        toast.success('Ride marked as completed');
        resetUIStates();
      })
      .catch((error) => {
        console.error('Error completing ride:', error);
        toast.error('Error while completing ride');
      });
  };

  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancelClick = () => setShowConfirm(true);
  const confirmCancel = () => {
    setShowConfirm(false);
    cancleRide();
  };
  const cancelConfirmation = () => setShowConfirm(false);

  const CancelConfirmation = ({ onConfirm, onCancel }) => (
    <div className="mt-4 p-4 border rounded shadow bg-white w-64">
      <p className="text-gray-800 mb-4">
        Are you sure you want to cancel the ride?
      </p>
      <div className="flex justify-between">
        <button
          onClick={onConfirm}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          Yes
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
        >
          No
        </button>
      </div>
    </div>
  );

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371000; // Radius of Earth in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in meters
  }

  return (
    <div className=" w-full bg-gray-50">
      <div className="relative flex gap-20 justify-center">
        <div className="left p-10 w-[35vw]">
          {tripConfirmed ? (
            <>
              <h1 className="text-black text-5xl font-bold">
                Pick up your ride{' '}
                <span className="text-blue-500">with Uber</span>
              </h1>
              <div className="mt-6 flex flex-col space-y-4">
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleCancelClick}
                    className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Cancel Ride
                  </button>

                  <button
                    onClick={completeRide}
                    disabled={!isAtDestination}
                    className={`px-5 py-2 rounded-lg transition ${
                      isAtDestination
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Ride Completed
                  </button>
                </div>

                {!isAtDestination && (
                  <p className="text-sm text-red-500 ml-1">
                    🚫 You must reach the destination to complete the ride.
                  </p>
                )}

                <p className=" text-green-600 ml-1">
                  Payment status: {status ? status : 'PENDING'}
                </p>
                {showConfirm && (
                  <div className="mt-2">
                    <CancelConfirmation
                      onConfirm={confirmCancel}
                      onCancel={cancelConfirmation}
                    />
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toast.success('Starting new trip');
                    resetTrip();
                    resetUIStates();
                  }}
                  className=" rounded border w-fit px-5 py-2 bg-black text-white hover:bg-gray-800 transition"
                >
                  New Trip
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="top mb-10 pr-16">
                <h1 className="text-black text-5xl font-bold">
                  Go anywhere with Uber
                </h1>
              </div>
              <button
                disabled={!user}
                onClick={handleGetCurrentLocation}
                className={`cursor-pointer ${
                  isOnline
                    ? 'bg-green-500 hover:bg-green-600'
                    : !user
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                } flex items-center justify-center gap-2 px-6 h-[4rem] rounded-full text-2xl font-bold text-white`}
              >
                {!isOnline ? 'Go online' : 'Online'}
                {loading ? (
                  <RotatingLines
                    strokeColor="white"
                    strokeWidth="5"
                    animationDuration="0.75"
                    width="24"
                    visible={true}
                  />
                ) : (
                  <IoNavigateCircle color="white" />
                )}
              </button>

              {trip ? (
                <div className="mt-10 p-6 max-w-md w-full bg-white border border-gray-200 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <h1 className="text-2xl font-bold text-gray-800 mb-3">
                    🚗 New Ride Request
                  </h1>
                  <div className="text-gray-700 mb-4 space-y-1">
                    <p>
                      <span className="font-semibold">Customer:</span>{' '}
                      {customer?.email || 'Unknown'}
                    </p>
                    <p>
                      <span className="font-semibold">Pickup:</span>{' '}
                      {destination?.address || 'Loading address...'}
                    </p>
                  </div>
                  <div className="flex justify-center gap-6 mt-6">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRideRequest(false);
                        window.location.reload();
                      }}
                      className="flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-full bg-red-50 text-red-600 border border-red-300 hover:bg-red-100 transition"
                    >
                      <IoClose className="text-lg" /> Decline
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRideRequest(true);
                      }}
                      className="flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      <IoCheckmarkSharp className="text-lg" /> Accept
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-10 px-2 text-black text-2xl font-bold">
                  <h1>Waiting for a ride...</h1>
                </div>
              )}
            </>
          )}
          <div className="mt-10 p-4 rounded-xl bg-white shadow-inner space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Driver Dashboard
            </h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>🚦 Status: {isOnline ? 'Online' : 'Offline'}</li>
              <li>📍 Location: {myLocation?.address || 'Not Set'}</li>
              <li>🧾 Active Trip: {trip ? trip.id : 'None'}</li>
              <li>👤 Customer: {customer?.email || 'N/A'}</li>
            </ul>
          </div>
        </div>

        <div className="right z-0 h-[70vh] w-[35vw]">
          <Map
            key={myLocation?.lat || 'initial'}
            coordinates={{
              source: myLocation,
              destination: destination,
              midpoint: source
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HomeDriver;
