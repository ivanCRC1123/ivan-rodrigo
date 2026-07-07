import { useState } from "react";
import { useAddresses } from "../hooks/useAddresses";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import type {
  DireccionEntregaCreateCliente,
  DireccionEntregaReadSimple,
} from "../types";
import { Spinner } from "../../../shared/ui/Spinner";
import { Alert } from "../../../shared/ui/Alert";

interface AddressSelectorProps {
  selectedId: number | null;
  onSelect: (address: DireccionEntregaReadSimple) => void;
}

export default function AddressSelector({
  selectedId,
  onSelect,
}: AddressSelectorProps) {
  const {
    data: addresses,
    isLoading,
    isError,
    error,
    create,
    delete: removeAddr,
    setPrincipal,
    isCreating,
  } = useAddresses();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = (data: DireccionEntregaCreateCliente) => {
    create.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
      },
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Eliminar esta dirección?")) {
      removeAddr.mutate(id);
    }
  };

  const selectedAddress = addresses?.find((a) => a.id === selectedId) ?? null;

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-4">
        <Spinner size="sm" label="Cargando direcciones..." />
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <Alert>
        Error al cargar direcciones:{" "}
        {(error as Error)?.message ?? "Error desconocido"}
      </Alert>
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

      {/* lista de direcciones */}
      {addresses && addresses.length > 0 && !showForm && (
        <div className="grid gap-2">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              selected={addr.id === selectedId}
              onSelect={() => onSelect(addr)}
              onDelete={() => handleDelete(addr.id)}
              onSetPrincipal={() => setPrincipal.mutate(addr.id)}
            />
          ))}
        </div>
      )}

      {/* Nuevo formulario de dirección  */}
      {showForm && (
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Nueva dirección
          </p>
          <AddressForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isPending={isCreating}
          />
        </div>
      )}

      {/* Visualización de direcciones seleccionadas (compacta) */}
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
