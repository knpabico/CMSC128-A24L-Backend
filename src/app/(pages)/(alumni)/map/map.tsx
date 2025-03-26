import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { LatLngTuple } from "leaflet";
import L from "leaflet";
import { Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";

function ResetCenterView(props) {
  const { selectPosition } = props;
  const map = useMap();
  useEffect(() => {
    if (selectPosition) {
      map.setView(L.latLng(selectPosition?.lat, selectPosition?.lon), 17, {
        animate: true,
        duration: 0.5,
        easeLinearity: 0.25,
      });
    }
  }, [selectPosition]);

  return null;
}

export default function MyMap(props: any) {
  const { selectPosition } = props;
  const locationSelection: LatLngTuple = [
    selectPosition?.lat,
    selectPosition?.lon,
  ];
  const [isSatellite, setIsSatellite] = useState(false);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-12 z-[1000]">
        <button
          onClick={() => setIsSatellite(!isSatellite)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Click for {isSatellite ? "Basic" : "Satellite"} View
        </button>
      </div>

      <MapContainer
        center={[14.125, 121.14]}
        zoom={4}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            isSatellite
              ? "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=doD1WKAsjysDh9sCkDeo"
              : "https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=doD1WKAsjysDh9sCkDeo"
          }
        />
        {selectPosition && (
          <Marker position={locationSelection}>
            <Popup>place</Popup>
          </Marker>
        )}
        <ResetCenterView selectPosition={selectPosition} />
      </MapContainer>
    </div>
  );
}
