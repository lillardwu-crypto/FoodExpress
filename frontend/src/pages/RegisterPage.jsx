import {
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    register,
} from "../api/authApi";

import "./RegisterPage.css";

function RegisterPage() {
    const navigate =
        useNavigate();

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [
        confirmPassword,
        setConfirmPassword,
    ] = useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const normalizedName =
                name.trim();

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();

            if (!normalizedName) {
                throw new Error(
                    "Name is required."
                );
            }

            if (password.length < 8) {
                throw new Error(
                    "Password must be at least 8 characters."
                );
            }

            if (
                password !==
                confirmPassword
            ) {
                throw new Error(
                    "Passwords do not match."
                );
            }

            await register(
                normalizedName,
                normalizedEmail,
                password
            );

            navigate(
                "/login",
                {
                    state: {
                        registrationSuccessful:
                            true,
                        registeredEmail:
                            normalizedEmail,
                    },
                }
            );
        } catch (error) {
            console.error(
                "Registration failed:",
                error
            );

            setError(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="register-page">
            <div className="register-card">
                <p className="section-eyebrow">
                    Join FoodExpress
                </p>

                <h1>
                    Create account
                </h1>

                <p className="register-subtitle">
                    Create your customer account
                    and start ordering food.
                </p>

                {error && (
                    <p className="register-error-message">
                        {error}
                    </p>
                )}

                <form
                    className="register-form"
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="register-form-group">
                        <label htmlFor="name">
                            Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={
                                name
                            }
                            onChange={(
                                event
                            ) =>
                                setName(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Enter your name"
                            autoComplete="name"
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="register-form-group">
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
                            maxLength={255}
                            required
                        />
                    </div>

                    <div className="register-form-group">
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
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="register-form-group">
                        <label htmlFor="confirmPassword">
                            Confirm password
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            value={
                                confirmPassword
                            }
                            onChange={(
                                event
                            ) =>
                                setConfirmPassword(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Enter your password again"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={100}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="register-button"
                        disabled={
                            loading
                        }
                    >
                        {loading
                            ? "Creating account..."
                            : "Create account"}
                    </button>
                </form>

                <p className="register-login-prompt">
                    Already have an account?{" "}
                    <Link to="/login">
                        Sign in
                    </Link>
                </p>
            </div>
        </section>
    );
}

export default RegisterPage;