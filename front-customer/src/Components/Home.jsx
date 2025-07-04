import React, { useEffect, useState } from 'react';
import { GoDotFill } from 'react-icons/go';
import { TiLocationArrow } from 'react-icons/ti';
import { FaSquareFull } from 'react-icons/fa';
import Map from './Map';
import toast from 'react-hot-toast';
import { BarsLoader, GooeyCircleLoader } from 'react-loaders-kit';
import { VscLoading } from 'react-icons/vsc';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { IoCall, IoClose } from 'react-icons/io5';
import { useRideStore } from '../store/rideStore';
import BaseURI from '../utils/api';
const Home = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const ensureLoggedIn = () => {
    if (!user?.id) {
      toast.error('⚠️ Please log in first');
      return false;
    }
    return true;
  };
  const [querySource, setquerySource] = useState('');
  const [suggestionsSource, setsuggestionsSource] = useState([]);
  const {
    selectedSource,
    selectedDestination,
    driver,
    requested,
    setSelectedSource,
    setSelectedDestination,
    setDriver,
    setRequested,
    setTrip
  } = useRideStore();

  const [queryDestination, setqueryDestination] = useState('');
  const [suggestionsDestination, setsuggestionsDestination] = useState([]);
  const [distance, setDistance] = useState();
  const [estimatedFare, setEstimatedFare] = useState(0);
  const { trip, status, paymentStatus, setPaymentStatus } = useRideStore();
  //webSocket
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    const connectWebSocket = () => {
      ///SockJS
      const sock = new SockJS(`${BaseURI}/ws`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);
        toast.success('connected');
        client.subscribe(`/topic/ride-assigned/${user.id}`, (message) => {
          const assignedDriver = JSON.parse(message.body);
          console.log('assignedDriver:', assignedDriver);
          setRequested(false);
          setDriver(assignedDriver);
          toast.success('Driver assigned successfully');
        });

        client.subscribe(`/topic/messages/${user.id}`, (message) => {
          const msg = message.body;

          toast((t) => (
            <span>
              {msg + ' '}
              <button onClick={() => toast.dismiss(t.id)}>Dismiss</button>
            </span>
          ));

          if (msg === 'Trip Canceled' || msg === 'Trip Completed') {
            // Reset all Zustand store states
            setDriver(null);
            setRequested(false);
            setSelectedSource(null);
            setSelectedDestination(null);

            // Reset input fields and suggestions
            setquerySource('');
            setsuggestionsSource([]);
            setqueryDestination('');
            setsuggestionsDestination([]);
          }
        });

        client.subscribe(`/topic/driver-location/${user.id}`, (message) => {
          const location = JSON.parse(message.body);
          console.log(location);

          // Update Zustand driver manually
          setDriver((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              location: {
                ...prev.location,
                coordinates: [location.longitude, location.latitude],
                x: location.longitude,
                y: location.latitude
              }
            };
          });
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

    //stomp client
  }, []);

  useEffect(() => {
    console.log('Driver updated in Zustand:', driver);
  }, [driver]);

  // Autocomplete search
  const handleInputChangeSource = async (e) => {
    const value = e.target.value;
    setquerySource(value);
    if (value.length < 3) {
      setsuggestionsSource([]);
      return;
    }
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${value}`
    );
    const data = await response.json();
    setsuggestionsSource(data);
  };

  // Autocomplete search
  const handleInputChangeDestination = async (e) => {
    const value = e.target.value;
    setqueryDestination(value);
    if (value.length < 3) {
      setsuggestionsDestination([]);
      return;
    }
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${value}`
    );
    const data = await response.json();
    setsuggestionsDestination(data);
  };

  // ✅ Select suggestion
  const handleSelectSource = (place) => {
    setquerySource(place.display_name);
    setSelectedSource({
      address: place.display_name,
      lat: place.lat,
      lng: place.lon
    });
    setsuggestionsSource([]);
  };
  // ✅ Select suggestion
  const handleSelectDestination = (place) => {
    setqueryDestination(place.display_name);
    setSelectedDestination({
      address: place.display_name,
      lat: place.lat,
      lng: place.lon
    });
    setsuggestionsDestination([]);
  };

  // 📍 Get current location and reverse geocode
  const handleGetCurrentLocation = () => {
    if (!ensureLoggedIn()) return;
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

        if (data && data.display_name) {
          setquerySource(data.display_name);
          setSelectedSource({
            address: data.display_name,
            lat: latitude,
            lng: longitude
          });
        } else {
          toast.error('Unable to fetch address');
        }
      },
      (err) => {
        toast.error('Location access denied or unavailable');
        console.log(err);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ensureLoggedIn()) return;
    setLoader(true);

    fetch(`${BaseURI}/customer/requestRide2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerID: user.id,
        source: {
          latitude: selectedSource.lat,
          longitude: selectedSource.lng,
          address: selectedSource.address
        },
        destination: {
          latitude: selectedDestination.lat,
          longitude: selectedDestination.lng,
          address: selectedDestination.address
        }
      })
    })
      .then((res) => {
        return res.text();
      })
      .then((data) => {
        toast.success('Ride requested successfully');
        console.log('Ride request data:', data);
        setRequested(true);

        const trip = JSON.parse(data);
        setTrip(trip); // ✅ set in Zustand
        localStorage.setItem('tripId', trip.id); // optional for reloads
      })
      .catch((err) => {
        toast.error('Error while requesting ride');
        console.error('Error:', err);
      });
    setLoader(false);
  };

  const [loader, setLoader] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancelClick = () => {
    setShowConfirm(true);
  };
  const confirmCancel = () => {
    console.log('Ride cancelled');
    setShowConfirm(false);
    cancleRide();
  };

  const cancelConfirmation = () => {
    setShowConfirm(false);
  };

  const CancelConfirmation = ({ onConfirm, onCancel }) => {
    return (
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
  };

  const cancleRide = () => {
    if (!ensureLoggedIn()) return;
    fetch(`${BaseURI}/trip/cancelTrip/${trip.tripId}/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.text(); // or res.json() depending on your backend
      })
      .then((data) => {
        toast.success('Ride cancelled successfully');
        console.log('Cancellation response:', data);
        setDriver(null);
        setSelectedSource(null);
        setSelectedDestination(null);
        setRequested(false);
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
        toast.error('Error while cancelling ride');
      });
  };

  useEffect(() => {
    const fetchFare = async () => {
      if (!selectedSource || !selectedDestination) return;
      // or use distance from Map
      const res = await fetch(`${BaseURI}/trip/calculateFare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distance: distance || 0 })
      });
      const data = await res.json();
      setEstimatedFare(data.fare); // show in UI
    };

    fetchFare();
  }, [selectedSource, selectedDestination]);

  const ensureFair = () => {
    if (!estimatedFare) {
      toast.error('⚠️ Please wait for fare estimation');
      return false;
    }
    return true;
  };
  const handlePayment = async () => {
    if (!ensureLoggedIn()) return;
    if (!ensureFair()) return;
    console.log(trip);
    if (!trip) {
      toast.error('Trip ID not found');
      return;
    }

    const res = await fetch(`${BaseURI}/payment/createOrder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId: trip.tripId, fare: estimatedFare }) // Send tripId and fair here
    });

    const data = await res.json();

    const options = {
      key: 'rzp_test_YA24Th3tm6croN', // Replace with your Razorpay key
      amount: data.amount,
      currency: 'INR',
      name: 'Uber Clone',
      description: 'Ride fare',
      order_id: data.orderId,
      handler: function (response) {
        fetch(`${BaseURI}/payment/verify`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tripId: trip.tripId,
            paymentId: response.razorpay_payment_id
          })
        })
          .then((res) => res.text())
          .then((msg) => toast.success(msg))
          .catch(() => toast.error('Payment verification failed'));
      },
      prefill: {
        name: user.name,
        email: user.email
      },
      theme: { color: '#000000' }
    };

    const razor = new window.Razorpay(options);
    razor.on('payment.failed', function () {
      toast.error('Payment failed. Please try again.');
      fetch(`${BaseURI}/payment/updateStatus/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'retry' })
      });
    });

    razor.open();
  };

  return (
    <div className=" w-full ">
      <div className="relative flex gap-20 justify-center">
        <div className={`absolute  top-40 z-1000 `}>
          <GooeyCircleLoader loading={loader} color="#000000" size={100} />
        </div>
        {driver ? (
          // ✅ If driver is assigned, show driver details and call option
          <div className="left bg-slate-50 p-10 w-[34vw]  rounded  flex flex-col gap-8">
            {/* Driver Info */}
            <div className="top pr-6">
              <h1 className="text-xl text-gray-900 leading-relaxed">
                Driver{' '}
                <span className="text-pink-600">
                  {driver?.name || driver?.email}
                </span>{' '}
                is on the way and will reach you shortly.
              </h1>
            </div>

            {/* Call Button */}
            <button
              onClick={() => (window.location.href = `tel:${driver?.phone}`)}
              className="flex items-center gap-3 text-sm max-w-fit px-5 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
            >
              <IoCall className="text-xl" />
              {driver?.phone}
            </button>

            {/* Payment Status */}
            <div className="flex items-center gap-3">
              <p className=" font-medium text-gray-800">💰 Payment status:</p>
              <span
                className={`px-3 py-1 rounded text-sm border ${
                  paymentStatus?.status === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {status?.toUpperCase() || 'PENDING'}
              </span>
            </div>

            {/* Pay Now Button */}
            <button
              onClick={handlePayment}
              className="bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-6 rounded-lg transition"
            >
              💳 Pay Now
            </button>

            {/* Cancel Ride Button */}
            <button
              onClick={handleCancelClick}
              className="bg-red-600 hover:bg-red-700 text-white text-sm  py-2 px-6 rounded-lg transition flex items-center gap-2 w-fit"
            >
              <IoClose className="text-lg" />
              Cancel Ride
            </button>

            {/* Cancel Confirmation Dialog */}
            {showConfirm && (
              <CancelConfirmation
                onConfirm={confirmCancel}
                onCancel={cancelConfirmation}
              />
            )}

            <button
              onClick={(e) => {
                e.preventDefault();
                toast.success('Starting new trip');
                setDriver(null);
                setSelectedSource(null);
                setSelectedDestination(null);
                setRequested(false);
              }}
              className=" rounded border w-fit px-5 py-2 bg-black text-white hover:bg-gray-800 transition"
            >
              New Trip
            </button>
          </div>
        ) : !requested ? (
          // 🟡 If no driver and ride not yet requested → show request form
          <div className="left p-10 w-[34vw]">
            <div className="top mb-10 pr-16">
              <h1 className=" text-5xl font-bold ">Go anywhere with Uber</h1>
              <p className=" text-2xl font-bold ">
                {' '}
                {distance ? <>{distance} km</> : '0 km'}
              </p>

              <p className=" font-mono font-bold text-lg text-red-500">
                Price: {estimatedFare}
              </p>
            </div>
            <div className="mid">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                className=" flex flex-col gap-4 "
              >
                {/* Source input */}
                <div className="customeInput flex bg-gray-100 px-2  rounded-lg h-12 items-center justify-between">
                  <div className="flex items-center gap-2 w-full">
                    <GoDotFill className=" text-md" />
                    <input
                      type="text"
                      placeholder="Pickup location"
                      value={querySource}
                      onChange={handleInputChangeSource}
                      style={{ outline: 'none' }}
                      className=" p-0.5 text-md text-gray-800 w-full bg-transparent"
                    />
                  </div>
                  <TiLocationArrow
                    onClick={handleGetCurrentLocation}
                    className=" text-4xl fill-red-500 cursor-pointer "
                  />
                </div>

                {/* Source Suggestions */}
                {suggestionsSource.length > 0 && (
                  <ul className=" absolute mt-13 rounded-md bg-white max-h-60 max-w-96 w-96 overflow-y-auto shadow">
                    {suggestionsSource.map((place, index) => (
                      <li
                        key={place.place_id}
                        className={`p-2 px-3 hover:bg-gray-100 rounded-md cursor-pointer ${
                          index === 0
                            ? ' border-blue-400 border-2 font-semibold'
                            : ''
                        }`}
                        onClick={() => handleSelectSource(place)}
                      >
                        {place.display_name}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Destination input */}
                <div className="customeInput flex bg-gray-100 px-2 rounded-lg h-12 items-center justify-between">
                  <div className="flex items-center gap-2 pl-1 w-full">
                    <FaSquareFull className=" text-sm p-0.5" />
                    <input
                      type="text"
                      placeholder="Dropoff location"
                      value={queryDestination}
                      onChange={handleInputChangeDestination}
                      style={{ outline: 'none' }}
                      className=" p-0.5 text-md text-gray-800 w-full bg-transparent"
                    />
                  </div>
                </div>

                {/* Destination Suggestions */}
                {suggestionsDestination.length > 0 && (
                  <ul className="absolute mt-28 rounded-b-xl bg-gray-100 max-h-60 max-w-96 overflow-y-auto shadow">
                    {suggestionsDestination.map((place, index) => (
                      <li
                        key={place.place_id}
                        className={`p-2 px-3 hover:bg-gray-100 rounded-md cursor-pointer ${
                          index === 0
                            ? ' border-blue-400 border-2 font-semibold'
                            : ''
                        }`}
                        onClick={() => handleSelectDestination(place)}
                      >
                        {place.display_name}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className={`cursor-pointer flex items-center justify-center w-full h-12 px-4 text-white font-medium rounded-lg
          transition duration-300 ease-in-out
          ${
            loader || !selectedSource || !selectedDestination
              ? 'bg-gray-900 cursor-not-allowed'
              : 'bg-gray-900 hover:bg-gray-800 active:scale-95 hover:brightness-110'
          }`}
                >
                  {loader ? 'Loading...' : 'Request now'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          // 🔴 Requested but no driver yet → show waiting
          <div className="left p-10 w-[34vw]">
            <h1 className=" text-2xl font-medium">
              Waiting for nearby driver to accept your ride
              <VscLoading className=" animate-spin text-2xl inline-block text-red-500 ml-3" />
            </h1>

            <button
              className=""
              onClick={() => {
                setDriver(null);
                setRequested(false);
                setSelectedSource(null);
                setSelectedDestination(null);
                setDistance(null);
              }}
            >
              cancle ride
            </button>
          </div>
        )}
        <div className="right z-0 h-[70vh] w-[35vw]">
          <Map
            setDistance={setDistance}
            coordinates={{
              midpoint: selectedSource,
              destination: selectedDestination,
              source:
                driver?.location?.coordinates?.length === 2
                  ? {
                      lat: driver.location.coordinates[1],
                      lng: driver.location.coordinates[0]
                    }
                  : null
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
