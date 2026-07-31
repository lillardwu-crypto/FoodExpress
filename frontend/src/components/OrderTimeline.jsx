import "./OrderTimeline.css";

const ORDER_STEPS = [
    {
        status: "PENDING",
        label: "Order Placed",
        description:
            "Your order has been sent to the restaurant.",
    },
    {
        status: "ACCEPTED",
        label: "Accepted",
        description:
            "The restaurant accepted your order.",
    },
    {
        status: "PREPARING",
        label: "Preparing",
        description:
            "The restaurant is preparing your food.",
    },
    {
        status: "READY_FOR_PICKUP",
        label: "Ready for Pickup",
        description:
            "Your order is ready for the driver.",
    },
    {
        status: "OUT_FOR_DELIVERY",
        label: "Out for Delivery",
        description:
            "Your driver is delivering the order.",
    },
    {
        status: "DELIVERED",
        label: "Delivered",
        description:
            "Your order has been delivered.",
    },
];

function OrderTimeline({ status }) {
    const currentStepIndex =
        ORDER_STEPS.findIndex(
            (step) =>
                step.status === status
        );

    const isCancelled =
        status === "CANCELLED";

    return (
        <section className="order-timeline-card">
            <div className="order-timeline-heading">
                <div>
                    <p className="order-timeline-eyebrow">
                        Live progress
                    </p>

                    <h2>Order Timeline</h2>
                </div>

                <span
                    className={
                        isCancelled
                            ? "order-timeline-live order-timeline-cancelled"
                            : "order-timeline-live"
                    }
                >
                    <span />

                    {isCancelled
                        ? "Order cancelled"
                        : "Live updates"}
                </span>
            </div>

            {isCancelled ? (
                <div className="order-cancelled-state">
                    <div className="order-cancelled-icon">
                        ×
                    </div>

                    <div>
                        <h3>
                            Order Cancelled
                        </h3>

                        <p>
                            This order will not
                            continue through the
                            delivery process.
                        </p>
                    </div>
                </div>
            ) : (
                <ol className="order-timeline-list">
                    {ORDER_STEPS.map(
                        (step, index) => {
                            const isCompleted =
                                currentStepIndex >=
                                index;

                            const isCurrent =
                                currentStepIndex ===
                                index;

                            return (
                                <li
                                    key={
                                        step.status
                                    }
                                    className={
                                        isCurrent
                                            ? "order-timeline-step order-timeline-step-current"
                                            : isCompleted
                                              ? "order-timeline-step order-timeline-step-completed"
                                              : "order-timeline-step"
                                    }
                                >
                                    <div className="order-timeline-indicator">
                                        <div className="order-timeline-circle">
                                            {isCompleted
                                                ? "✓"
                                                : index +
                                                  1}
                                        </div>

                                        {index <
                                            ORDER_STEPS.length -
                                                1 && (
                                            <div className="order-timeline-line" />
                                        )}
                                    </div>

                                    <div className="order-timeline-content">
                                        <div className="order-timeline-label-row">
                                            <h3>
                                                {
                                                    step.label
                                                }
                                            </h3>

                                            {isCurrent && (
                                                <span className="order-timeline-current-label">
                                                    Current
                                                </span>
                                            )}
                                        </div>

                                        <p>
                                            {
                                                step.description
                                            }
                                        </p>
                                    </div>
                                </li>
                            );
                        }
                    )}
                </ol>
            )}
        </section>
    );
}

export default OrderTimeline;