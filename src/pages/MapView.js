import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import osm from "../utils/osm-provider";
import { markerIcon } from "../components/MarkerIcon";
import bubustop from "../data/busstop.json";

import "leaflet/dist/leaflet.css";
import { useRef, useState } from "react";
import useGeoLocation from "../utils/userGeoLocation";
import "../styles/MapView.css";
import marker from "../assets/marker.png";
import Navbar from "../components/Navbar";
import Tracking from "../trackingData/Tracking";

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
  console.log();
  return (
    <>
      <Tracking />
      <Navbar />
      <MapContainer
        center={center}
        zoom={ZOOM_LEVEL}
        scrollWheelZoom={true}
        className="map-view"
        ref={mapRef}
        zoomControl={false}
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
          <img src={marker} alt="" className="img_tracking" />
        </button>
      </MapContainer>
    </>
  );
};

export default MapView;
