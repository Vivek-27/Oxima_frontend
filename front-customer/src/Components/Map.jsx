import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  ZoomControl
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});
// FitBounds component

const FitBounds = ({ source, destination, midpoint }) => {
  const map = useMap();

  useEffect(() => {
    const points = [source, destination, midpoint].filter(Boolean);

    if (points.length === 1) {
      map.setView(points[0], 15);
    } else if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [
    source?.lat,
    source?.lng,
    destination?.lat,
    destination?.lng,
    midpoint?.lat,
    midpoint?.lng
  ]);

  return null;
};

const Map = ({ coordinates, setDistance }) => {
  const [route, setRoute] = useState([]);
  const source = coordinates.source;
  const destination = coordinates.destination;
  const midpoint = coordinates.midpoint;

  const [routeToMidpoint, setRouteToMidpoint] = useState([]);
  const [routeToDestination, setRouteToDestination] = useState([]);

  // Blue dot icon for source location
  const blueDotIcon = new L.Icon({
    iconUrl: '/src/assets/location_marker_.png',
    iconSize: [40, 40], // width, height
    iconAnchor: [15, 22], // anchor point for marker position
    popupAnchor: [0, -30], // anchor point for popup
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
  });

  // Customer icon for midpoint location
  const customerIcon = new L.Icon({
    iconUrl: '/src/assets/location-11-512.webp',
    iconSize: [45, 45], // width, height
    iconAnchor: [25, 40], // anchor point for marker position
    popupAnchor: [0, -30], // anchor point for popup
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
  });

  useEffect(() => {
    console.log(
      'Route to source: ',
      source,
      ' midpoint: ',
      midpoint,
      ' dest: ',
      destination
    );

    const fetchRoutes = async () => {
      // if (!source || !midpoint || !destination) return;

      // Route from midpoint → destination
      const res2 = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${midpoint.lng},${midpoint.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
      );
      const data2 = await res2.json();

      if (data2?.routes?.length > 0) {
        const coords2 = data2.routes[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );
        setRouteToDestination(coords2);
      }

      // ✅ Get distance in kilometers
      const distanceInKm = data2.routes[0].distance / 1000;
      setDistance(distanceInKm.toFixed(2));

      // Route from source → midpoint
      const res1 = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${source.lng},${source.lat};${midpoint.lng},${midpoint.lat}?overview=full&geometries=geojson`
      );
      const data1 = await res1.json();

      if (data1?.routes?.length > 0) {
        const coords1 = data1.routes[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );
        setRouteToMidpoint(coords1);
      }
    };

    fetchRoutes();
  }, [
    source?.lat,
    source?.lng,
    destination?.lat,
    destination?.lng,
    midpoint?.lat,
    midpoint?.lng
  ]);

  return (
    <div>
      <MapContainer
        center={source || { lat: 28.6139, lng: 77.209 }}
        zoom={13}
        style={{ height: '500px', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
        className="relative"
      >
        {/* ✅ Wrap all children inside Fragment to avoid multiple children issue */}
        <>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <ZoomControl position="bottomright" />
          {source && (
            <Marker position={source} icon={customerIcon}>
              <Popup>You</Popup>
            </Marker>
          )}
          {destination && (
            <Marker position={destination}>
              <Popup>Destination</Popup>
            </Marker>
          )}
          {midpoint && (
            <Marker position={midpoint} icon={blueDotIcon}>
              <Popup>Midpoint</Popup>
            </Marker>
          )}
          {source && destination && (
            <FitBounds
              source={source}
              destination={destination}
              midpoint={midpoint}
            />
          )}

          <FitBounds
            source={source}
            destination={destination}
            midpoint={midpoint}
          />

          {routeToMidpoint.length > 0 && (
            <Polyline
              positions={routeToMidpoint}
              pathOptions={{ color: 'black', dashArray: '6' }} // dotted line
            />
          )}

          {routeToDestination.length > 0 && (
            <Polyline
              positions={routeToDestination}
              pathOptions={{ color: 'blue' }} // solid line
            />
          )}

          {/* {route.length > 0 && <Polyline positions={route} color="blue" />} */}
        </>
      </MapContainer>
    </div>
  );
};

export default Map;
