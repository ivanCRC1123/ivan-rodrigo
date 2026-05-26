import {
  BrowserRouter,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { useAuthStore } from "../stores/authStore";
import { CategoriesPage } from "../features/categories/pages/CategoriesPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { IngredientsPage } from "../features/ingredients/pages/IngredientsPage";
import { PedidosPage } from "../features/orders/pages/PedidosPage";
import { UsersPage } from "../features/users/pages/UsersPage";
import { ProductDetailPage } from "../features/products/pages/ProductDetailPage";
import { ProductsPage } from "../features/products/pages/ProductsPage";

const linkBase =
  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition";

interface SidebarLink {
  to: string;
  label: string;
  roles: string[];
}

const sidebarLinks: SidebarLink[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    roles: ["ADMIN", "STOCK", "PEDIDOS"],
  },
  { to: "/productos", label: "Productos", roles: ["ADMIN", "STOCK"] },
  { to: "/categorias", label: "Categorías", roles: ["ADMIN", "STOCK"] },
  { to: "/ingredientes", label: "Ingredientes", roles: ["ADMIN", "STOCK"] },
  { to: "/usuarios", label: "Usuarios", roles: ["ADMIN"] },
  { to: "/pedidos", label: "Pedidos", roles: ["ADMIN", "PEDIDOS"] },
];

const routeRoles: Record<string, string[]> = {
  "/dashboard": ["ADMIN", "STOCK", "PEDIDOS"],
  "/productos": ["ADMIN", "STOCK"],
  "/categorias": ["ADMIN", "STOCK"],
  "/ingredientes": ["ADMIN", "STOCK"],
  "/usuarios": ["ADMIN"],
  "/pedidos": ["ADMIN", "PEDIDOS"],
};

/** Safe helper — never throws, always returns boolean */
const checkRoles = (
  fn: ((...r: string[]) => boolean) | undefined,
  ...roles: string[]
): boolean => {
  try {
    if (typeof fn !== "function") return false;
    return fn(...roles);
  } catch {
    return false;
  }
};

const ProtectedLayout = () => {
  const store = useAuthStore();
  const user = store.user;
  const logout = store.logout;
  const hasAnyRole = store.hasAnyRole;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route-level guard — wrapped so it NEVER throws
  try {
    const currentPath = "/" + window.location.pathname.split("/")[1];
    const allowedRoles = routeRoles[currentPath];
    if (allowedRoles && !checkRoles(hasAnyRole, ...allowedRoles)) {
      return <Navigate to="/dashboard" replace />;
    }
  } catch {
    // If the guard itself fails, render normally (don't white-screen)
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* SIDEBAR */}
      <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-8 text-xl font-bold">MiTiendita</h2>

        <nav className="flex flex-col gap-2">
          {sidebarLinks
            .filter((link) => checkRoles(hasAnyRole, ...link.roles))
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-gray-400 hover:bg-zinc-800"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
        </nav>

        {/* USER INFO & LOGOUT */}
        <div className="mt-auto pt-6">
          <div className="mb-2 text-xs text-gray-500">
            <div className="text-sm font-medium text-white">
              {user.nombre} {user.apellido}
            </div>
            <div className="mt-0.5">{user.email}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {(user.roles ?? []).map((rol) => (
                <span
                  key={rol.id}
                  className="rounded-md border border-emerald-500/30 bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400"
                >
                  {rol.nombre}
                </span>
              ))}
            </div>
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
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/productos/:id" element={<ProductDetailPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/ingredientes" element={<IngredientsPage />} />
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
