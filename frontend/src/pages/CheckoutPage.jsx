import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";

import { getCart } from "../api/cartApi";
import { getAddresses } from "../api/addressApi";
import { checkout } from "../api/orderApi";

import "./CheckoutPage.css";

function CheckoutPage() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] =
        useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isPlacingOrder, setIsPlacingOrder] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    useEffect(() => {
        async function loadCheckoutData() {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const [cartData, addressData] =
                    await Promise.all([
                        getCart(),
                        getAddresses(),
                    ]);

                setCart(cartData);
                setAddresses(addressData);

                const defaultAddress =
                    addressData.find(
                        (address) =>
                            address.defaultAddress
                    );

                if (defaultAddress) {
                    setSelectedAddressId(
                        defaultAddress.addressId
                    );
                } else if (addressData.length > 0) {
                    setSelectedAddressId(
                        addressData[0].addressId
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to load checkout data:",
                    error
                );

                setErrorMessage(
                    error.response?.data?.message ||
                    "Failed to load checkout information."
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadCheckoutData();
    }, []);

    async function handlePlaceOrder() {
        if (!selectedAddressId) {
            setErrorMessage(
                "Please select a delivery address."
            );

            return;
        }

        try {
            setIsPlacingOrder(true);
            setErrorMessage("");

            const order = await checkout(
                selectedAddressId
            );

            navigate(
                `/orders/${order.orderId}`,
                {
                    state: {
                        orderPlaced: true,
                    },
                }
            );
        } catch (error) {
            console.error(
                "Failed to place order:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                "Failed to place order."
            );
        } finally {
            setIsPlacingOrder(false);
        }
    }

    if (isLoading) {
        return (
            <main className="checkout-page">
                <div className="checkout-status-card">
                    <p>Loading checkout...</p>
                </div>
            </main>
        );
    }

    if (errorMessage && !cart) {
        return (
            <main className="checkout-page">
                <div className="checkout-status-card">
                    <h1>Checkout</h1>

                    <p className="checkout-error-message">
                        {errorMessage}
                    </p>

                    <Link to="/cart">
                        Return to Cart
                    </Link>
                </div>
            </main>
        );
    }

    if (
        !cart ||
        !cart.items ||
        cart.items.length === 0
    ) {
        return (
            <main className="checkout-page">
                <div className="checkout-status-card">
                    <h1>Your cart is empty</h1>

                    <p>
                        Add items before continuing to
                        checkout.
                    </p>

                    <Link to="/">
                        Browse Restaurants
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <div className="checkout-header">
                <div>
                    <p className="checkout-eyebrow">
                        Complete your order
                    </p>

                    <h1>Checkout</h1>

                    <p>
                        Ordering from{" "}
                        <strong>
                            {cart.restaurantName}
                        </strong>
                    </p>
                </div>

                <Link
                    to="/cart"
                    className="back-to-cart-link"
                >
                    Back to Cart
                </Link>
            </div>

            {errorMessage && (
                <p className="checkout-error-banner">
                    {errorMessage}
                </p>
            )}

            <div className="checkout-layout">
                <section className="checkout-main-column">
                    <div className="checkout-section-card">
                        <div className="checkout-section-heading">
                            <div>
                                <p className="checkout-step-number">
                                    1
                                </p>

                                <div>
                                    <h2>
                                        Delivery address
                                    </h2>

                                    <p>
                                        Select where your
                                        order should be
                                        delivered.
                                    </p>
                                </div>
                            </div>

                            <Link
                                to="/account"
                                className="manage-addresses-link"
                            >
                                Manage addresses
                            </Link>
                        </div>

                        {addresses.length === 0 ? (
                            <div className="no-address-card">
                                <h3>
                                    No delivery address
                                </h3>

                                <p>
                                    Add an address before
                                    placing your order.
                                </p>

                                <Link
                                    to="/account"
                                    className="add-address-button"
                                >
                                    Add Address
                                </Link>
                            </div>
                        ) : (
                            <div className="address-options">
                                {addresses.map(
                                    (address) => {
                                        const isSelected =
                                            selectedAddressId ===
                                            address.addressId;

                                        return (
                                            <label
                                                key={
                                                    address.addressId
                                                }
                                                className={
                                                    isSelected
                                                        ? "checkout-address-card selected"
                                                        : "checkout-address-card"
                                                }
                                            >
                                                <input
                                                    type="radio"
                                                    name="deliveryAddress"
                                                    value={
                                                        address.addressId
                                                    }
                                                    checked={
                                                        isSelected
                                                    }
                                                    onChange={() =>
                                                        setSelectedAddressId(
                                                            address.addressId
                                                        )
                                                    }
                                                />

                                                <div className="checkout-address-content">
                                                    <div className="checkout-address-title">
                                                        <strong>
                                                            {address.label ||
                                                                "Delivery Address"}
                                                        </strong>

                                                        {address.defaultAddress && (
                                                            <span>
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p>
                                                        {
                                                            address.recipientName
                                                        }
                                                    </p>

                                                    <p>
                                                        {
                                                            address.street
                                                        }
                                                    </p>

                                                    <p>
                                                        {
                                                            address.city
                                                        }
                                                        ,{" "}
                                                        {
                                                            address.state
                                                        }{" "}
                                                        {
                                                            address.zipCode
                                                        }
                                                    </p>

                                                    <p>
                                                        {
                                                            address.phone
                                                        }
                                                    </p>
                                                </div>
                                            </label>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </div>

                    <div className="checkout-section-card">
                        <div className="checkout-section-heading">
                            <div>
                                <p className="checkout-step-number">
                                    2
                                </p>

                                <div>
                                    <h2>
                                        Review your items
                                    </h2>

                                    <p>
                                        Confirm your order
                                        before placing it.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="checkout-items-list">
                            {cart.items.map((item) => (
                                <article
                                    key={
                                        item.cartItemId
                                    }
                                    className="checkout-item"
                                >
                                    <div>
                                        <h3>
                                            {item.name}
                                        </h3>

                                        <p>
                                            Quantity:{" "}
                                            {item.quantity}
                                        </p>

                                        <p>
                                            $
                                            {Number(
                                                item.unitPrice
                                            ).toFixed(2)}
                                            {" each"}
                                        </p>
                                    </div>

                                    <strong>
                                        $
                                        {Number(
                                            item.subtotal
                                        ).toFixed(2)}
                                    </strong>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <aside className="checkout-summary-card">
                    <h2>Order summary</h2>

                    <div className="checkout-summary-row">
                        <span>Subtotal</span>

                        <span>
                            $
                            {Number(
                                cart.totalPrice
                            ).toFixed(2)}
                        </span>
                    </div>

                    <div className="checkout-summary-row">
                        <span>Delivery fee</span>
                        <span>Calculated later</span>
                    </div>

                    <div className="checkout-summary-divider" />

                    <div className="checkout-summary-total">
                        <span>Total</span>

                        <strong>
                            $
                            {Number(
                                cart.totalPrice
                            ).toFixed(2)}
                        </strong>
                    </div>

                    <button
                        type="button"
                        className="place-order-button"
                        disabled={
                            isPlacingOrder ||
                            !selectedAddressId
                        }
                        onClick={handlePlaceOrder}
                    >
                        {isPlacingOrder
                            ? "Placing Order..."
                            : "Place Order"}
                    </button>

                    {!selectedAddressId && (
                        <p className="checkout-button-note">
                            Select or add a delivery
                            address to continue.
                        </p>
                    )}

                    <p className="checkout-legal-note">
                        By placing your order, you confirm
                        that the delivery information is
                        correct.
                    </p>
                </aside>
            </div>
        </main>
    );
}

export default CheckoutPage;