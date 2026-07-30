import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getRestaurantById } from "../api/restaurantApi";
import { getMenuItemsByRestaurant } from "../api/menuItemApi";
import { addToCart } from "../api/cartApi";
import { imageMap } from "../utils/imageMap";
import "./RestaurantDetailPage.css";

function RestaurantDetailPage() {
    const { id } = useParams();

    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    // 记录当前正在加入购物车的 menu item
    const [addingItemId, setAddingItemId] = useState(null);

    // 成功加入购物车的 menu item
    const [addedItemId, setAddedItemId] = useState(null);

    const [cartMessage, setCartMessage] = useState("");
    const [cartError, setCartError] = useState("");

    useEffect(() => {
        async function fetchRestaurantDetail() {
            try {
                setLoading(true);
                setPageError("");

                const [restaurantData, menuData] = await Promise.all([
                    getRestaurantById(id),
                    getMenuItemsByRestaurant(id),
                ]);

                setRestaurant(restaurantData);
                setMenuItems(menuData);
            } catch (error) {
                console.error(
                    "Failed to load restaurant detail:",
                    error
                );

                setPageError(
                    error.response?.data?.message ||
                    "Failed to load restaurant information."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchRestaurantDetail();
    }, [id]);

    async function handleAddToCart(menuItemId) {
        try {
            setAddingItemId(menuItemId);
            setAddedItemId(null);
            setCartMessage("");
            setCartError("");

            const updatedCart = await addToCart(
                menuItemId,
                1
            );

            setAddedItemId(menuItemId);

            setCartMessage(
                `Added to cart. Cart total: $${Number(
                    updatedCart.totalPrice
                ).toFixed(2)}`
            );

            // 一段时间后恢复按钮文字
            setTimeout(() => {
                setAddedItemId(null);
            }, 1500);
        } catch (error) {
            console.error(
                "Failed to add item to cart:",
                error
            );

            setCartError(
                error.response?.data?.message ||
                "Failed to add item to cart."
            );
        } finally {
            setAddingItemId(null);
        }
    }

    if (loading) {
        return (
            <section className="restaurant-detail-page">
                <p>Loading restaurant...</p>
            </section>
        );
    }

    if (pageError) {
        return (
            <section className="restaurant-detail-page">
                <p className="error-message">
                    {pageError}
                </p>
            </section>
        );
    }

    if (!restaurant) {
        return (
            <section className="restaurant-detail-page">
                <p>Restaurant not found.</p>
            </section>
        );
    }

    const restaurantImage =
        imageMap[restaurant.imageUrl];

    return (
        <section className="restaurant-detail-page">
            <div className="restaurant-detail-banner">
                <img
                    src={restaurantImage}
                    alt={restaurant.name}
                />
            </div>

            <div className="restaurant-detail-header">
                <div>
                    <h1>{restaurant.name}</h1>

                    <p className="restaurant-detail-category">
                        {restaurant.category}
                    </p>

                    <p className="restaurant-detail-meta">
                        {restaurant.deliveryTime} min

                        <span>•</span>

                        Delivery $
                        {Number(
                            restaurant.deliveryFee
                        ).toFixed(2)}

                        <span>•</span>

                        {restaurant.status}
                    </p>

                    <p className="restaurant-detail-address">
                        {restaurant.address}
                    </p>
                </div>

                <div className="restaurant-detail-rating">
                    ⭐ {restaurant.rating}
                </div>
            </div>

            <div className="menu-section">
                <div className="menu-section-heading">
                    <div>
                        <p className="section-eyebrow">
                            Order now
                        </p>

                        <h2>Menu</h2>
                    </div>

                    <p>{menuItems.length} items</p>
                </div>

                {cartMessage && (
                    <p className="cart-success-message">
                        ✓ {cartMessage}
                    </p>
                )}

                {cartError && (
                    <p className="cart-error-message">
                        {cartError}
                    </p>
                )}

                <div className="menu-list">
                    {menuItems.map((item) => {
                        const isAdding =
                            addingItemId === item.id;

                        const isAdded =
                            addedItemId === item.id;

                        return (
                            <article
                                key={item.id}
                                className="menu-item-card"
                            >
                                <div className="menu-item-content">
                                    <div className="menu-item-header">
                                        <h3>{item.name}</h3>

                                        <span className="menu-item-price">
                                            $
                                            {Number(
                                                item.price
                                            ).toFixed(2)}
                                        </span>
                                    </div>

                                    <p className="menu-item-description">
                                        {item.description}
                                    </p>

                                    <p className="menu-item-availability">
                                        {item.available
                                            ? "Available"
                                            : "Currently unavailable"}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="add-to-cart-button"
                                    onClick={() =>
                                        handleAddToCart(
                                            item.id
                                        )
                                    }
                                    disabled={
                                        !item.available ||
                                        isAdding
                                    }
                                >
                                    {isAdding
                                        ? "Adding..."
                                        : isAdded
                                            ? "Added ✓"
                                            : "Add to Cart"}
                                </button>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default RestaurantDetailPage;