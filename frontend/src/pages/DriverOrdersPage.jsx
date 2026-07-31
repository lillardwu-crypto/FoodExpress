import {
    useEffect,
    useState,
} from "react";

import {
    acceptDriverOrder,
    getAvailableDriverOrders,
    getDriverOrders,
    updateDriverOrderStatus,
} from "../api/orderApi";

import "./DriverOrdersPage.css";

const DRIVER_STATUS_ACTIONS = {
    READY_FOR_PICKUP: {
        label: "Start delivery",
        nextStatus:
            "OUT_FOR_DELIVERY",
    },

    OUT_FOR_DELIVERY: {
        label: "Mark as delivered",
        nextStatus:
            "DELIVERED",
    },
};

function DriverOrdersPage() {
    const [
        availableOrders,
        setAvailableOrders,
    ] = useState([]);

    const [
        driverOrders,
        setDriverOrders,
    ] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [
        acceptingOrderId,
        setAcceptingOrderId,
    ] = useState(null);

    const [
        updatingOrderId,
        setUpdatingOrderId,
    ] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);
            setError("");

            const [
                availableData,
                driverData,
            ] = await Promise.all([
                getAvailableDriverOrders(),
                getDriverOrders(),
            ]);

            setAvailableOrders(
                Array.isArray(
                    availableData
                )
                    ? availableData
                    : []
            );

            setDriverOrders(
                Array.isArray(driverData)
                    ? driverData
                    : []
            );
        } catch (error) {
            console.error(
                "Failed to load driver orders:",
                error
            );

            setError(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Failed to load driver orders."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleAcceptOrder(
        orderId
    ) {
        try {
            setAcceptingOrderId(
                orderId
            );

            setError("");

            const acceptedOrder =
                await acceptDriverOrder(
                    orderId
                );

            setAvailableOrders(
                (currentOrders) =>
                    currentOrders.filter(
                        (order) =>
                            order.orderId !==
                            orderId
                    )
            );

            setDriverOrders(
                (currentOrders) => {
                    const alreadyExists =
                        currentOrders.some(
                            (order) =>
                                order.orderId ===
                                orderId
                        );

                    if (alreadyExists) {
                        return currentOrders.map(
                            (order) =>
                                order.orderId ===
                                orderId
                                    ? acceptedOrder
                                    : order
                        );
                    }

                    return [
                        acceptedOrder,
                        ...currentOrders,
                    ];
                }
            );
        } catch (error) {
            console.error(
                "Failed to accept driver order:",
                error
            );

            setError(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Failed to accept delivery."
            );
        } finally {
            setAcceptingOrderId(
                null
            );
        }
    }

    async function handleStatusUpdate(
        orderId,
        nextStatus
    ) {
        try {
            setUpdatingOrderId(
                orderId
            );

            setError("");

            const updatedOrder =
                await updateDriverOrderStatus(
                    orderId,
                    nextStatus
                );

            setDriverOrders(
                (currentOrders) =>
                    currentOrders.map(
                        (order) =>
                            order.orderId ===
                            orderId
                                ? updatedOrder
                                : order
                    )
            );
        } catch (error) {
            console.error(
                "Failed to update driver order status:",
                error
            );

            setError(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Failed to update delivery status."
            );
        } finally {
            setUpdatingOrderId(
                null
            );
        }
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

    function formatDate(
        dateValue
    ) {
        if (!dateValue) {
            return "Unknown";
        }

        return new Date(
            dateValue
        ).toLocaleString();
    }

    function formatPrice(
        value
    ) {
        const price =
            Number(value);

        if (
            Number.isNaN(price)
        ) {
            return "0.00";
        }

        return price.toFixed(2);
    }

    function renderOrderDetails(
        order
    ) {
        return (
            <>
                <div className="driver-order-summary">
                    <div>
                        <span>
                            Restaurant
                        </span>

                        <strong>
                            {order.restaurantName ||
                                `Restaurant #${order.restaurantId}`}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Customer
                        </span>

                        <strong>
                            User #
                            {order.userId}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Total
                        </span>

                        <strong>
                            $
                            {formatPrice(
                                order.totalPrice
                            )}
                        </strong>
                    </div>
                </div>

                <div className="driver-order-items">
                    <h3>
                        Order items
                    </h3>

                    {order.items?.length >
                    0 ? (
                        order.items.map(
                            (item) => (
                                <div
                                    key={
                                        item.orderItemId
                                    }
                                    className="driver-order-item"
                                >
                                    <div>
                                        <strong>
                                            {
                                                item.menuItemName
                                            }
                                        </strong>

                                        <span>
                                            Quantity:{" "}
                                            {
                                                item.quantity
                                            }
                                        </span>
                                    </div>

                                    <strong>
                                        $
                                        {formatPrice(
                                            item.subtotal
                                        )}
                                    </strong>
                                </div>
                            )
                        )
                    ) : (
                        <p className="driver-order-muted">
                            No item information
                            available.
                        </p>
                    )}
                </div>

                <div className="driver-order-delivery">
                    <h3>
                        Delivery address
                    </h3>

                    <p>
                        {order.deliveryRecipientName ||
                            "Recipient unavailable"}
                    </p>

                    <p>
                        {order.deliveryPhone ||
                            "Phone unavailable"}
                    </p>

                    <p>
                        {
                            order.deliveryStreet
                        }
                        ,{" "}
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
                </div>
            </>
        );
    }

    if (loading) {
        return (
            <main className="driver-orders-page">
                <p className="driver-orders-message">
                    Loading driver
                    orders...
                </p>
            </main>
        );
    }

    return (
        <main className="driver-orders-page">
            <section className="driver-orders-header">
                <div>
                    <p className="section-eyebrow">
                        Driver dashboard
                    </p>

                    <h1>
                        Delivery orders
                    </h1>

                    <p className="driver-orders-subtitle">
                        Accept available
                        deliveries and update
                        each order throughout
                        the delivery process.
                    </p>
                </div>

                <button
                    type="button"
                    className="driver-refresh-button"
                    onClick={
                        loadOrders
                    }
                >
                    Refresh orders
                </button>
            </section>

            {error && (
                <p className="driver-orders-error">
                    {error}
                </p>
            )}

            <section className="driver-orders-section">
                <div className="driver-section-heading">
                    <div>
                        <p className="driver-section-label">
                            Available
                        </p>

                        <h2>
                            Available orders
                        </h2>
                    </div>

                    <span className="driver-order-count">
                        {
                            availableOrders.length
                        }
                    </span>
                </div>

                {availableOrders.length ===
                0 ? (
                    <div className="driver-orders-empty">
                        <h3>
                            No available
                            deliveries
                        </h3>

                        <p>
                            Orders ready for
                            pickup will appear
                            here.
                        </p>
                    </div>
                ) : (
                    <div className="driver-orders-list">
                        {availableOrders.map(
                            (order) => {
                                const isAccepting =
                                    acceptingOrderId ===
                                    order.orderId;

                                return (
                                    <article
                                        key={
                                            order.orderId
                                        }
                                        className="driver-order-card"
                                    >
                                        <div className="driver-order-top-row">
                                            <div>
                                                <p className="driver-order-number">
                                                    Order
                                                    #
                                                    {
                                                        order.orderId
                                                    }
                                                </p>

                                                <p className="driver-order-date">
                                                    {formatDate(
                                                        order.createdAt
                                                    )}
                                                </p>
                                            </div>

                                            <span
                                                className={`driver-order-status driver-order-status-${order.status?.toLowerCase()}`}
                                            >
                                                {formatStatus(
                                                    order.status
                                                )}
                                            </span>
                                        </div>

                                        {renderOrderDetails(
                                            order
                                        )}

                                        <div className="driver-order-footer">
                                            <button
                                                type="button"
                                                className="driver-order-action-button"
                                                disabled={
                                                    isAccepting
                                                }
                                                onClick={() =>
                                                    handleAcceptOrder(
                                                        order.orderId
                                                    )
                                                }
                                            >
                                                {isAccepting
                                                    ? "Accepting..."
                                                    : "Accept delivery"}
                                            </button>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}
            </section>

            <section className="driver-orders-section">
                <div className="driver-section-heading">
                    <div>
                        <p className="driver-section-label">
                            Assigned
                        </p>

                        <h2>
                            My deliveries
                        </h2>
                    </div>

                    <span className="driver-order-count">
                        {
                            driverOrders.length
                        }
                    </span>
                </div>

                {driverOrders.length ===
                0 ? (
                    <div className="driver-orders-empty">
                        <h3>
                            No assigned
                            deliveries
                        </h3>

                        <p>
                            Accept an available
                            order to begin a
                            delivery.
                        </p>
                    </div>
                ) : (
                    <div className="driver-orders-list">
                        {driverOrders.map(
                            (order) => {
                                const action =
                                    DRIVER_STATUS_ACTIONS[
                                        order
                                            .status
                                    ];

                                const isUpdating =
                                    updatingOrderId ===
                                    order.orderId;

                                return (
                                    <article
                                        key={
                                            order.orderId
                                        }
                                        className="driver-order-card"
                                    >
                                        <div className="driver-order-top-row">
                                            <div>
                                                <p className="driver-order-number">
                                                    Order
                                                    #
                                                    {
                                                        order.orderId
                                                    }
                                                </p>

                                                <p className="driver-order-date">
                                                    {formatDate(
                                                        order.createdAt
                                                    )}
                                                </p>
                                            </div>

                                            <span
                                                className={`driver-order-status driver-order-status-${order.status?.toLowerCase()}`}
                                            >
                                                {formatStatus(
                                                    order.status
                                                )}
                                            </span>
                                        </div>

                                        {renderOrderDetails(
                                            order
                                        )}

                                        <div className="driver-order-footer">
                                            {action ? (
                                                <button
                                                    type="button"
                                                    className="driver-order-action-button"
                                                    disabled={
                                                        isUpdating
                                                    }
                                                    onClick={() =>
                                                        handleStatusUpdate(
                                                            order.orderId,
                                                            action.nextStatus
                                                        )
                                                    }
                                                >
                                                    {isUpdating
                                                        ? "Updating..."
                                                        : action.label}
                                                </button>
                                            ) : (
                                                <p className="driver-order-no-action">
                                                    {order.status ===
                                                    "DELIVERED"
                                                        ? "Delivery completed."
                                                        : "No driver action required."}
                                                </p>
                                            )}
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}

export default DriverOrdersPage;