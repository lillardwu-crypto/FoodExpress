import { useEffect, useState } from "react";
import { getRestaurants } from "../api/restaurantApi";
import RestaurantCard from "../components/RestaurantCard";
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
        <div>
            {restaurants.map((restaurant) => (
                <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                />
            ))}
        </div>
    );
}

export default HomePage;