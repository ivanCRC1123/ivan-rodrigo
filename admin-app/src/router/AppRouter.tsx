import {
  BrowserRouter,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { useAuthStore } from "../stores/authStore";
import { CategoriesPage } from "../pages/categories/CategoriesPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { IngredientsPage } from "../pages/ingredients/IngredientsPage";
import { PedidosPage } from "../pages/pedidos/PedidosPage";
import { ProductDetailPage } from "../pages/products/ProductDetailPage";
import { ProductsPage } from "../pages/products/ProductsPage";

const linkBase =
  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition";

const ProtectedLayout = () => {
  const { user, logout } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* SIDEBAR */}
      <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-8 text-xl font-bold">MiTiendita</h2>

        <nav className="flex flex-col gap-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-400 hover:bg-zinc-800"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/productos"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-400 hover:bg-zinc-800"
              }`
            }
          >
            Productos
          </NavLink>

          <NavLink
            to="/categorias"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-400 hover:bg-zinc-800"
              }`
            }
          >
            Categorías
          </NavLink>

          <NavLink
            to="/ingredientes"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-400 hover:bg-zinc-800"
              }`
            }
          >
            Ingredientes
          </NavLink>

          <NavLink
            to="/pedidos"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-400 hover:bg-zinc-800"
              }`
            }
          >
            Pedidos
          </NavLink>
        </nav>

        {/* USER INFO & LOGOUT */}
        <div className="mt-auto pt-6">
          <div className="mb-2 text-xs text-gray-500">
            {user.nombre} {user.apellido}
            <br />
            {user.email}
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="w-full rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-400 hover:bg-red-500/30"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/productos/:id" element={<ProductDetailPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/ingredientes" element={<IngredientsPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
