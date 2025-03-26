import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  OutlinedInput,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

const NOMINATIM_BASE_URL = " https://geocode.maps.co/search?";

const SearchBox = (props) => {
  const { selectPosition, setSelectPosition } = props;
  const [searchText, setSearchText] = useState("");
  const [listPlace, setListPlace] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce function to prevent too many API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Search function with error handling and loading state
  const searchPlaces = useCallback(async (query) => {
    // Only search if query has meaningful length
    if (!query || query.trim().length < 2) {
      setListPlace([]);
      return;
    }

    setIsLoading(true);
    try {
      const params = {
        q: query,
        api_key: "67e40cea5ce3b171642619dcy566b14",
      };

      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${NOMINATIM_BASE_URL}${queryString}`);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log(result);
      setListPlace(result);
    } catch (error) {
      console.error("Search error:", error);
      setListPlace([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search to reduce API calls
  const debouncedSearch = useCallback(
    debounce((query) => searchPlaces(query), 500),
    []
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  // Manual search button handler
  const handleSearch = () => {
    if (searchText) {
      searchPlaces(searchText);
    }
  };

  return (
    <div>
      <div>
        <Typography>Search Box</Typography>
        <OutlinedInput
          value={searchText}
          onChange={handleInputChange}
          placeholder="Search for a place"
          fullWidth
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={!searchText}
        >
          Search
        </Button>
      </div>
      <div>
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : listPlace.length != 0 ? (
          <List component="nav" aria-label="search results">
            {listPlace.map((item) => (
              <React.Fragment key={item.place_id}>
                <ListItem
                  onClick={() => {
                    setSelectPosition(item);
                  }}
                >
                  <ListItemIcon>
                    <img
                      src="/globe.svg"
                      alt="globe icon"
                      style={{ width: 38, height: 38 }}
                    />
                  </ListItemIcon>
                  <ListItemText primary={item.display_name} />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography>No Results to show</Typography>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
