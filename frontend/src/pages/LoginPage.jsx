import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../api/authApi";
import "./LoginPage.css";
function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const data = await login(
                email,
                password
            );

            const token = data.accessToken;

            if (!token) {
                throw new Error(
                    "Login succeeded, but no token was returned."
                );
            }

            // 保存 JWT
            localStorage.setItem(
                "token",
                token
            );

            // 保存用户邮箱，用于 Navbar 显示
            localStorage.setItem(
                "userEmail",
                email
            );

            // 通知 Navbar 登录状态已经发生变化
            window.dispatchEvent(
                new Event("authChanged")
            );

            // 登录成功后返回首页
            navigate("/");
        } catch (error) {
            console.error(
                "Login failed:",
                error
            );

            setError(
                error.response?.data?.message ||
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
                    Sign in to order food and manage your cart.
                </p>

                {error && (
                    <p className="login-error-message">
                        {error}
                    </p>
                )}

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <div className="login-form-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
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
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
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
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign in"}
                    </button>
                </form>
            </div>
        </section>
    );
}

export default LoginPage;