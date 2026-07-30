import { Link } from "react-router-dom";
import { imageMap } from "../utils/imageMap";
import "./RestaurantCard.css";
function RestaurantCard({ restaurant }) {
    const restaurantImage = imageMap[restaurant.imageUrl];

    return (
        <Link
            to={`/restaurants/${restaurant.id}`}
            style={{
                textDecoration: "none",
                color: "inherit"
            }}
        >
            <article className="restaurant-card">

                <div className="restaurant-image">
                    <img
                        src={restaurantImage}
                        alt={restaurant.name}
                    />

                    <div className="delivery-badge">
                        {restaurant.deliveryTime} min
                    </div>
                </div>

                <div className="restaurant-card-content">

                    <div className="restaurant-card-header">

                        <h3>{restaurant.name}</h3>

                        <span className="restaurant-rating">
                            ⭐ {restaurant.rating}
                        </span>

                    </div>

                    <p className="restaurant-category">
                        {restaurant.category}
                    </p>

                    <div className="restaurant-meta">

                        <span>
                            🚴 Delivery ${Number(restaurant.deliveryFee).toFixed(2)}
                        </span>

                        <span>•</span>

                        <span>{restaurant.status}</span>

                    </div>

                </div>

            </article>
        </Link>
    );
}

export default RestaurantCard;