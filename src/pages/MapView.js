import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import osm from "../utils/osm-provider";
import { markerIcon } from "../components/MarkerIcon";
import bubustop from "../data/busstop.json";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import { useRef, useState } from "react";
import useGeoLocation from "../utils/userGeoLocation";
import busimg from "../assets/bus.png";
import "../styles/MapView.css";
import marker from "../assets/marker.png";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import ListView from "../components/ListView";
import "../styles/Navbar.css";
import logo from "../assets/logo.png";
import "../styles/Search.css";

const MapView = () => {
  const [center] = useState({
    lat: 14.039510690161817,
    lng: 100.61504273205924,
  });
  const mapRef = useRef();
  const ZOOM_LEVEL = 18;
  const map = mapRef.current;
  const location = useGeoLocation();

  let DefaultIcon = L.icon({
    iconUrl: busimg,
    iconSize: [40, 40],
  });

  const LeafletRoutingMachine = () => {
    L.Routing.control({
      waypoints: [
        L.latLng(14.03986908208239, 100.61025726185726),
        L.latLng(selected),
      ],
      createMarker: function (i, wp, nWps) {
        L.marker(wp.latLng, { icon: markerIcon });
      },
      lineOptions: {
        styles: [
          {
            color: "blue",
            weight: 4,
            opacity: 0.7,
          },
        ],
      },
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWeypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
    }).addTo(map);
  };
  const [selected, setSelected] = useState();

  const handleChange = (event) => {
    let location = String(event.target.value).split(",").map(Number);
    console.log(location);
    setSelected(location);
  };

  const BusCarAuto = () => {
    var marker1 = L.marker([36.8065, 10.1815], { icon: DefaultIcon }).addTo(
      map
    );
    L.Routing.control({
      waypoints: [
        L.latLng(14.039585160839689, 100.61479959252607),
        L.latLng(14.039159148515047, 100.61379252456175),
        L.latLng(14.039153498870258, 100.61193864152295),
        L.latLng(14.03986908208239, 100.61025726185726),
        L.latLng(14.039745629835831, 100.60422680165381),
        L.latLng(14.03912967928326, 100.60785881960425),

        L.latLng(14.03986908208239, 100.61025726185726),
        L.latLng(14.040017503469882, 100.61233160496577),
        L.latLng(14.040006386629134, 100.61417986573265),
        L.latLng(14.039585160839689, 100.61479959252607),
        L.latLng(14.039159148515047, 100.61379252456175),
        L.latLng(14.039153498870258, 100.61193864152295),
        L.latLng(14.03986908208239, 100.61025726185726),
        L.latLng(14.039745629835831, 100.60422680165381),
        L.latLng(14.03912967928326, 100.60785881960425),
      ],
      createMarker: function (i, wp, nWps) {
        L.marker(wp.latLng, { icon: markerIcon });
      },
      lineOptions: {
        styles: [
          {
            color: "white",
            weight: 4,
            opacity: 0.7,
          },
        ],
      },
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWeypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
    })
      .on("routesfound", function (e) {
        e.routes[0].coordinates.forEach((c, i) => {
          setTimeout(() => {
            marker1.setLatLng([c.lat, c.lng]);
          }, 1000 * i);
        });
      })
      .addTo(map);
  };
  return (
    <>
      <ListView />
      <div className="navbar">
        <img src={logo} alt="" className="logo" />
        <div className="box">
          <select
            className="selectbox"
            onChange={handleChange}
            value={bubustop.value}
          >
            {bubustop.map((busstop, idx) => (
              <option value={[busstop.lat, busstop.lng]} key={idx}>
                {busstop.name}
              </option>
            ))}
          </select>
        </div>
      </div>
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
        <button id="tracking" onClick={LeafletRoutingMachine}>
          <img src={marker} alt="" className="img_tracking" />
        </button>
        <button id="route" onClick={BusCarAuto}>
          <img src={busimg} alt="" className="img_tracking" />
        </button>
      </MapContainer>
    </>
  );
};

export default MapView;
