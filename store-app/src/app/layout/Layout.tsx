import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/authStore";

export function Layout({ children }: { children: React.ReactNode }) {
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 antialiased">
      {/* ========== NAVBAR ========== */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-lg">
              MT
            </span>
            <span className="hidden sm:inline">
              MI<span className="text-emerald-400">Tiendita</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
            >
              Inicio
            </Link>

            {user && (
              <Link
                to="/mis-pedidos"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
              >
                Mis Pedidos
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline-block"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-zinc-950">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-2">
                <span className="hidden text-xs text-zinc-500 sm:block">
                  {user.nombre}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20 sm:px-4 sm:text-sm"
              >
                Ingresar
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1">{children}</main>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-zinc-800/60 bg-zinc-900/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} MiTiendita. Todos los derechos
            reservados.
          </p>
          <div className="flex gap-6 text-sm text-zinc-600">
            <span className="transition hover:text-zinc-400">Términos</span>
            <span className="transition hover:text-zinc-400">Privacidad</span>
            <span className="transition hover:text-zinc-400">Ayuda</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
