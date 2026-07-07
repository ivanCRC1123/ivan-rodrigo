import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { AlertError } from "../../../shared/ui/AlertError";
import { InputField } from "../../../shared/ui/InputField";
import { getApiErrorMessage } from "../../../shared/services/apiError";

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
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-3 text-emerald-400"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <h1 className="text-2xl font-bold text-white">
            MiTiendita Admin
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Inicie sesión con su email y contraseña
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <InputField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoFocus
              className="!bg-zinc-800/50"
            />
          </div>
          <div>
            <InputField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="!bg-zinc-800/50"
            />
          </div>

          <AlertError message={error} className="p-2 text-center" />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 transition"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600">
          Demo: admin@example.com / admin123
        </p>

        <p className="mt-4 text-center text-sm text-gray-500">
          ¿No tiene cuenta?{" "}
          <Link
            to="/register"
            className="font-medium text-emerald-400 hover:text-emerald-300"
          >
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  );
};
