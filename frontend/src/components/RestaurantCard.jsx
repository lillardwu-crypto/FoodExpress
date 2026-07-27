function RestaurantCard({ restaurant }) {
    return (
      <article className="restaurant-card">
        <div className="restaurant-image">
          <img src={restaurant.image} alt={restaurant.name} />
  
          {restaurant.deliveryFee === 0 && (
            <span className="delivery-badge">Free Delivery</span>
          )}
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
            <span>{restaurant.deliveryTime}</span>
            <span>•</span>
            <span>
              {restaurant.deliveryFee === 0
                ? "Free delivery"
                : `$${restaurant.deliveryFee.toFixed(2)} delivery`}
            </span>
          </div>
        </div>
      </article>
    );
  }
  
  export default RestaurantCard;