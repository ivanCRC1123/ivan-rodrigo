import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { register as registerApi } from "../../../api/auth.api";
import { getApiErrorMessage } from "../../../lib/apiError";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !apellido.trim()) {
      setError("Complete nombre y apellido");
      return;
    }
    if (!email.trim()) {
      setError("Ingrese su email");
      return;
    }
    if (!password.trim()) {
      setError("Ingrese una contraseña");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      // Register the user (creates user + assigns CLIENT role)
      await registerApi({
        email: email.trim(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        password,
      });

      // Log in automatically with the new credentials
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
          Crear Cuenta
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          Regístrese para acceder a MiTiendita
        </p>

        <form onSubmit={handleRegister} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              className="w-1/2 rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Apellido"
              className="w-1/2 rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar contraseña"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white focus:ring-2 focus:ring-emerald-500"
          />

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
            {loading ? "Registrando..." : "Crear Cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tiene cuenta?{" "}
          <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
};
