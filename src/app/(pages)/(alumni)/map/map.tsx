import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { LatLngTuple } from "leaflet";
import L from "leaflet";

export default function MyMap(props: any) {
  const { position, zoom } = props;

  const arrCoordinates: LatLngTuple[] = [
    [14.6531, 121.067],
    [14.5787, 120.9843],
    [14.1674, 121.2436],
  ];

  const places: string[] = ["UP Diliman", "UP Manila", "UP Los Banos"];
  const markerColors = ["red", "blue", "green"];

  function MultipleMarkers() {
    return arrCoordinates.map((coordinata, index) => {
      const color = markerColors[index % markerColors.length];
      const icon = L.divIcon({
        className: "",
        html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <svg width="40px" height="60px" viewBox="0 0 40 60">
              <!-- Marker Background -->
              <path fill="${color}" d="M20,1 C10,1 1,10 1,20 C1,35 20,58 20,58 C20,58 39,35 39,20 C39,10 30,1 20,1 Z"></path>
              <!-- Circle inside the marker -->
              <circle cx="20" cy="20" r="13" fill="white"></circle>
              <!-- Number in center -->
              <text x="20" y="27" font-size="20" font-weight="bold" text-anchor="middle" fill="${color}">${
          index + 1
        }</text>
            </svg>
          </div>
      `,
        iconSize: [25, 41],
        iconAnchor: [10, 41],
        popupAnchor: [2, -40],
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        shadowUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
      });
      return (
        <Marker key={index} position={coordinata} icon={icon}>
          <Popup>{places[index]}</Popup>
        </Marker>
      );
    });
  }
  return (
    <MapContainer
      center={position}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MultipleMarkers />
    </MapContainer>
  );
}
