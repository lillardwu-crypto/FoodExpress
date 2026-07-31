import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    getCart,
    updateCartItem,
    removeCartItem,
} from "../api/cartApi";

import "./CartPage.css";

function CartPage() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] =
        useState(true);
    const [errorMessage, setErrorMessage] =
        useState("");
    const [
        updatingItemId,
        setUpdatingItemId,
    ] = useState(null);

    useEffect(() => {
        async function loadCart() {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const cartData = await getCart();

                setCart(cartData);
            } catch (error) {
                console.error(
                    "Failed to load cart:",
                    error
                );

                if (
                    error.response?.status === 404
                ) {
                    setCart(null);
                } else {
                    setErrorMessage(
                        error.response?.data
                            ?.message ||
                            "Failed to load cart."
                    );
                }
            } finally {
                setIsLoading(false);
            }
        }

        loadCart();
    }, []);

    async function handleUpdateQuantity(
        cartItemId,
        newQuantity
    ) {
        if (newQuantity < 1) {
            await handleRemove(
                cartItemId,
                false
            );

            return;
        }

        try {
            setErrorMessage("");
            setUpdatingItemId(cartItemId);

            const updatedCart =
                await updateCartItem(
                    cartItemId,
                    newQuantity
                );

            setCart(updatedCart);
        } catch (error) {
            console.error(
                "Failed to update cart item:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                    "Failed to update item quantity."
            );
        } finally {
            setUpdatingItemId(null);
        }
    }

    async function handleRemove(
        cartItemId,
        shouldConfirm = true
    ) {
        if (shouldConfirm) {
            const confirmed =
                window.confirm(
                    "Are you sure you want to remove this item?"
                );

            if (!confirmed) {
                return;
            }
        }

        try {
            setErrorMessage("");
            setUpdatingItemId(cartItemId);

            const updatedCart =
                await removeCartItem(
                    cartItemId
                );

            setCart(updatedCart);
        } catch (error) {
            console.error(
                "Failed to remove cart item:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                    "Failed to remove item."
            );
        } finally {
            setUpdatingItemId(null);
        }
    }

    function handleCheckout() {
        navigate("/checkout");
    }

    if (isLoading) {
        return (
            <main className="cart-page">
                <div className="cart-status-card">
                    <p>Loading cart...</p>
                </div>
            </main>
        );
    }

    if (errorMessage && !cart) {
        return (
            <main className="cart-page">
                <div className="cart-status-card">
                    <h1>Your Cart</h1>

                    <p className="cart-error-message">
                        {errorMessage}
                    </p>
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
            <main className="cart-page">
                <section className="empty-cart-card">
                    <div className="empty-cart-icon">
                        🛒
                    </div>

                    <h1>Your cart is empty</h1>

                    <p>
                        Add something delicious from a
                        restaurant to get started.
                    </p>

                    <Link
                        to="/"
                        className="browse-restaurants-button"
                    >
                        Browse Restaurants
                    </Link>
                </section>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <div className="cart-page-header">
                <div>
                    <p className="cart-eyebrow">
                        Your order
                    </p>

                    <h1>Your Cart</h1>

                    <p className="cart-restaurant-name">
                        From{" "}
                        {cart.restaurantName}
                    </p>
                </div>

                <Link
                    to={`/restaurants/${cart.restaurantId}`}
                    className="add-more-items-link"
                >
                    + Add more items
                </Link>
            </div>

            {errorMessage && (
                <p className="cart-error-banner">
                    {errorMessage}
                </p>
            )}

            <div className="cart-layout">
                <section className="cart-items-card">
                    <div className="cart-items-heading">
                        <h2>Items</h2>

                        <span>
                            {cart.items.length}
                            {cart.items.length === 1
                                ? " item"
                                : " items"}
                        </span>
                    </div>

                    <div className="cart-items-list">
                        {cart.items.map(
                            (item) => {
                                const isUpdating =
                                    updatingItemId ===
                                    item.cartItemId;

                                return (
                                    <article
                                        key={
                                            item.cartItemId
                                        }
                                        className="cart-item"
                                    >
                                        <div className="cart-item-information">
                                            <div>
                                                <h3>
                                                    {
                                                        item.name
                                                    }
                                                </h3>

                                                <p className="cart-item-unit-price">
                                                    $
                                                    {Number(
                                                        item.unitPrice
                                                    ).toFixed(
                                                        2
                                                    )}
                                                    {
                                                        " each"
                                                    }
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                className="remove-item-button"
                                                disabled={
                                                    isUpdating
                                                }
                                                onClick={() =>
                                                    handleRemove(
                                                        item.cartItemId
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="cart-item-actions">
                                            <div className="quantity-control">
                                                <button
                                                    type="button"
                                                    aria-label={
                                                        item.quantity ===
                                                        1
                                                            ? `Remove ${item.name}`
                                                            : `Decrease ${item.name} quantity`
                                                    }
                                                    disabled={
                                                        isUpdating
                                                    }
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item.cartItemId,
                                                            item.quantity -
                                                                1
                                                        )
                                                    }
                                                >
                                                    {item.quantity ===
                                                    1
                                                        ? "×"
                                                        : "−"}
                                                </button>

                                                <span>
                                                    {
                                                        item.quantity
                                                    }
                                                </span>

                                                <button
                                                    type="button"
                                                    aria-label={`Increase ${item.name} quantity`}
                                                    disabled={
                                                        isUpdating
                                                    }
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item.cartItemId,
                                                            item.quantity +
                                                                1
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <strong className="cart-item-subtotal">
                                                $
                                                {Number(
                                                    item.subtotal
                                                ).toFixed(
                                                    2
                                                )}
                                            </strong>
                                        </div>

                                        {isUpdating && (
                                            <p className="cart-item-updating">
                                                Updating
                                                item...
                                            </p>
                                        )}
                                    </article>
                                );
                            }
                        )}
                    </div>
                </section>

                <aside className="order-summary-card">
                    <h2>Order summary</h2>

                    <div className="order-summary-row">
                        <span>Subtotal</span>

                        <span>
                            $
                            {Number(
                                cart.totalPrice
                            ).toFixed(2)}
                        </span>
                    </div>

                    <div className="order-summary-row">
                        <span>
                            Delivery fee
                        </span>

                        <span>
                            Calculated at checkout
                        </span>
                    </div>

                    <div className="order-summary-divider" />

                    <div className="order-summary-total">
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
                        className="checkout-button"
                        onClick={
                            handleCheckout
                        }
                    >
                        Go to Checkout
                    </button>

                    <p className="checkout-note">
                        Delivery address and final
                        fees will be confirmed during
                        checkout.
                    </p>
                </aside>
            </div>
        </main>
    );
}

export default CartPage;