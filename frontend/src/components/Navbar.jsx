import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(
        Boolean(localStorage.getItem("token"))
    );

    useEffect(() => {
        function updateAuthState() {
            setIsLoggedIn(
                Boolean(localStorage.getItem("token"))
            );
        }

        window.addEventListener(
            "authChanged",
            updateAuthState
        );

        return () => {
            window.removeEventListener(
                "authChanged",
                updateAuthState
            );
        };
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");

        setIsLoggedIn(false);

        window.dispatchEvent(
            new Event("authChanged")
        );

        navigate("/login");
    }

    return (
        <header className="navbar">
            <div className="navbar-container">
                <Link
                    to="/"
                    className="navbar-logo"
                >
                    FoodExpress
                </Link>

                <nav className="navbar-links">
                    <Link to="/">
                        Home
                    </Link>

                    <Link to="/restaurants">
                        Restaurants
                    </Link>

                    <Link to="/cart">
                        Cart
                    </Link>

                    {isLoggedIn ? (
                        <div className="navbar-auth">
                            <Link
                                to="/account"
                                className="navbar-account-link"
                            >
                                Account
                            </Link>

                            <button
                                type="button"
                                className="navbar-logout-button"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login">
                            Login
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Navbar;