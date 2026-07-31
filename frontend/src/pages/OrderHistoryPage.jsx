import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    getOrders,
} from "../api/orderApi";

import "./OrderHistoryPage.css";

const ORDERS_PER_PAGE = 4;

function OrderHistoryPage() {
    const [orders, setOrders] =
        useState([]);

    const [currentPage, setCurrentPage] =
        useState(1);

    const [isLoading, setIsLoading] =
        useState(true);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    useEffect(() => {
        async function loadOrders() {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const orderData =
                    await getOrders();

                setOrders(
                    Array.isArray(orderData)
                        ? orderData
                        : []
                );

                setCurrentPage(1);
            } catch (error) {
                console.error(
                    "Failed to load orders:",
                    error
                );

                setErrorMessage(
                    error.response?.data?.message ||
                    "Failed to load your orders."
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadOrders();
    }, []);

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
            return "Unknown";
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

    function formatOrderDate(dateTime) {
        if (!dateTime) {
            return "Date unavailable";
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

    function getTotalItemQuantity(items) {
        if (!Array.isArray(items)) {
            return 0;
        }

        return items.reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );
    }

    if (isLoading) {
        return (
            <main className="order-history-page">
                <section className="order-history-status-card">
                    <p>Loading your orders...</p>
                </section>
            </main>
        );
    }

    if (errorMessage) {
        return (
            <main className="order-history-page">
                <section className="order-history-status-card">
                    <h1>My Orders</h1>

                    <p className="order-history-error">
                        {errorMessage}
                    </p>

                    <Link to="/">
                        Back to Restaurants
                    </Link>
                </section>
            </main>
        );
    }

    if (orders.length === 0) {
        return (
            <main className="order-history-page">
                <section className="order-history-empty-card">
                    <div className="order-history-empty-icon">
                        🧾
                    </div>

                    <p className="order-history-eyebrow">
                        Your order history
                    </p>

                    <h1>No orders yet</h1>

                    <p>
                        Once you place an order, it will
                        appear here so you can review its
                        status and details.
                    </p>

                    <Link
                        to="/"
                        className="order-history-browse-link"
                    >
                        Browse Restaurants
                    </Link>
                </section>
            </main>
        );
    }

    const totalPages = Math.ceil(
        orders.length / ORDERS_PER_PAGE
    );

    const startIndex =
        (currentPage - 1) *
        ORDERS_PER_PAGE;

    const endIndex =
        startIndex +
        ORDERS_PER_PAGE;

    const visibleOrders =
        orders.slice(
            startIndex,
            endIndex
        );

    function handlePageChange(pageNumber) {
        if (
            pageNumber < 1 ||
            pageNumber > totalPages ||
            pageNumber === currentPage
        ) {
            return;
        }

        setCurrentPage(pageNumber);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    return (
        <main className="order-history-page">
            <div className="order-history-header">
                <div>
                    <p className="order-history-eyebrow">
                        Your order history
                    </p>

                    <h1>My Orders</h1>

                    <p>
                        Review your recent orders and
                        follow their current status.
                    </p>
                </div>

                <span className="order-history-count">
                    {orders.length}
                    {orders.length === 1
                        ? " order"
                        : " orders"}
                </span>
            </div>

            <section className="order-history-list">
                {visibleOrders.map((order) => {
                    const totalItemQuantity =
                        getTotalItemQuantity(
                            order.items
                        );

                    const statusClass =
                        getStatusClass(
                            order.status
                        );

                    return (
                        <article
                            key={order.orderId}
                            className="order-history-card"
                        >
                            <div className="order-history-card-main">
                                <div className="order-history-card-header">
                                    <div>
                                        <p className="order-history-number">
                                            Order #
                                            {order.orderId}
                                        </p>

                                        <h2>
                                            {
                                                order.restaurantName
                                            }
                                        </h2>

                                        <p className="order-history-date">
                                            {formatOrderDate(
                                                order.createdAt
                                            )}
                                        </p>
                                    </div>

                                    <span
                                        className={
                                            `order-history-status status-${statusClass}`
                                        }
                                    >
                                        <span className="status-dot" />

                                        {formatStatus(
                                            order.status
                                        )}
                                    </span>
                                </div>

                                <div className="order-history-details">
                                    <div className="order-history-detail">
                                        <span>
                                            Items
                                        </span>

                                        <strong>
                                            {
                                                totalItemQuantity
                                            }
                                            {totalItemQuantity === 1
                                                ? " item"
                                                : " items"}
                                        </strong>
                                    </div>

                                    <div className="order-history-detail">
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
                                </div>

                                {order.items?.length > 0 && (
                                    <div className="order-history-item-preview">
                                        {order.items
                                            .slice(0, 2)
                                            .map(
                                                (item) => (
                                                    <span
                                                        key={
                                                            item.orderItemId
                                                        }
                                                    >
                                                        {
                                                            item.quantity
                                                        }
                                                        {" × "}
                                                        {
                                                            item.menuItemName
                                                        }
                                                    </span>
                                                )
                                            )}

                                        {order.items.length > 2 && (
                                            <span>
                                                +
                                                {order.items.length -
                                                    2}{" "}
                                                more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="order-history-card-action">
                                <Link
                                    to={`/orders/${order.orderId}`}
                                    className="order-history-view-link"
                                >
                                    View Details

                                    <span aria-hidden="true">
                                        →
                                    </span>
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </section>

            <div className="order-pagination-section">
                <p className="order-pagination-summary">
                    Showing {startIndex + 1}–
                    {Math.min(
                        endIndex,
                        orders.length
                    )}{" "}
                    of {orders.length}{" "}
                    {orders.length === 1
                        ? "order"
                        : "orders"}
                </p>

                {totalPages > 1 && (
                    <nav
                        className="order-pagination"
                        aria-label="Order history pages"
                    >
                        <button
                            type="button"
                            className="order-pagination-arrow"
                            disabled={
                                currentPage === 1
                            }
                            onClick={() =>
                                handlePageChange(
                                    currentPage - 1
                                )
                            }
                        >
                            ← Previous
                        </button>

                        <div className="order-pagination-pages">
                            {Array.from(
                                {
                                    length:
                                        totalPages,
                                },
                                (_, index) =>
                                    index + 1
                            ).map(
                                (pageNumber) => (
                                    <button
                                        key={
                                            pageNumber
                                        }
                                        type="button"
                                        className={
                                            currentPage ===
                                            pageNumber
                                                ? "order-pagination-number active"
                                                : "order-pagination-number"
                                        }
                                        onClick={() =>
                                            handlePageChange(
                                                pageNumber
                                            )
                                        }
                                        aria-current={
                                            currentPage ===
                                            pageNumber
                                                ? "page"
                                                : undefined
                                        }
                                        aria-label={
                                            `Go to page ${pageNumber}`
                                        }
                                    >
                                        {
                                            pageNumber
                                        }
                                    </button>
                                )
                            )}
                        </div>

                        <button
                            type="button"
                            className="order-pagination-arrow"
                            disabled={
                                currentPage ===
                                totalPages
                            }
                            onClick={() =>
                                handlePageChange(
                                    currentPage + 1
                                )
                            }
                        >
                            Next →
                        </button>
                    </nav>
                )}
            </div>
        </main>
    );
}

export default OrderHistoryPage;