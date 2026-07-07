import { useState } from "react";
import { Link } from "react-router-dom";
import { register as registerApi } from "../services/auth";
import { AlertError } from "../../../shared/ui/AlertError";
import { InputField } from "../../../shared/ui/InputField";
import { getApiErrorMessage } from "../../../shared/services/apiError";

export const RegisterPage = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      // Registrar al usuario (crea usuario + asigna rol de CLIENTE)
      await registerApi({
        email: email.trim(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        password,
      });

      // Mostrar mensaje de éxito — el usuario no tiene roles de admin,
      // así que redirigir al dashboard causaría pantalla en blanco
      setSuccess(true);
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h1 className="text-2xl font-bold text-white">
            Crear Cuenta
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Regístrese para acceder a MiTiendita
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-400"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="mb-2 text-lg font-semibold text-white">
              Cuenta creada exitosamente
            </p>
            <p className="mb-6 text-sm text-gray-400">
              Un administrador te asignará los roles de acceso. Mientras tanto,
              puedes cerrar esta ventana.
            </p>
            <Link
              to="/login"
              className="inline-block rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600 transition"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="flex gap-2">
                <InputField
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre"
                  className="w-1/2 !bg-zinc-800/50"
                  autoFocus
                />
                <InputField
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Apellido"
                  className="w-1/2 !bg-zinc-800/50"
                />
              </div>
              <InputField
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="!bg-zinc-800/50"
              />
              <InputField
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="!bg-zinc-800/50"
              />
              <InputField
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar contraseña"
                className="!bg-zinc-800/50"
              />

              <AlertError message={error} className="p-2 text-center" />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 transition"
              >
                {loading ? "Registrando..." : "Crear Cuenta"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              ¿Ya tiene cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-emerald-400 hover:text-emerald-300"
              >
                Iniciar sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
