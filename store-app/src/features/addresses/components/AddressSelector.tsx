import { useState } from "react";
import { useAddresses, useCreateAddress, useDeleteAddress, useSetPrincipalAddress } from "../hooks/useAddresses";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import type { DireccionEntregaCreateCliente, DireccionEntregaReadSimple } from "../types";

interface AddressSelectorProps {
  selectedId: number | null;
  onSelect: (address: DireccionEntregaReadSimple) => void;
}

export default function AddressSelector({
  selectedId,
  onSelect,
}: AddressSelectorProps) {
  const { data: addresses, isLoading, isError, error } = useAddresses();
  const createMutation = useCreateAddress();
  const deleteMutation = useDeleteAddress();
  const setPrincipalMutation = useSetPrincipalAddress();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = (data: DireccionEntregaCreateCliente) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
      },
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Eliminar esta dirección?")) {
      deleteMutation.mutate(id);
    }
  };

  const selectedAddress = addresses?.find((a) => a.id === selectedId) ?? null;

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
        <span className="text-sm text-zinc-500">Cargando direcciones...</span>
      </div>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <div className="rounded-xl border border-red-800/50 bg-red-900/10 p-4">
        <p className="text-sm text-red-400">
          Error al cargar direcciones: {(error as Error)?.message ?? "Error desconocido"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-600">
          {addresses && addresses.length > 0
            ? `${addresses.length} dirección(es) guardada(s)`
            : "Sin direcciones guardadas"}
        </p>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-xs font-medium text-emerald-400 transition hover:text-emerald-300"
          >
            + Nueva dirección
          </button>
        )}
      </div>

      {/* Address list */}
      {addresses && addresses.length > 0 && !showForm && (
        <div className="grid gap-2">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              selected={addr.id === selectedId}
              onSelect={() => onSelect(addr)}
              onDelete={() => handleDelete(addr.id)}
              onSetPrincipal={() => setPrincipalMutation.mutate(addr.id)}
            />
          ))}
        </div>
      )}

      {/* New address form */}
      {showForm && (
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Nueva dirección
          </p>
          <AddressForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isPending={createMutation.isPending}
          />
        </div>
      )}

      {/* Selected address display (compact) */}
      {selectedAddress && !showForm && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/5 px-3 py-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-400 shrink-0"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-xs text-emerald-400">
            {selectedAddress.alias}: {selectedAddress.calle}{" "}
            {selectedAddress.numero}, {selectedAddress.localidad}
          </span>
        </div>
      )}
    </div>
  );
}
