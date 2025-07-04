import axios from 'axios';

export async function fetchRoute(source, destination) {
  const response = await axios.post(
    'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
    {
      coordinates: [
        [source.lng, source.lat],
        [destination.lng, destination.lat]
      ]
    },
    {
      headers: {
        Authorization: import.meta.env.VITE_ORS_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}
