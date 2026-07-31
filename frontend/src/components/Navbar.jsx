import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] =
        useState(
            Boolean(
                localStorage.getItem(
                    "token"
                )
            )
        );

    const [userEmail, setUserEmail] =
        useState(
            localStorage.getItem(
                "userEmail"
            ) || ""
        );

    const [userRole, setUserRole] =
        useState(
            localStorage.getItem(
                "userRole"
            ) || ""
        );

    useEffect(() => {
        function updateAuthState() {
            setIsLoggedIn(
                Boolean(
                    localStorage.getItem(
                        "token"
                    )
                )
            );

            setUserEmail(
                localStorage.getItem(
                    "userEmail"
                ) || ""
            );

            setUserRole(
                localStorage.getItem(
                    "userRole"
                ) || ""
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
        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "userEmail"
        );

        localStorage.removeItem(
            "userRole"
        );

        setIsLoggedIn(false);
        setUserEmail("");
        setUserRole("");

        window.dispatchEvent(
            new Event(
                "authChanged"
            )
        );

        navigate("/login");
    }

    function renderCustomerLinks() {
        return (
            <>
                <Link to="/">
                    Home
                </Link>

                <Link to="/restaurants">
                    Restaurants
                </Link>

                <Link to="/cart">
                    Cart
                </Link>

                <Link to="/orders">
                    Orders
                </Link>

                <Link
                    to="/account"
                    className="navbar-account-link"
                >
                    Account
                </Link>
            </>
        );
    }

    function renderMerchantLinks() {
        return (
            <>
                <Link to="/merchant/orders">
                    Merchant Orders
                </Link>
            </>
        );
    }

    function renderDriverLinks() {
        return (
            <>
                <Link to="/driver/orders">
                    Driver Orders
                </Link>
            </>
        );
    }

    function renderRoleLinks() {
        if (
            userRole === "MERCHANT"
        ) {
            return renderMerchantLinks();
        }

        if (
            userRole === "DRIVER"
        ) {
            return renderDriverLinks();
        }

        return renderCustomerLinks();
    }

    return (
        <header className="navbar">
            <div className="navbar-container">
                <Link
                    to={
                        userRole ===
                        "MERCHANT"
                            ? "/merchant/orders"
                            : userRole ===
                              "DRIVER"
                            ? "/driver/orders"
                            : "/"
                    }
                    className="navbar-logo"
                >
                    FoodExpress
                </Link>

                <nav className="navbar-links">
                    {isLoggedIn ? (
                        <>
                            {renderRoleLinks()}

                            <div className="navbar-auth">
                                {userEmail && (
                                    <span className="navbar-user-email">
                                        {
                                            userEmail
                                        }
                                    </span>
                                )}

                                <button
                                    type="button"
                                    className="navbar-logout-button"
                                    onClick={
                                        handleLogout
                                    }
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/">
                                Home
                            </Link>

                            <Link to="/restaurants">
                                Restaurants
                            </Link>

                            <Link to="/login">
                                Login
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Navbar;