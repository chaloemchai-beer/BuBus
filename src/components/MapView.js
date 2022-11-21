import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import osm from "../leaflet/osm-provider";
import { markerIcon } from "./MarkerIcon";
import bubustop from "../data/busstop.json";

import "leaflet/dist/leaflet.css";
import { useRef, useState } from "react";
import useGeoLocation from "../leaflet/userGeoLocation";
import "../styles/App.css";

const MapView = () => {
  const [center] = useState({
    lat: 14.039510690161817,
    lng: 100.61504273205924,
  });
  const mapRef = useRef();
  const ZOOM_LEVEL = 18;
  const map = mapRef.current;
  const location = useGeoLocation();

  const showMyLocation = () => {
    if (location.loaded && !location.error) {
      map.flyTo(
        [location.coordinates.lat, location.coordinates.lng],
        ZOOM_LEVEL,
        { animate: true }
      );
    } else {
      alert(location.error.message);
    }
  };

  return (
    <MapContainer
      center={center}
      zoom={ZOOM_LEVEL}
      scrollWheelZoom={false}
      className="map-view"
      ref={mapRef}
    >
      <TileLayer
        attribution={osm.maptiler.attribution}
        url={osm.maptiler.url}
      />
      {bubustop.map((busstop, idx) => (
        <Marker
          position={[busstop.lat, busstop.lng]}
          icon={markerIcon}
          key={idx}
        >
          <Popup>
            <b>{busstop.name}</b>
          </Popup>
        </Marker>
      ))}
      {location.loaded && !location.error && (
        <Marker
          icon={markerIcon}
          position={[location.coordinates.lat, location.coordinates.lng]}
        ></Marker>
      )}
      <button id="tracking" onClick={showMyLocation}>
        Tracking
      </button>
    </MapContainer>
  );
};

export default MapView;
