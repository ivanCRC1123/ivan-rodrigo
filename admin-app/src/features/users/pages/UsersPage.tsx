import { useState, useEffect } from "react";
import { getUsers, createUser, getRoles, assignRole, unassignRole } from "../../../api/auth.api";
import type { UsuarioAuth, RolReadSimple } from "../../../api/auth.api";
import { getApiErrorMessage } from "../../../lib/apiError";
import { useAuthStore } from "../../../stores/authStore";

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-500/20 text-red-400 border-red-500/30",
  STOCK: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PEDIDOS: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  CLIENT: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export const UsersPage = () => {
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole("ADMIN");
  const [users, setUsers] = useState<UsuarioAuth[]>([]);
  const [roles, setRoles] = useState<RolReadSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create user modal
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newApellido, setNewApellido] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [createError, setCreateError] = useState("");

  // Role manage modal
  const [manageUser, setManageUser] = useState<UsuarioAuth | null>(null);
  const [roleError, setRoleError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    try {
      await createUser({
        email: newEmail,
        nombre: newNombre,
        apellido: newApellido,
        password: newPassword,
      });
      setShowCreate(false);
      setNewEmail("");
      setNewNombre("");
      setNewApellido("");
      setNewPassword("");
      await fetchData();
    } catch (err) {
      setCreateError(getApiErrorMessage(err));
    }
  };

  const handleToggleRole = async (rol: RolReadSimple, add: boolean) => {
    if (!manageUser) return;
    setRoleError("");
    try {
      if (add) {
        await assignRole(manageUser.id, rol.id);
      } else {
        await unassignRole(manageUser.id, rol.id);
      }
      await fetchData();
      // Update the manageUser with fresh data
      const updated = users.find(u => u.id === manageUser.id);
      if (updated) setManageUser(updated);
    } catch (err) {
      setRoleError(getApiErrorMessage(err));
    }
  };

  // ======== RENDER ========
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-sm text-gray-400">{users.length} usuarios registrados</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            + Nuevo Usuario
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-400">Email</th>
              <th className="px-4 py-3 font-medium text-gray-400">Nombre</th>
              <th className="px-4 py-3 font-medium text-gray-400">Apellido</th>
              <th className="px-4 py-3 font-medium text-gray-400">Estado</th>
              <th className="px-4 py-3 font-medium text-gray-400">Roles</th>
              {isAdmin && <th className="px-4 py-3 font-medium text-gray-400">Acción</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((user) => (
              <tr key={user.id} className="bg-zinc-900/50 hover:bg-zinc-800/50">
                <td className="px-4 py-3 text-white">{user.email}</td>
                <td className="px-4 py-3 text-gray-300">{user.nombre}</td>
                <td className="px-4 py-3 text-gray-300">{user.apellido}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    user.activo
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {user.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((rol) => (
                      <span
                        key={rol.id}
                        className={`rounded-md border px-2 py-0.5 text-xs ${
                          roleColors[rol.codigo] || "bg-zinc-700 text-gray-300 border-zinc-600"
                        }`}
                      >
                        {rol.nombre}
                      </span>
                    ))}
                    {user.roles.length === 0 && (
                      <span className="text-xs text-gray-500">Sin roles</span>
                    )}
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setManageUser(user)}
                      className="rounded-lg bg-zinc-800 px-3 py-1 text-xs text-gray-400 hover:bg-zinc-700 hover:text-white"
                    >
                      Roles
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ======== CREATE USER MODAL ======== */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-bold text-white">Nuevo Usuario</h2>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-white focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Nombre"
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-white focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Apellido"
                value={newApellido}
                onChange={(e) => setNewApellido(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-white focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-white focus:ring-2 focus:ring-emerald-500"
              />
              {createError && (
                <p className="text-sm text-red-400">{createError}</p>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setCreateError(""); }}
                  className="flex-1 rounded-xl border border-zinc-700 py-2 text-sm text-gray-400 hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======== MANAGE ROLES MODAL ======== */}
      {manageUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <h2 className="mb-1 text-lg font-bold text-white">Roles de Usuario</h2>
            <p className="mb-4 text-sm text-gray-400">
              {manageUser.nombre} {manageUser.apellido} ({manageUser.email})
            </p>
            
            <div className="space-y-2">
              {roles.map((rol) => {
                const hasRole = manageUser.roles.some((r) => r.id === rol.id);
                return (
                  <label
                    key={rol.id}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800 p-3 hover:bg-zinc-700"
                  >
                    <div>
                      <span className="text-sm text-white">{rol.nombre}</span>
                      {rol.codigo && (
                        <span className="ml-2 text-xs text-gray-500">({rol.codigo})</span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={hasRole}
                      onChange={(e) => handleToggleRole(rol, e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-600 bg-zinc-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                );
              })}
            </div>

            {roleError && (
              <p className="mt-2 text-sm text-red-400">{roleError}</p>
            )}

            <button
              onClick={() => { setManageUser(null); setRoleError(""); }}
              className="mt-4 w-full rounded-xl border border-zinc-700 py-2 text-sm text-gray-400 hover:bg-zinc-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
