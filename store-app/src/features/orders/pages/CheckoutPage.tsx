import { useState, useEffect } from "react";
import { useCartStore } from "../../../store/useCartStore";
import { useOrders } from "../hooks/useOrders";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import AddressSelector from "../../addresses/components/AddressSelector";
import type { DireccionEntregaReadSimple } from "../../addresses/types";
import type { FormaPagoEnum } from "../types/orders";
import { Button } from "../../../shared/ui/Button";
import { Alert } from "../../../shared/ui/Alert";
import { getApiErrorMessage } from "../../../shared/services/apiError";
import { useCreatePreference } from "../../pagos";

const FORMAS_PAGO: { value: FormaPagoEnum; label: string; icon: React.ReactNode }[] = [
  {
    value: "EFECTIVO",
    label: "Efectivo",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    ),
  },
  {
    value: "TRANSFERENCIA",
    label: "Transferencia",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  {
    value: "MERCADO_PAGO",
    label: "Mercado Pago",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
];

function formatAddress(addr: DireccionEntregaReadSimple): string {
  return `${addr.alias}: ${addr.calle} ${addr.numero}, ${addr.localidad}`;
}

export default function CheckoutPage() {
  const { items } = useCartStore();
  const { create, isCreating } = useOrders();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [selectedAddress, setSelectedAddress] =
    useState<DireccionEntregaReadSimple | null>(null);
  const [formaPago, setFormaPago] = useState<FormaPagoEnum>("EFECTIVO");
  const [observaciones, setObservaciones] = useState("");
  const [mpRedirectError, setMpRedirectError] = useState(false);
  const [mpErrorDetail, setMpErrorDetail] = useState("");

  const { mutateAsync: createPref, isPending: isCreatingPref } =
    useCreatePreference();

  useEffect(() => {
    if (create.isSuccess && formaPago === "MERCADO_PAGO" && !mpRedirectError) {
      createPref(create.data.pedido_id)
        .then((pref) => {
          if (!pref.init_point) {
            setMpRedirectError(true);
            setMpErrorDetail("Mercado Pago no devolvió un link de pago. Revisá las credenciales en el backend.");
            return;
          }
          window.location.href = pref.init_point;
        })
        .catch((err) => {
          setMpRedirectError(true);
          setMpErrorDetail(getApiErrorMessage(err, "No se pudo conectar con Mercado Pago"));
        });
    }
  }, [create.isSuccess, formaPago, createPref, mpRedirectError, create.data?.pedido_id]);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleOrder = () => {
    if (!selectedAddress) return;
    create.mutate({
      usuario_id: user!.id,
      forma_pago: formaPago,
      direccion_entrega: formatAddress(selectedAddress),
      observaciones: observaciones || undefined,
      detalles: items.map((i) => ({
        producto_id: i.id,
        cantidad: i.quantity,
      })),
    });
  };

  // SUCCESS
  if (create.isSuccess) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent p-8 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
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
          <h1 className="mt-6 text-2xl font-bold text-emerald-400">
            Pedido confirmado
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {mpRedirectError
              ? mpErrorDetail || "Tu pedido fue creado, pero no pudimos conectar con Mercado Pago."
              : "Recibimos tu pedido y lo estamos procesando"}
          </p>

          {mpRedirectError && (
            <div className="mt-4">
              <Alert variant="error">
                {mpErrorDetail || "No se pudo conectar con Mercado Pago. Tu pedido fue creado, intentá pagar más tarde desde Mis Pedidos."}
              </Alert>
            </div>
          )}

          {create.data && (
            <div className="mt-8 space-y-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">N° Pedido</span>
                <span className="font-mono text-sm font-bold text-zinc-100">
                  {create.data.numero_pedido}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3">
                <span className="text-sm text-zinc-500">Total</span>
                <span className="text-xl font-bold text-emerald-400">
                  ${create.data.monto_total}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3">
                <span className="text-sm text-zinc-500">Estado</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {create.data.estado}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            {formaPago === "MERCADO_PAGO" && (
              <Button
                size="xl"
                onClick={() => {
                  setMpRedirectError(false);
                  setMpErrorDetail("");
                  createPref(create.data.pedido_id)
                    .then((pref) => {
                      if (!pref.init_point) {
                        setMpRedirectError(true);
                        setMpErrorDetail("Mercado Pago no devolvió un link de pago. Revisá las credenciales en el backend.");
                        return;
                      }
                      window.location.href = pref.init_point;
                    })
                    .catch((err) => {
                      setMpRedirectError(true);
                      setMpErrorDetail(getApiErrorMessage(err, "No se pudo conectar con Mercado Pago"));
                    });
                }}
                className="w-full"
                disabled={isCreatingPref}
              >
                {isCreatingPref ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Conectando con Mercado Pago...
                  </>
                ) : mpRedirectError ? (
                  "Reintentar pago con Mercado Pago"
                ) : (
                  "Ir a pagar con Mercado Pago"
                )}
              </Button>
            )}
            <Button
              size="xl"
              variant="dark"
              onClick={() => navigate("/")}
              className="w-full"
            >
              Seguir comprando
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Carrito vacío
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-800/60 py-20 px-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-600"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-zinc-400">
              No hay productos en tu carrito
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Agregá productos desde el catálogo
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
          >
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-zinc-600">
        <Link to="/cart" className="transition hover:text-zinc-300">
          Carrito
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-400">Checkout</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
        Checkout
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Completá los datos para finalizar tu compra
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* ── FORM ── */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-zinc-800/60 bg-gradient-to-b from-zinc-900/40 to-zinc-900/20 p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Datos de entrega
            </h2>

            <div className="space-y-5">
              {/* Dirección */}
              <div>
                <label className="mb-1.5 block text-xs text-zinc-600">
                  Dirección de entrega *
                </label>
                <AddressSelector
                  selectedId={selectedAddress?.id ?? null}
                  onSelect={setSelectedAddress}
                />
              </div>

              {/* Forma de pago */}
              <div>
                <label className="mb-1.5 block text-xs text-zinc-600">
                  Forma de pago
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {FORMAS_PAGO.map((fp) => (
                    <button
                      key={fp.value}
                      type="button"
                      onClick={() => setFormaPago(fp.value)}
                      className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-xs transition-all ${
                        formaPago === fp.value
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/10"
                          : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/80"
                      }`}
                    >
                      <span className={formaPago === fp.value ? "text-emerald-400" : "text-zinc-500"}>
                        {fp.icon}
                      </span>
                      <span className="text-[11px] font-medium">
                        {fp.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="mb-1.5 block text-xs text-zinc-600">
                  Observaciones
                </label>
                <textarea
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                  placeholder="Ej: sin cebolla, extra queso..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-zinc-800/60 bg-gradient-to-b from-zinc-900/40 to-zinc-900/20 p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Resumen
            </h2>

            <div className="space-y-3">
              {items.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate text-zinc-300">
                    {i.name}{" "}
                    <span className="text-zinc-600">x{i.quantity}</span>
                  </span>
                  <span className="font-medium text-zinc-100">
                    ${(i.price * i.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-4 border-t border-zinc-800/60" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Total</span>
              <span className="text-2xl font-bold text-emerald-400">
                ${total.toFixed(2)}
              </span>
            </div>

            <Button
              size="xl"
              onClick={handleOrder}
              disabled={isCreating || !selectedAddress}
              className="mt-6 w-full"
            >
              {isCreating ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Procesando...
                </>
              ) : (
                <>
                  Confirmar pedido
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
