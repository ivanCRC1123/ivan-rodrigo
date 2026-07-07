import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const iconByTitle = (title: string): string => {
  const lower = title.toLowerCase();
  if (lower.includes("producto") || lower.includes("product")) return "📦";
  if (lower.includes("categor")) return "🏷️";
  if (lower.includes("ingrediente") || lower.includes("ingredient")) return "🥗";
  if (lower.includes("usuario") || lower.includes("user")) return "👤";
  if (lower.includes("pedido") || lower.includes("order")) return "🧾";
  return "📝";
};

export const Modal = ({ title, open, onClose, children }: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 text-white p-6 shadow-2xl border border-zinc-700">
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-hidden="true">{iconByTitle(title)}</span>
            <h2 className="text-xl font-bold tracking-wide">{title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-red-500/20 px-3 py-1 text-sm font-medium text-red-400 hover:bg-red-500/30 transition"
          >
            ✕
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="text-sm text-gray-300">{children}</div>
      </div>
    </div>
  );
};
