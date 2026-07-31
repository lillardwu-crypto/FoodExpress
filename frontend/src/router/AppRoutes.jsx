import {
  Routes,
  Route,
} from "react-router-dom";

import HomePage from "../pages/HomePage";
import RestaurantPage from "../pages/RestaurantPage";
import RestaurantDetailPage from "../pages/RestaurantDetailPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import AccountPage from "../pages/AccountPage";
import AddressPage from "../pages/AddressPage";
import AddAddressPage from "../pages/AddAddressPage";
import CartPage from "../pages/CartPage";
import EditAddressPage from "../pages/EditAddressPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import OrderHistoryPage from "../pages/OrderHistoryPage";
import MerchantOrdersPage from "../pages/MerchantOrdersPage";
import DriverOrdersPage from "../pages/DriverOrdersPage";

function AppRoutes() {
  return (
      <Routes>
          <Route
              path="/"
              element={<HomePage />}
          />

          <Route
              path="/restaurants"
              element={<RestaurantPage />}
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
              path="/register"
              element={<RegisterPage />}
          />

          <Route
              path="/cart"
              element={<CartPage />}
          />

          <Route
              path="/checkout"
              element={<CheckoutPage />}
          />

          <Route
              path="/orders/:orderId"
              element={<OrderDetailPage />}
          />

          <Route
              path="/orders"
              element={<OrderHistoryPage />}
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

          <Route
              path="/merchant/orders"
              element={<MerchantOrdersPage />}
          />

          <Route
              path="/driver/orders"
              element={<DriverOrdersPage />}
          />
      </Routes>
  );
}

export default AppRoutes;