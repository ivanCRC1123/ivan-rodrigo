import { useState } from "react";
import { useUnitMutations } from "../hooks/useUnits";
import { Modal } from "../../../shared/components/Modal";
import { InputField } from "../../../shared/ui/InputField";
import { getApiErrorMessage } from "../../../shared/services/apiError";
import type { UnidadMedidaRead } from "../types/unit.types";

interface UnitFormModalProps {
  open: boolean;
  onClose: () => void;
  editing: UnidadMedidaRead | null;
}

const TIPOS = [
  { value: "peso", label: "Peso" },
  { value: "volumen", label: "Volumen" },
  { value: "contable", label: "Contable" },
] as const;

type UnitFormState = {
  nombre: string;
  simbolo: string;
  tipo: string;
};

const emptyForm: UnitFormState = {
  nombre: "",
  simbolo: "",
  tipo: "contable",
};

const toForm = (unit: UnidadMedidaRead): UnitFormState => ({
  nombre: unit.nombre,
  simbolo: unit.simbolo,
  tipo: unit.tipo,
});

export const UnitFormModal = ({
  open,
  onClose,
  editing,
}: UnitFormModalProps) => {
  const unitMutations = useUnitMutations();

  const [form, setForm] = useState<UnitFormState>(
    editing ? toForm(editing) : emptyForm,
  );
  const [formError, setFormError] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.nombre.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    if (!form.simbolo.trim()) {
      setFormError("El símbolo es obligatorio.");
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      simbolo: form.simbolo.trim(),
      tipo: form.tipo,
    };

    try {
      if (editing) {
        await unitMutations.update.mutateAsync({
          id: editing.id,
          payload,
        });
      } else {
        await unitMutations.create.mutateAsync(payload);
      }

      onClose();
    } catch (submitError) {
      setFormError(getApiErrorMessage(submitError));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar unidad de medida" : "Nueva unidad de medida"}
    >
      <form className="grid gap-4" onSubmit={(event) => void onSubmit(event)}>
        <InputField
          value={form.nombre}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, nombre: event.target.value }))
          }
          placeholder="Nombre (ej: kilogramo)"
        />

        <InputField
          value={form.simbolo}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, simbolo: event.target.value }))
          }
          placeholder="Símbolo (ej: kg)"
        />

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-400">Tipo</span>
          <select
            value={form.tipo}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, tipo: event.target.value }))
            }
            className="rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        {formError && <p className="text-sm text-red-400">{formError}</p>}

        <button
          type="submit"
          className="mt-2 rounded-xl bg-emerald-500 py-2 font-semibold hover:bg-emerald-600 transition"
          disabled={
            unitMutations.create.isPending || unitMutations.update.isPending
          }
        >
          {editing ? "Guardar cambios" : "Crear unidad"}
        </button>
      </form>
    </Modal>
  );
};
