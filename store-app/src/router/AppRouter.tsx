import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../app/layout/Layout";
import ProductsPage from "../features/products/pages/ProductsPage";
import CartPage from "../features/products/pages/CartPage";
import ProductDetailPage from "../features/products/pages/ProductDetailPage";
import CheckoutPage from "../features/orders/pages/CheckoutPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import MyOrdersPage from "../features/orders/pages/MyOrdersPage";
import { useAuthStore } from "../store/authStore";

/** Wraps a route, redirects to /login if not authenticated */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

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

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
