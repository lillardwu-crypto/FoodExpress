function RestaurantCard({ restaurant }) {
    return (
        <article className="restaurant-card">
            <div className="restaurant-card-content">
                <h3>{restaurant.name}</h3>
                <p>{restaurant.address}</p>
                <p>{restaurant.phone}</p>
                <p>Status: {restaurant.status}</p>
            </div>
        </article>
    );
}

export default RestaurantCard;