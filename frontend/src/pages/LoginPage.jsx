import {
    useState,
} from "react";

import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    login,
} from "../api/authApi";

import "./LoginPage.css";

function LoginPage() {
    const navigate =
        useNavigate();

    const location =
        useLocation();

    const registrationSuccessful =
        location.state
            ?.registrationSuccessful ===
        true;

    const registeredEmail =
        location.state
            ?.registeredEmail || "";

    const [email, setEmail] =
        useState(
            registeredEmail
        );

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();

            const data =
                await login(
                    normalizedEmail,
                    password
                );

            const token =
                data.accessToken;

            const role =
                data.role;

            if (!token) {
                throw new Error(
                    "Login succeeded, but no token was returned."
                );
            }

            if (!role) {
                throw new Error(
                    "Login succeeded, but no user role was returned."
                );
            }

            localStorage.setItem(
                "token",
                token
            );

            localStorage.setItem(
                "userEmail",
                normalizedEmail
            );

            localStorage.setItem(
                "userRole",
                role
            );

            window.dispatchEvent(
                new Event(
                    "authChanged"
                )
            );

            if (
                role ===
                "MERCHANT"
            ) {
                navigate(
                    "/merchant/orders"
                );
            } else if (
                role ===
                "DRIVER"
            ) {
                navigate(
                    "/driver/orders"
                );
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error(
                "Login failed:",
                error
            );

            setError(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Login failed. Please check your email and password."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="login-page">
            <div className="login-card">
                <p className="section-eyebrow">
                    Welcome back
                </p>

                <h1>Sign in</h1>

                <p className="login-subtitle">
                    Sign in to access your
                    FoodExpress account.
                </p>

                {registrationSuccessful && (
                    <p className="login-success-message">
                        Account created successfully.
                        You can now sign in.
                    </p>
                )}

                {error && (
                    <p className="login-error-message">
                        {error}
                    </p>
                )}

                <form
                    className="login-form"
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="login-form-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={
                                email
                            }
                            onChange={(
                                event
                            ) =>
                                setEmail(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={
                                password
                            }
                            onChange={(
                                event
                            ) =>
                                setPassword(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={
                            loading
                        }
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign in"}
                    </button>
                </form>

                <p className="login-register-prompt">
                    Don&apos;t have an account?{" "}
                    <Link to="/register">
                        Create one
                    </Link>
                </p>
            </div>
        </section>
    );
}

export default LoginPage;