import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useLocation,
    useParams,
} from "react-router-dom";

import {
    cancelOrder,
    getOrderById,
} from "../api/orderApi";

import {
    getRestaurantById,
} from "../api/restaurantApi";

import OrderTimeline from "../components/OrderTimeline";
import DeliveryTrackingMap from "../components/DeliveryTrackingMap";

import {
    connectOrderTracking,
    disconnectOrderTracking,
} from "../services/orderTrackingSocket";

import "./OrderDetailPage.css";

function OrderDetailPage() {
    const { orderId } = useParams();
    const location = useLocation();

    const [order, setOrder] =
        useState(null);

    const [restaurant, setRestaurant] =
        useState(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [
        isCancelling,
        setIsCancelling,
    ] = useState(false);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    const [
        isTrackingConnected,
        setIsTrackingConnected,
    ] = useState(false);

    const orderPlaced =
        location.state?.orderPlaced === true;

    /*
     * Loads the initial order state through REST.
     *
     * After loading the order, the page uses
     * restaurantId to load the Restaurant DTO
     * containing latitude and longitude.
     */
    useEffect(() => {
        async function loadOrderDetail() {
            try {
                setIsLoading(true);
                setErrorMessage("");
                setRestaurant(null);

                const orderData =
                    await getOrderById(
                        orderId
                    );

                setOrder(orderData);

                const restaurantData =
                    await getRestaurantById(
                        orderData.restaurantId
                    );

                setRestaurant(
                    restaurantData
                );
            } catch (error) {
                console.error(
                    "Failed to load order detail:",
                    error
                );

                setErrorMessage(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to load order."
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadOrderDetail();
    }, [orderId]);

    /*
     * Subscribes to real-time order tracking events.
     *
     * REST provides the initial order state.
     * WebSocket provides subsequent status updates.
     */
    useEffect(() => {
        if (!orderId) {
            return undefined;
        }

        const client =
            connectOrderTracking({
                orderId,

                onConnect: () => {
                    setIsTrackingConnected(
                        true
                    );

                    console.info(
                        `Tracking connected for order ${orderId}`
                    );
                },

                onMessage: (
                    trackingMessage
                ) => {
                    if (
                        String(
                            trackingMessage.orderId
                        ) !==
                        String(orderId)
                    ) {
                        return;
                    }

                    setOrder(
                        (
                            currentOrder
                        ) => {
                            if (
                                !currentOrder
                            ) {
                                return currentOrder;
                            }

                            return {
                                ...currentOrder,

                                status:
                                    trackingMessage.status ??
                                    currentOrder.status,
                            };
                        }
                    );
                },

                onDisconnect: () => {
                    setIsTrackingConnected(
                        false
                    );
                },

                onError: (error) => {
                    console.error(
                        "Order tracking connection error:",
                        error
                    );
                },
            });

        return () => {
            setIsTrackingConnected(
                false
            );

            void disconnectOrderTracking(
                client
            );
        };
    }, [orderId]);

    function getStatusClass(status) {
        if (!status) {
            return "";
        }

        return status
            .toLowerCase()
            .replaceAll("_", "-");
    }

    function formatStatus(status) {
        if (!status) {
            return "";
        }

        return status
            .toLowerCase()
            .split("_")
            .map(
                (word) =>
                    word
                        .charAt(0)
                        .toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    }

    function formatOrderTime(dateTime) {
        if (!dateTime) {
            return "Unavailable";
        }

        return new Date(
            dateTime
        ).toLocaleString(
            "en-US",
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        );
    }

    function canCancelOrder(status) {
        return (
            status === "PENDING" ||
            status === "ACCEPTED"
        );
    }

    async function handleCancelOrder() {
        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this order?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setIsCancelling(true);
            setErrorMessage("");

            const updatedOrder =
                await cancelOrder(
                    order.orderId
                );

            setOrder(updatedOrder);
        } catch (error) {
            console.error(
                "Failed to cancel order:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                error.message ||
                "Failed to cancel order."
            );
        } finally {
            setIsCancelling(false);
        }
    }

    if (isLoading) {
        return (
            <main className="order-detail-page">
                <div className="order-detail-status-card">
                    <p>
                        Loading order...
                    </p>
                </div>
            </main>
        );
    }

    if (!order && errorMessage) {
        return (
            <main className="order-detail-page">
                <div className="order-detail-status-card">
                    <h1>Order</h1>

                    <p className="order-detail-error">
                        {errorMessage}
                    </p>

                    <Link to="/">
                        Back to Restaurants
                    </Link>
                </div>
            </main>
        );
    }

    if (!order) {
        return null;
    }

    const totalItemQuantity =
        order.items?.reduce(
            (total, item) =>
                total + item.quantity,
            0
        ) || 0;

    const statusClass =
        getStatusClass(
            order.status
        );

    const showCancelButton =
        canCancelOrder(
            order.status
        );

    return (
        <main className="order-detail-page">
            {orderPlaced && (
                <section className="order-success-banner">
                    <div className="order-success-icon">
                        ✓
                    </div>

                    <div className="order-success-content">
                        <div>
                            <h2>
                                Order placed successfully
                            </h2>

                            <p>
                                Your order has been sent to{" "}
                                {
                                    order.restaurantName
                                }.
                            </p>
                        </div>

                        <div className="estimated-delivery">
                            <span>
                                Estimated delivery
                            </span>

                            <strong>
                                20–30 min
                            </strong>
                        </div>
                    </div>
                </section>
            )}

            <div className="order-detail-header">
                <div>
                    <p className="order-detail-eyebrow">
                        Order details
                    </p>

                    <h1>
                        Order #
                        {order.orderId}
                    </h1>

                    <p>
                        {
                            order.restaurantName
                        }
                    </p>

                    <p
                        className={
                            isTrackingConnected
                                ? "tracking-connection tracking-connected"
                                : "tracking-connection tracking-disconnected"
                        }
                    >
                        <span
                            className="tracking-connection-dot"
                        />

                        {isTrackingConnected
                            ? "Live updates connected"
                            : "Connecting to live updates..."}
                    </p>
                </div>

                <span
                    className={
                        `order-status-badge status-${statusClass}`
                    }
                >
                    <span className="status-dot" />

                    {formatStatus(
                        order.status
                    )}
                </span>
            </div>

            {errorMessage && (
                <div className="order-cancel-error">
                    {errorMessage}
                </div>
            )}

            <div className="order-detail-layout">
                <section className="order-detail-main">
                    <div className="order-detail-card">
                        <h2>Items</h2>

                        <div className="order-detail-items">
                            {order.items?.map(
                                (item) => (
                                    <article
                                        key={
                                            item.orderItemId
                                        }
                                        className="order-detail-item"
                                    >
                                        <div>
                                            <h3>
                                                {
                                                    item.menuItemName
                                                }
                                            </h3>

                                            <p className="order-item-calculation">
                                                {
                                                    item.quantity
                                                }
                                                {" × $"}

                                                {Number(
                                                    item.unitPrice
                                                ).toFixed(
                                                    2
                                                )}
                                            </p>
                                        </div>

                                        <strong>
                                            $

                                            {Number(
                                                item.subtotal
                                            ).toFixed(
                                                2
                                            )}
                                        </strong>
                                    </article>
                                )
                            )}
                        </div>
                    </div>

                    <OrderTimeline
                        status={
                            order.status
                        }
                    />

                    <DeliveryTrackingMap
                        restaurant={
                            restaurant
                        }
                        order={
                            order
                        }
                        status={order.status}
                    />

                    <div className="order-detail-card">
                        <div className="order-card-title">
                            <span className="order-card-icon">
                                📍
                            </span>

                            <h2>
                                Delivery address
                            </h2>
                        </div>

                        <div className="order-address">
                            <strong>
                                {
                                    order.deliveryRecipientName
                                }
                            </strong>

                            <p>
                                {
                                    order.deliveryStreet
                                }
                            </p>

                            <p>
                                {
                                    order.deliveryCity
                                }
                                ,{" "}
                                {
                                    order.deliveryState
                                }{" "}
                                {
                                    order.deliveryZipCode
                                }
                            </p>

                            <p>
                                {
                                    order.deliveryPhone
                                }
                            </p>
                        </div>
                    </div>
                </section>

                <aside className="order-total-card">
                    <h2>
                        Order summary
                    </h2>

                    <div className="order-total-row">
                        <span>
                            Restaurant
                        </span>

                        <strong>
                            {
                                order.restaurantName
                            }
                        </strong>
                    </div>

                    <div className="order-total-row">
                        <span>
                            Items
                        </span>

                        <strong>
                            {
                                totalItemQuantity
                            }

                            {totalItemQuantity ===
                            1
                                ? " item"
                                : " items"}
                        </strong>
                    </div>

                    <div className="order-total-row">
                        <span>
                            Status
                        </span>

                        <strong
                            className={
                                `summary-status status-text-${statusClass}`
                            }
                        >
                            {formatStatus(
                                order.status
                            )}
                        </strong>
                    </div>

                    <div className="order-total-divider" />

                    <div className="order-total-row order-grand-total">
                        <span>
                            Total
                        </span>

                        <strong>
                            $

                            {Number(
                                order.totalPrice
                            ).toFixed(
                                2
                            )}
                        </strong>
                    </div>

                    <div className="order-total-divider" />

                    <div className="order-time-section">
                        <span>
                            Placed
                        </span>

                        <strong>
                            {formatOrderTime(
                                order.createdAt
                            )}
                        </strong>
                    </div>

                    <div className="order-summary-actions">
                        <Link
                            to="/"
                            className="order-home-link"
                        >
                            Back to Restaurants
                        </Link>

                        {showCancelButton && (
                            <button
                                type="button"
                                className="order-cancel-button"
                                disabled={
                                    isCancelling
                                }
                                onClick={
                                    handleCancelOrder
                                }
                            >
                                {isCancelling
                                    ? "Cancelling..."
                                    : "Cancel order"}
                            </button>
                        )}
                    </div>
                </aside>
            </div>
        </main>
    );
}

export default OrderDetailPage;