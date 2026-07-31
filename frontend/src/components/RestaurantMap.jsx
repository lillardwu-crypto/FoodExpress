import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from "react-leaflet";

import { useEffect } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./RestaurantMap.css";

const DEFAULT_CENTER = [
    42.3601,
    -71.0589,
];

function isValidCoordinate(
    latitude,
    longitude
) {
    return (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}

function createRestaurantIcon(
    number,
    isSelected
) {
    return L.divIcon({
        className:
            "restaurant-marker-wrapper",

        html: `
            <div class="${
                isSelected
                    ? "restaurant-marker restaurant-marker-selected"
                    : "restaurant-marker"
            }">
                <span>${number}</span>
            </div>
        `,

        iconSize: [44, 54],
        iconAnchor: [22, 52],
        popupAnchor: [0, -48],
    });
}

function MapFocus({
    selectedRestaurant,
}) {
    const map = useMap();

    useEffect(() => {
        if (!selectedRestaurant) {
            return;
        }

        const latitude = Number(
            selectedRestaurant.latitude
        );

        const longitude = Number(
            selectedRestaurant.longitude
        );

        if (
            !isValidCoordinate(
                latitude,
                longitude
            )
        ) {
            return;
        }

        map.flyTo(
            [latitude, longitude],
            14,
            {
                animate: true,
                duration: 0.4,
            }
        );
    }, [
        map,
        selectedRestaurant,
    ]);

    return null;
}

function RestaurantMap({
    restaurants,
    selectedRestaurant,
    onRestaurantSelect,
}) {
    const restaurantsWithCoordinates =
        restaurants.filter(
            (restaurant) => {
                const latitude = Number(
                    restaurant.latitude
                );

                const longitude = Number(
                    restaurant.longitude
                );

                return isValidCoordinate(
                    latitude,
                    longitude
                );
            }
        );

    if (
        restaurantsWithCoordinates.length === 0
    ) {
        return (
            <section className="restaurant-map-panel">
                <div className="restaurant-map-empty">
                    <h3>
                        Map locations are unavailable
                    </h3>

                    <p>
                        These restaurants do not have
                        valid coordinates yet.
                    </p>
                </div>
            </section>
        );
    }

    const firstRestaurant =
        restaurantsWithCoordinates[0];

    const initialCenter = firstRestaurant
        ? [
              Number(
                  firstRestaurant.latitude
              ),
              Number(
                  firstRestaurant.longitude
              ),
          ]
        : DEFAULT_CENTER;

    return (
        <section
            className="restaurant-map-panel"
            aria-label="Restaurant locations"
        >
            <div className="restaurant-map-container">
                <MapContainer
                    center={initialCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="restaurant-map"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapFocus
                        selectedRestaurant={
                            selectedRestaurant
                        }
                    />

                    {restaurantsWithCoordinates.map(
                        (
                            restaurant,
                            index
                        ) => {
                            const isSelected =
                                selectedRestaurant
                                    ?.id ===
                                restaurant.id;

                            return (
                                <Marker
                                    key={
                                        restaurant.id
                                    }
                                    position={[
                                        Number(
                                            restaurant.latitude
                                        ),
                                        Number(
                                            restaurant.longitude
                                        ),
                                    ]}
                                    icon={createRestaurantIcon(
                                        index + 1,
                                        isSelected
                                    )}
                                    zIndexOffset={
                                        isSelected
                                            ? 1000
                                            : 0
                                    }
                                    eventHandlers={{
                                        click: () =>
                                            onRestaurantSelect?.(
                                                restaurant
                                            ),
                                    }}
                                >
                                    <Popup>
                                        <div className="restaurant-map-popup">
                                            <div className="restaurant-map-popup-header">
                                                <strong>
                                                    {
                                                        restaurant.name
                                                    }
                                                </strong>

                                                <span>
                                                    ⭐{" "}
                                                    {
                                                        restaurant.rating
                                                    }
                                                </span>
                                            </div>

                                            <span>
                                                {
                                                    restaurant.category
                                                }
                                            </span>

                                            <span>
                                                {
                                                    restaurant.deliveryTime
                                                }{" "}
                                                min · $
                                                {Number(
                                                    restaurant.deliveryFee
                                                ).toFixed(
                                                    2
                                                )}{" "}
                                                delivery
                                            </span>

                                            <Link
                                                to={`/restaurants/${restaurant.id}`}
                                            >
                                                View Restaurant →
                                            </Link>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        }
                    )}
                </MapContainer>
            </div>

            <div className="restaurant-map-legend">
                <span className="restaurant-map-legend-pin">
                    ●
                </span>

                <span>
                    Restaurant locations
                </span>
            </div>
        </section>
    );
}

export default RestaurantMap;