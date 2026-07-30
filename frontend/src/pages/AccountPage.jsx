import { Link, useNavigate } from "react-router-dom";
import "./AccountPage.css";

function AccountPage() {
    const navigate = useNavigate();

    const userEmail =
        localStorage.getItem("userEmail") || "FoodExpress user";

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");

        window.dispatchEvent(new Event("authChanged"));

        navigate("/");
    }

    return (
        <main className="account-page">
            <div className="account-container">
                <section className="account-profile">
                    <div className="account-avatar">
                        {userEmail.charAt(0).toUpperCase()}
                    </div>

                    <div className="account-profile-info">
                        <h1>My account</h1>
                        <p>{userEmail}</p>
                    </div>
                </section>

                <section className="account-menu">
                    <Link
                        to="/account/addresses"
                        className="account-menu-item"
                    >
                        <div className="account-menu-icon">
                            ⌂
                        </div>

                        <div className="account-menu-content">
                            <h2>Addresses</h2>
                            <p>
                                View and manage your saved delivery
                                addresses.
                            </p>
                        </div>

                        <span className="account-menu-arrow">
                            ›
                        </span>
                    </Link>

                    <Link
                        to="/account/orders"
                        className="account-menu-item"
                    >
                        <div className="account-menu-icon">
                            ◷
                        </div>

                        <div className="account-menu-content">
                            <h2>Orders</h2>
                            <p>
                                View your previous orders and delivery
                                status.
                            </p>
                        </div>

                        <span className="account-menu-arrow">
                            ›
                        </span>
                    </Link>
                </section>

                <button
                    type="button"
                    className="account-logout-button"
                    onClick={handleLogout}
                >
                    Log out
                </button>
            </div>
        </main>
    );
}

export default AccountPage;