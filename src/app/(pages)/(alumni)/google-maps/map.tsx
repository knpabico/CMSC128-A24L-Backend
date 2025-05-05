// map.tsx
import {
  GoogleMap,
  Marker,
  useLoadScript,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Search, MapPin, XIcon } from "lucide-react";

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
  const libraries = useMemo(() => ["places"], []);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCnDnz-yF_a-LiquYYONJcf1wFobK75tNk",
    libraries,
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
      <div className="bg-white rounded-2xl shadow-2xl w-full h-[600px] max-w-3xl max-h-[800px] relative flex flex-col overflow-hidden">
        <div className=" p-6 text-black flex justify-between items-center">
          <div>
            <div>
              <h2 className="text-2xl font-bold flex items-center">
              <MapPin className="mr-3" size={28} />
                Choose location
              </h2>
            </div>
            <button onClick={onClose} className="absolute top-5 right-5"><XIcon className="cursor-pointer hover:text-red-500"/></button>
          </div>
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
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#0856ba] focus:outline-none"
                    value={searchInput}
                    placeholder="Search Location"
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handlePlaceChanged();
                      }
                    }}
                  />
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </StandaloneSearchBox>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 space-y-5">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Selected Address
                </p>
                <p className="text-sm font-semibold">
                  {address || "No address selected"}
                </p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">Latitude</p>
                  <p className="text-sm font-medium">{latitude.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Longitude</p>
                  <p className="text-sm font-medium">{longitude.toFixed(6)}</p>
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

        <div className="bg-white p-6 flex justify-end space-x-4">
          <button 
            onClick={handleSave}
            className="w-50 bg-[#0856ba] text-white py-2 px-3 rounded-full cursor-pointer hover:bg-[#92b2dc]">
              Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsModal;
