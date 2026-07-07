import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { CategoriesPage } from "../features/categories/pages/CategoriesPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { IngredientsPage } from "../features/ingredients/pages/IngredientsPage";
import { PedidosPage } from "../features/orders/pages/PedidosPage";
import { UnitsPage } from "../features/units/pages/UnitsPage";
import { UsersPage } from "../features/usuario/pages/UsersPage";
import { ProductDetailPage } from "../features/products/pages/ProductDetailPage";
import { ProductsPage } from "../features/products/pages/ProductsPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminLayout } from "../shared/components/AdminLayout";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/productos/:id" element={<ProductDetailPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/ingredientes" element={<IngredientsPage />} />
            <Route path="/unidades-medida" element={<UnitsPage />} />
            <Route path="/usuarios" element={<UsersPage />} />
            <Route path="/pedidos" element={<PedidosPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
