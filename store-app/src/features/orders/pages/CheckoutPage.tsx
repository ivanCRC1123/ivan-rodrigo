import { useState } from "react";
import { useCartStore } from "../../../store/useCartStore";
import { useCreateOrder } from "../hooks/useCreateOrder";
import { useNavigate } from "react-router-dom";
import type { FormaPagoEnum } from "../types";

const FORMAS_PAGO: { value: FormaPagoEnum; label: string }[] = [
  { value: "TARJETA_CREDITO", label: "Tarjeta de Crédito" },
  { value: "TARJETA_DEBITO", label: "Tarjeta de Débito" },
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "MERCADO_PAGO", label: "Mercado Pago" },
];

export default function CheckoutPage() {
  const { items } = useCartStore();
  const { mutate, isPending, isSuccess, data } = useCreateOrder();
  const navigate = useNavigate();
  const [direccion, setDireccion] = useState("");
  const [formaPago, setFormaPago] = useState<FormaPagoEnum>("EFECTIVO");
  const [observaciones, setObservaciones] = useState("");
  // Backend seed user: admin@example.com (id=1), but store uses a client user
  // By default we use usuario_id=4 (seed user Juan Pérez) for store customers
  const [usuarioId] = useState(4);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = () => {
    mutate({
      usuario_id: usuarioId,
      forma_pago: formaPago,
      direccion_entrega: direccion || "Sin especificar",
      observaciones: observaciones || undefined,
      detalles: items.map((i) => ({
        producto_id: Number(i.id),
        cantidad: i.quantity,
      })),
    });
  };

  if (isSuccess) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-green-600">
          ¡Pedido realizado con éxito!
        </h1>
        {data && (
          <div className="mt-4 rounded-lg border bg-green-50 p-4 text-left">
            <p>
              <strong>N° Pedido:</strong> {data.numero_pedido}
            </p>
            <p>
              <strong>Total:</strong> ${data.monto_total}
            </p>
            <p>
              <strong>Estado:</strong> {data.estado}
            </p>
          </div>
        )}
        <button
          onClick={() => navigate("/")}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Finalizar Pedido</h1>

      {/* Resumen del carrito */}
      <div className="mb-4 rounded-lg border p-4">
        <h2 className="font-bold">Resumen del pedido</h2>
        {items.map((i) => (
          <p key={i.id} className="text-sm">
            {i.name} x{i.quantity} - ${(i.price * i.quantity).toFixed(2)}
          </p>
        ))}
        <p className="mt-2 font-bold">
          Total: ${total.toFixed(2)}
        </p>
      </div>

      {/* Dirección de entrega */}
      <input
        className="mb-2 w-full rounded border p-2"
        placeholder="Dirección de entrega *"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
      />

      {/* Forma de pago */}
      <select
        className="mb-2 w-full rounded border p-2"
        value={formaPago}
        onChange={(e) => setFormaPago(e.target.value as FormaPagoEnum)}
      >
        {FORMAS_PAGO.map((fp) => (
          <option key={fp.value} value={fp.value}>
            {fp.label}
          </option>
        ))}
      </select>

      {/* Observaciones */}
      <textarea
        className="mb-4 w-full rounded border p-2"
        placeholder="Observaciones (opcional)"
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        rows={2}
      />

      <button
        className="w-full rounded bg-green-500 p-2 text-white hover:bg-green-600 disabled:opacity-50"
        onClick={handleOrder}
        disabled={isPending || items.length === 0}
      >
        {isPending ? "Procesando..." : "Confirmar Pedido"}
      </button>
    </div>
  );
}
