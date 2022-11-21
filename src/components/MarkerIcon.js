import L from "leaflet";

export const markerIcon = new L.Icon({
  iconUrl: require("../assets/marker.png"),
  iconSize: [45, 45],
  iconAnchor: [17, 45],
  popupAnchor: [3, -46],
});
