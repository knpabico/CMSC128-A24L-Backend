// map.tsx
import {
  GoogleMap,
  Marker,
  useLoadScript,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Search, MapPin, X } from "lucide-react";

interface GoogleMapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAddress: string;
  initialLatitude: number;
  initialLongitude: number;
  onSave: (address: string, lat: number, lng: number) => void;
}

const GoogleMapsModal: React.FC<GoogleMapsModalProps> = ({
  isOpen,
  onClose,
  initialAddress,
  initialLatitude,
  initialLongitude,
  onSave,
}) => {
  const [map, setMap] = useState(null);
  const [address, setAddress] = useState(initialAddress);
  const [latitude, setLatitude] = useState(initialLatitude);
  const [longitude, setLongitude] = useState(initialLongitude);
  const [searchInput, setSearchInput] = useState(initialAddress);
  const [zoom, setZoom] = useState(10);
  const [markerAnimation, setMarkerAnimation] = useState(null);
  const [isMapClick, setIsMapClick] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCnDnz-yF_a-LiquYYONJcf1wFobK75tNk",
    libraries: ["places"],
  });

  const center = useMemo(
    () => ({ lat: latitude, lng: longitude }),
    [latitude, longitude]
  );

  const inputRef = useRef(null);

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          setAddress(results[0].formatted_address);
          setSearchInput(results[0].formatted_address);
        }
      }
    });

    setIsMapClick(true);
    setLatitude(lat);
    setLongitude(lng);
    setZoom(15);

    setMarkerAnimation(google.maps.Animation.DROP);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAddress(initialAddress);
      setSearchInput(initialAddress);
      setLatitude(initialLatitude);
      setLongitude(initialLongitude);
      setZoom(10);
      setIsMapClick(false);
      setMarkerAnimation(null);
    }
  }, [isOpen, initialAddress, initialLatitude, initialLongitude]);

  const handlePlaceChanged = () => {
    const searchBox = inputRef.current;

    const places = searchBox?.getPlaces ? searchBox.getPlaces() : [];

    if (places && places.length > 0) {
      const place = places[0];

      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setAddress(place.formatted_address || "");
        setSearchInput(place.formatted_address || "");
        setLatitude(lat);
        setLongitude(lng);
        setIsMapClick(false);

        setZoom(15);

        if (map) {
          map.panTo({ lat, lng });
        }

        setMarkerAnimation(google.maps.Animation.DROP);
      }
    }
  };

  const handleSave = () => {
    onSave(address, latitude, longitude);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[800px] relative flex flex-col overflow-hidden">
        <div className=" p-6 text-black flex justify-between items-center">
          <h2 className="text-3xl font-bold flex items-center">
            <MapPin className="mr-3" size={32} />
            Choose Location
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition"
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 bg-gray-50 p-6 border-r overflow-y-auto">
            <div className="relative mb-6">
              <StandaloneSearchBox
                onLoad={(ref) => (inputRef.current = ref)}
                onPlacesChanged={handlePlaceChanged}
              >
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchInput}
                    placeholder="Search Location"
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </StandaloneSearchBox>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Selected Address
                </p>
                <p className="text-lg font-semibold">
                  {address || "No address selected"}
                </p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">Latitude</p>
                  <p className="font-medium">{latitude.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Longitude</p>
                  <p className="font-medium">{longitude.toFixed(6)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-3/5 relative">
            {!isLoaded ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xl text-gray-600">Loading map...</p>
              </div>
            ) : (
              <GoogleMap
                mapContainerClassName="w-[105%] h-full"
                center={!isMapClick ? center : undefined}
                zoom={zoom}
                onLoad={(map) => setMap(map)}
                onClick={handleMapClick}
                options={{
                  draggableCursor: "default",
                  draggingCursor: "move",
                }}
              >
                <Marker
                  position={{ lat: latitude, lng: longitude }}
                  cursor="pointer"
                />
              </GoogleMap>
            )}
          </div>
        </div>

        <div className="bg-gray-100 p-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition duration-300"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsModal;
