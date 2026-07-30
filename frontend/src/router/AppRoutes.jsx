import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import RestaurantDetailPage from "../pages/RestaurantDetailPage";
import LoginPage from "../pages/LoginPage";
import AccountPage from "../pages/AccountPage";
import AddressPage from "../pages/AddressPage";
import AddAddressPage from "../pages/AddAddressPage";
import CartPage from "../pages/CartPage";
import EditAddressPage from "../pages/EditAddressPage";

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={<HomePage />}
            />

            <Route
                path="/restaurants/:restaurantId"
                element={<RestaurantDetailPage />}
            />

            <Route
                path="/login"
                element={<LoginPage />}
            />

            <Route
                path="/cart"
                element={<CartPage />}
            />

            <Route
                path="/account"
                element={<AccountPage />}
            />

            <Route
                path="/account/addresses"
                element={<AddressPage />}
            />

            <Route
                path="/account/addresses/new"
                element={<AddAddressPage />}
            />

            <Route
                path="/account/addresses/:addressId/edit"
                element={<EditAddressPage />}
            />
        </Routes>
    );
}

export default AppRoutes;