import {
    MapContainer,
    Marker,
    Popup,
    Polyline,
    TileLayer,
    useMap,
} from "react-leaflet";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./DeliveryTrackingMap.css";

const FALLBACK_CENTER = [
    42.3601,
    -71.0589,
];

/*
 * Total animation:
 *
 * 40 steps × 500ms = approximately 20 seconds.
 */
const DRIVER_ANIMATION_STEPS = 40;
const DRIVER_ANIMATION_INTERVAL_MS = 500;

/*
 * The delivery endpoint is simulated because
 * OrderResponse currently stores the delivery address
 * as text, without geocoded latitude and longitude.
 */
function createDemoDeliveryPosition(
    restaurantLatitude,
    restaurantLongitude
) {
    return [
        restaurantLatitude + 0.012,
        restaurantLongitude + 0.016,
    ];
}

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

/*
 * Calculates a position between the start and end point.
 *
 * progress:
 * 0   = restaurant
 * 0.5 = route midpoint
 * 1   = delivery destination
 */
function interpolatePosition(
    startPosition,
    endPosition,
    progress
) {
    const latitude =
        startPosition[0] +
        (
            endPosition[0] -
            startPosition[0]
        ) *
        progress;

    const longitude =
        startPosition[1] +
        (
            endPosition[1] -
            startPosition[1]
        ) *
        progress;

    return [
        latitude,
        longitude,
    ];
}

function createMapIcon({
    emoji,
    className,
}) {
    return L.divIcon({
        className:
            "delivery-map-icon-wrapper",

        html: `
            <div class="delivery-map-icon ${className}">
                <span>${emoji}</span>
            </div>
        `,

        iconSize: [46, 46],
        iconAnchor: [23, 23],
        popupAnchor: [0, -24],
    });
}

const restaurantIcon =
    createMapIcon({
        emoji: "🍽️",
        className:
            "delivery-map-restaurant-icon",
    });

const customerIcon =
    createMapIcon({
        emoji: "🏠",
        className:
            "delivery-map-customer-icon",
    });

const driverIcon =
    createMapIcon({
        emoji: "🛵",
        className:
            "delivery-map-driver-icon",
    });

function MapBounds({
    restaurantPosition,
    deliveryPosition,
}) {
    const map = useMap();

    useEffect(() => {
        if (
            !restaurantPosition ||
            !deliveryPosition
        ) {
            return;
        }

        map.fitBounds(
            [
                restaurantPosition,
                deliveryPosition,
            ],
            {
                padding: [60, 60],
                maxZoom: 14,
                animate: true,
                duration: 0.6,
            }
        );
    }, [
        map,
        restaurantPosition,
        deliveryPosition,
    ]);

    return null;
}

