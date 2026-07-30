import { useEffect, useState } from "react";

import { getRestaurants } from "../api/restaurantApi";
import RestaurantCard from "../components/RestaurantCard";

import "./HomePage.css";

function HomePage() {
    const [restaurants, setRestaurants] = useState([]);

    useEffect(() => {
        async function fetchRestaurants() {
            const data = await getRestaurants();
            setRestaurants(data);
        }

        fetchRestaurants();
    }, []);

    return (
        <main className="main-content">
            <section className="restaurant-section">
                <div className="section-heading">
                    <div>
                        <p className="section-eyebrow">
                            Order now
                        </p>

                        <h2>Restaurants</h2>
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
        </main>
    );
}

export default HomePage;