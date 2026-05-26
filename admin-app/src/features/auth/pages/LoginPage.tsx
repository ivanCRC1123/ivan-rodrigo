import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../../../api/auth.api";
import { useAuthStore } from "../../../stores/authStore";
import { getApiErrorMessage } from "../../../lib/apiError";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Ingrese su email");
      return;
    }

    setLoading(true);
    try {
      const users = await getUsers();
      const user = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!user) {
        setError("Usuario no encontrado");
        setLoading(false);
        return;
      }

      if (!user.activo) {
        setError("Usuario inactivo");
        setLoading(false);
        return;
      }

      const isAdmin = user.roles.some(
        (r) => r.codigo === "ADMIN" || r.nombre === "ADMIN"
      );

      if (!isAdmin) {
        setError("No tiene permisos de administrador");
        setLoading(false);
        return;
      }

      setAuth(user);
      navigate("/productos");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // List all available users for quick login (dev helper)
  const [showUsers, setShowUsers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<
    { email: string; rol: string }[]
  >([]);

  const loadUsers = async () => {
    try {
      const users = await getUsers();
      setAvailableUsers(
        users.map((u) => ({
          email: u.email,
          rol: u.roles.map((r) => r.nombre).join(", "),
        }))
      );
      setShowUsers(true);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-8 shadow-2xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-white">
          MiTiendita Admin
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          Inicie sesión con su email
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-center text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>

        {/* Quick user picker for development */}
        <div className="mt-6 border-t border-zinc-700 pt-4">
          <button
            type="button"
            onClick={loadUsers}
            className="w-full text-xs text-gray-500 hover:text-gray-300"
          >
            {showUsers ? "Usuarios disponibles:" : "Ver usuarios disponibles"}
          </button>

          {showUsers && (
            <div className="mt-2 space-y-1">
              {availableUsers.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => setEmail(u.email)}
                  className="w-full rounded bg-zinc-800 px-2 py-1 text-left text-xs text-gray-400 hover:bg-zinc-700"
                >
                  <span className="text-white">{u.email}</span>
                  <span className="ml-2 text-emerald-400">({u.rol})</span>
                </button>
              ))}
              <p className="mt-2 text-[10px] text-gray-600">
                Admin seed: admin@example.com
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
