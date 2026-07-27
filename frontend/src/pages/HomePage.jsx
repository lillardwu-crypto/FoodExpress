import { Link } from "react-router-dom";
import RestaurantCard from "../components/RestaurantCard";
import { getRestaurants } from "../api/restaurantApi";

function HomePage() {
  const restaurants = getRestaurants();
  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-tagline">Fast. Fresh. Delivered.</p>

          <h1 className="hero-title">
            Delicious food,
            <span> delivered to your door.</span>
          </h1>

          <p className="hero-description">
            Discover local restaurants, explore your favorite meals, and enjoy
            fast delivery with FoodExpress.
          </p>

          <Link to="/restaurants" className="hero-button">
            Browse Restaurants
          </Link>
        </div>

        <div className="hero-visual">
          <div className="food-circle">🍔</div>
          <div className="food-circle">🍕</div>
          <div className="food-circle">🍣</div>
        </div>
      </section>

      <section className="restaurant-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">Popular near you</p>
            <h2>Featured Restaurants</h2>
          </div>
        </div>

        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </section>
    </>
  );
}

export default HomePage;