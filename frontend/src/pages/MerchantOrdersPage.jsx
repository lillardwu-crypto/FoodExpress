import { useEffect, useState } from "react";

import {
    getMerchantOrders,
    updateMerchantOrderStatus,
} from "../api/orderApi";

import "./MerchantOrdersPage.css";

const STATUS_ACTIONS = {
    PENDING: {
        label: "Accept order",
        nextStatus: "ACCEPTED",
    },
    ACCEPTED: {
        label: "Start preparing",
        nextStatus: "PREPARING",
    },
    PREPARING: {
        label: "Ready for pickup",
        nextStatus: "READY_FOR_PICKUP",
    },
};

function MerchantOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingOrderId, setUpdatingOrderId] =
        useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);
            setError("");

            const data =
                await getMerchantOrders();

            setOrders(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (error) {
            console.error(
                "Failed to load merchant orders:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load merchant orders."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusUpdate(
        orderId,
        nextStatus
    ) {
        try {
            setUpdatingOrderId(orderId);
            setError("");

            const updatedOrder =
                await updateMerchantOrderStatus(
                    orderId,
                    nextStatus
                );

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.orderId === orderId
                        ? updatedOrder
                        : order
                )
            );
        } catch (error) {
            console.error(
                "Failed to update merchant order status:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to update order status."
            );
        } finally {
            setUpdatingOrderId(null);
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
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    }

    function formatDate(dateValue) {
        if (!dateValue) {
            return "Unknown";
        }

        return new Date(
            dateValue
        ).toLocaleString();
    }

    if (loading) {
        return (
            <main className="merchant-orders-page">
                <p className="merchant-orders-message">
                    Loading merchant orders...
                </p>
            </main>
        );
    }

    return (
        <main className="merchant-orders-page">
            <section className="merchant-orders-header">
                <div>
                    <p className="section-eyebrow">
                        Merchant dashboard
                    </p>

                    <h1>Restaurant orders</h1>

                    <p className="merchant-orders-subtitle">
                        Accept incoming orders and move them
                        through the preparation process.
                    </p>
                </div>

                <button
                    type="button"
                    className="merchant-refresh-button"
                    onClick={loadOrders}
                >
                    Refresh orders
                </button>
            </section>

            {error && (
                <p className="merchant-orders-error">
                    {error}
                </p>
            )}

            {orders.length === 0 ? (
                <section className="merchant-orders-empty">
                    <h2>No orders yet</h2>

                    <p>
                        New customer orders will appear here.
                    </p>
                </section>
            ) : (
                <section className="merchant-orders-list">
                    {orders.map((order) => {
                        const action =
                            STATUS_ACTIONS[
                                order.status
                            ];

                        const isUpdating =
                            updatingOrderId ===
                            order.orderId;

                        return (
                            <article
                                key={order.orderId}
                                className="merchant-order-card"
                            >
                                <div className="merchant-order-top-row">
                                    <div>
                                        <p className="merchant-order-number">
                                            Order #
                                            {order.orderId}
                                        </p>

                                        <p className="merchant-order-date">
                                            {formatDate(
                                                order.createdAt
                                            )}
                                        </p>
                                    </div>

                                    <span
                                        className={`merchant-order-status merchant-order-status-${order.status?.toLowerCase()}`}
                                    >
                                        {formatStatus(
                                            order.status
                                        )}
                                    </span>
                                </div>

                                <div className="merchant-order-summary">
                                    <div>
                                        <span>Customer</span>
                                        <strong>
                                            User #
                                            {order.userId}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Total</span>
                                        <strong>
                                            $
                                            {Number(
                                                order.totalPrice
                                            ).toFixed(2)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Driver</span>
                                        <strong>
                                            {order.driverId
                                                ? `Driver #${order.driverId}`
                                                : "Not assigned"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="merchant-order-items">
                                    <h2>Items</h2>

                                    {order.items?.map(
                                        (item) => (
                                            <div
                                                key={
                                                    item.orderItemId
                                                }
                                                className="merchant-order-item"
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
                                                    {Number(
                                                        item.subtotal
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </strong>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="merchant-order-delivery">
                                    <h2>Delivery details</h2>

                                    <p>
                                        {
                                            order.deliveryRecipientName
                                        }
                                    </p>

                                    <p>
                                        {
                                            order.deliveryPhone
                                        }
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

                                <div className="merchant-order-footer">
                                    {action ? (
                                        <button
                                            type="button"
                                            className="merchant-order-action-button"
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
                                        <p className="merchant-order-no-action">
                                            No merchant action required.
                                        </p>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </section>
            )}
        </main>
    );
}

export default MerchantOrdersPage;