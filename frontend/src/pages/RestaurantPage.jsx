import {
  useEffect,
  useState,
} from "react";

import { getRestaurants } from "../api/restaurantApi";
import RestaurantCard from "../components/RestaurantCard";
import RestaurantMap from "../components/RestaurantMap";

import "./RestaurantPage.css";

function RestaurantPage() {
  const [restaurants, setRestaurants] =
      useState([]);

  const [
      selectedRestaurant,
      setSelectedRestaurant,
  ] = useState(null);

  const [loading, setLoading] =
      useState(true);

  const [error, setError] =
      useState("");

  useEffect(() => {
      async function fetchRestaurants() {
          try {
              setLoading(true);
              setError("");

              const restaurantData =
                  await getRestaurants();

              const normalizedRestaurants =
                  Array.isArray(restaurantData)
                      ? restaurantData
                      : [];

              setRestaurants(
                  normalizedRestaurants
              );

              const firstRestaurantWithLocation =
                  normalizedRestaurants.find(
                      (restaurant) => {
                          const latitude = Number(
                              restaurant.latitude
                          );

                          const longitude = Number(
                              restaurant.longitude
                          );

                          return (
                              Number.isFinite(latitude) &&
                              Number.isFinite(longitude)
                          );
                      }
                  );

              setSelectedRestaurant(
                  firstRestaurantWithLocation ||
                  null
              );
          } catch (error) {
              console.error(
                  "Failed to load restaurants:",
                  error
              );

              setError(
                  error.response?.data?.message ||
                  "Failed to load restaurants."
              );
          } finally {
              setLoading(false);
          }
      }

      fetchRestaurants();
  }, []);

  function handleRestaurantSelect(
      restaurant
  ) {
      setSelectedRestaurant(restaurant);

      const restaurantElement =
          document.getElementById(
              `restaurant-card-${restaurant.id}`
          );

      restaurantElement?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
      });
  }

  if (loading) {
      return (
          <main className="restaurant-page">
              <div className="restaurant-page-state">
                  <p>
                      Loading restaurants...
                  </p>
              </div>
          </main>
      );
  }

  if (error) {
      return (
          <main className="restaurant-page">
              <div className="restaurant-page-state">
                  <p className="error-message">
                      {error}
                  </p>
              </div>
          </main>
      );
  }

  return (
      <main className="restaurant-page">
          <header className="restaurant-page-header">
              <p className="section-eyebrow">
                  Explore nearby food
              </p>

              <h1>Restaurants</h1>

              <p className="restaurant-page-description">
                  Choose a restaurant and start
                  your order.
              </p>
          </header>

          {restaurants.length === 0 ? (
              <div className="restaurant-page-state">
                  <h2>
                      No restaurants available
                  </h2>

                  <p>
                      Please check again later.
                  </p>
              </div>
          ) : (
              <div className="restaurant-browser-layout">
                  <section
                      className="restaurant-list-panel"
                      aria-label="Restaurant list"
                  >
                      {restaurants.map(
                          (
                              restaurant,
                              index
                          ) => {
                              const isSelected =
                                  selectedRestaurant
                                      ?.id ===
                                  restaurant.id;

                              return (
                                  <div
                                      id={`restaurant-card-${restaurant.id}`}
                                      key={
                                          restaurant.id
                                      }
                                      className={
                                          isSelected
                                              ? "restaurant-list-item restaurant-list-item-selected"
                                              : "restaurant-list-item"
                                      }
                                      onMouseEnter={() =>
                                          setSelectedRestaurant(
                                              restaurant
                                          )
                                      }
                                      onFocus={() =>
                                          setSelectedRestaurant(
                                              restaurant
                                          )
                                      }
                                  >
                                      <div className="restaurant-list-number">
                                          {index + 1}
                                      </div>

                                      <RestaurantCard
                                          restaurant={
                                              restaurant
                                          }
                                      />
                                  </div>
                              );
                          }
                      )}
                  </section>

                  <RestaurantMap
                      restaurants={
                          restaurants
                      }
                      selectedRestaurant={
                          selectedRestaurant
                      }
                      onRestaurantSelect={
                          handleRestaurantSelect
                      }
                  />
              </div>
          )}
      </main>
  );
}

export default RestaurantPage;