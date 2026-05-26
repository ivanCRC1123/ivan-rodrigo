import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { getApiErrorMessage } from "../../../lib/apiError";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Ingrese su email");
      return;
    }
    if (!password.trim()) {
      setError("Ingrese su contraseña");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || getApiErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-8 shadow-2xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-white">
          MiTiendita Admin
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          Inicie sesión con su email y contraseña
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
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white focus:ring-2 focus:ring-emerald-500"
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
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600">
          Demo: admin@example.com / admin123
        </p>

        <p className="mt-4 text-center text-sm text-gray-500">
          ¿No tiene cuenta?{" "}
          <Link to="/register" className="font-medium text-emerald-400 hover:text-emerald-300">
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  );
};
