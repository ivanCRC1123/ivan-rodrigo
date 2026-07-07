import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../shared/components/Layout";
import ProductsPage from "../features/products/pages/ProductsPage";
import CartPage from "../features/products/pages/CartPage";
import ProductDetailPage from "../features/products/pages/ProductDetailPage";
import CheckoutPage from "../features/orders/pages/CheckoutPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import MyOrdersPage from "../features/orders/pages/MyOrdersPage";
import OrderStatusPage from "../features/orders/pages/OrderStatusPage";
import { RequireAuth } from "./ProtectedRoute";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public */}
          <Route path="/" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <CheckoutPage />
              </RequireAuth>
            }
          />
          <Route
            path="/mis-pedidos"
            element={
              <RequireAuth>
                <MyOrdersPage />
              </RequireAuth>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <RequireAuth>
                <OrderStatusPage />
              </RequireAuth>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