function DeliveryTrackingMap({
    restaurant,
    order,
    status,
}) {
    const [
        driverPosition,
        setDriverPosition,
    ] = useState(null);

    const [
        driverProgress,
        setDriverProgress,
    ] = useState(0);

    const restaurantPosition =
        useMemo(() => {
            if (!restaurant) {
                return null;
            }

            const latitude = Number(
                restaurant.latitude
            );

            const longitude = Number(
                restaurant.longitude
            );

            if (
                !isValidCoordinate(
                    latitude,
                    longitude
                )
            ) {
                return null;
            }

            return [
                latitude,
                longitude,
            ];
        }, [restaurant]);

    const deliveryPosition =
        useMemo(() => {
            if (!restaurantPosition) {
                return null;
            }

            return createDemoDeliveryPosition(
                restaurantPosition[0],
                restaurantPosition[1]
            );
        }, [restaurantPosition]);

    /*
     * Controls the driver position according to
     * the real-time order status.
     */
    useEffect(() => {
        if (
            !restaurantPosition ||
            !deliveryPosition
        ) {
            setDriverPosition(null);
            setDriverProgress(0);

            return undefined;
        }

        /*
         * Driver is waiting at the restaurant.
         */
        if (
            status ===
            "READY_FOR_PICKUP"
        ) {
            setDriverPosition(
                restaurantPosition
            );

            setDriverProgress(0);

            return undefined;
        }

        /*
         * Driver has reached the destination.
         */
        if (
            status ===
            "DELIVERED"
        ) {
            setDriverPosition(
                deliveryPosition
            );

            setDriverProgress(1);

            return undefined;
        }

        /*
         * Driver moves from the restaurant to
         * the simulated delivery destination.
         */
        if (
            status ===
            "OUT_FOR_DELIVERY"
        ) {
            let currentStep = 0;

            setDriverPosition(
                restaurantPosition
            );

            setDriverProgress(0);

            const intervalId =
                window.setInterval(
                    () => {
                        currentStep += 1;

                        const progress =
                            Math.min(
                                currentStep /
                                    DRIVER_ANIMATION_STEPS,
                                1
                            );

                        const nextPosition =
                            interpolatePosition(
                                restaurantPosition,
                                deliveryPosition,
                                progress
                            );

                        setDriverPosition(
                            nextPosition
                        );

                        setDriverProgress(
                            progress
                        );

                        if (
                            currentStep >=
                            DRIVER_ANIMATION_STEPS
                        ) {
                            window.clearInterval(
                                intervalId
                            );
                        }
                    },
                    DRIVER_ANIMATION_INTERVAL_MS
                );

            /*
             * Clears the interval when:
             *
             * - the component unmounts
             * - the order status changes
             * - another order is opened
             */
            return () => {
                window.clearInterval(
                    intervalId
                );
            };
        }

        /*
         * PENDING, ACCEPTED, PREPARING
         * and CANCELLED do not show a driver.
         */
        setDriverPosition(null);
        setDriverProgress(0);

        return undefined;
    }, [
        status,
        restaurantPosition,
        deliveryPosition,
    ]);

    const shouldShowDriver =
        status ===
            "READY_FOR_PICKUP" ||
        status ===
            "OUT_FOR_DELIVERY" ||
        status ===
            "DELIVERED";

    if (!restaurant) {
        return (
            <section className="delivery-map-card">
                <div className="delivery-map-heading">
                    <div>
                        <p className="delivery-map-eyebrow">
                            Live delivery
                        </p>

                        <h2>
                            Delivery Tracking
                        </h2>
                    </div>
                </div>

                <div className="delivery-map-state">
                    <p>
                        Loading delivery map...
                    </p>
                </div>
            </section>
        );
    }

    if (
        !restaurantPosition ||
        !deliveryPosition
    ) {
        return (
            <section className="delivery-map-card">
                <div className="delivery-map-heading">
                    <div>
                        <p className="delivery-map-eyebrow">
                            Live delivery
                        </p>

                        <h2>
                            Delivery Tracking
                        </h2>
                    </div>
                </div>

                <div className="delivery-map-state">
                    <h3>
                        Location unavailable
                    </h3>

                    <p>
                        This restaurant does not
                        have valid map coordinates.
                    </p>
                </div>
            </section>
        );
    }

    const routePositions = [
        restaurantPosition,
        deliveryPosition,
    ];

    const completedRoutePositions =
        driverPosition
            ? [
                  restaurantPosition,
                  driverPosition,
              ]
            : [];

    const remainingRoutePositions =
        driverPosition
            ? [
                  driverPosition,
                  deliveryPosition,
              ]
            : routePositions;

    const progressPercentage =
        Math.round(
            driverProgress * 100
        );

    return (
        <section className="delivery-map-card">
            <div className="delivery-map-heading">
                <div>
                    <p className="delivery-map-eyebrow">
                        Live delivery
                    </p>

                    <h2>
                        Delivery Tracking
                    </h2>
                </div>

                <span className="delivery-map-demo-label">
                    Demo route
                </span>
            </div>

            <div className="delivery-map-container">
                <MapContainer
                    center={
                        restaurantPosition ||
                        FALLBACK_CENTER
                    }
                    zoom={13}
                    scrollWheelZoom={true}
                    className="delivery-tracking-map"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapBounds
                        restaurantPosition={
                            restaurantPosition
                        }
                        deliveryPosition={
                            deliveryPosition
                        }
                    />

                    {/* Remaining route */}
                    <Polyline
                        positions={
                            remainingRoutePositions
                        }
                        pathOptions={{
                            color: "#9dbea9",
                            weight: 5,
                            opacity: 0.75,
                            dashArray: "10 10",
                        }}
                    />

                    {/* Completed route */}
                    {completedRoutePositions.length >
                        0 && (
                        <Polyline
                            positions={
                                completedRoutePositions
                            }
                            pathOptions={{
                                color: "#1f9d55",
                                weight: 6,
                                opacity: 0.95,
                            }}
                        />
                    )}

                    <Marker
                        position={
                            restaurantPosition
                        }
                        icon={restaurantIcon}
                    >
                        <Popup>
                            <div className="delivery-map-popup">
                                <strong>
                                    {
                                        restaurant.name
                                    }
                                </strong>

                                <span>
                                    Restaurant pickup
                                </span>

                                <span>
                                    {
                                        restaurant.address
                                    }
                                </span>
                            </div>
                        </Popup>
                    </Marker>

                    <Marker
                        position={
                            deliveryPosition
                        }
                        icon={customerIcon}
                    >
                        <Popup>
                            <div className="delivery-map-popup">
                                <strong>
                                    Simulated delivery
                                    destination
                                </strong>

                                <span>
                                    {
                                        order.deliveryRecipientName
                                    }
                                </span>

                                <span>
                                    {
                                        order.deliveryStreet
                                    }
                                    ,{" "}
                                    {
                                        order.deliveryCity
                                    }
                                </span>
                            </div>
                        </Popup>
                    </Marker>

                    {shouldShowDriver &&
                        driverPosition && (
                            <Marker
                                position={
                                    driverPosition
                                }
                                icon={driverIcon}
                                zIndexOffset={1000}
                            >
                                <Popup>
                                    <div className="delivery-map-popup">
                                        <strong>
                                            Driver
                                        </strong>

                                        <span>
                                            {status ===
                                            "READY_FOR_PICKUP"
                                                ? "Waiting at the restaurant"
                                                : status ===
                                                    "OUT_FOR_DELIVERY"
                                                  ? `${progressPercentage}% of the demo route completed`
                                                  : "Delivery completed"}
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                </MapContainer>
            </div>

            <div className="delivery-map-summary">
                <div>
                    <span className="delivery-map-summary-icon">
                        🍽️
                    </span>

                    <div>
                        <span>
                            Pickup
                        </span>

                        <strong>
                            {
                                restaurant.name
                            }
                        </strong>
                    </div>
                </div>

                <span className="delivery-map-summary-arrow">
                    →
                </span>

                <div>
                    <span className="delivery-map-summary-icon">
                        🏠
                    </span>

                    <div>
                        <span>
                            Simulated drop-off
                        </span>

                        <strong>
                            {
                                order.deliveryCity
                            }
                            ,{" "}
                            {
                                order.deliveryState
                            }
                        </strong>
                    </div>
                </div>
            </div>

            {status ===
                "OUT_FOR_DELIVERY" && (
                <div className="delivery-progress">
                    <div className="delivery-progress-header">
                        <span>
                            Driver progress
                        </span>

                        <strong>
                            {progressPercentage}%
                        </strong>
                    </div>

                    <div className="delivery-progress-track">
                        <div
                            className="delivery-progress-fill"
                            style={{
                                width:
                                    `${progressPercentage}%`,
                            }}
                        />
                    </div>
                </div>
            )}
        </section>
    );
}

export default DeliveryTrackingMap;