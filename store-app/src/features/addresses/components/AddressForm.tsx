import { useState } from "react";
import type { DireccionEntregaCreateCliente } from "../types";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { TextArea } from "../../../shared/ui/TextArea";

interface AddressFormProps {
  onSubmit: (data: DireccionEntregaCreateCliente) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export default function AddressForm({
  onSubmit,
  onCancel,
  isPending,
}: AddressFormProps) {
  const [alias, setAlias] = useState("");
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [apartamento, setApartamento] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [provincia, setProvincia] = useState("");
  const [notas, setNotas] = useState("");
  const [esPrincipal, setEsPrincipal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      alias,
      calle,
      numero,
      apartamento: apartamento || undefined,
      localidad,
      codigo_postal: codigoPostal || undefined,
      provincia: provincia || undefined,
      notas: notas || undefined,
      es_principal: esPrincipal,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Alias */}
      <div>
        <label className="mb-1.5 block text-xs text-zinc-600">
          Alias <span className="text-emerald-500">*</span>
        </label>
        <Input
          subtle
          placeholder="Ej: Casa, Trabajo, Gym..."
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          required
        />
      </div>

      {/* Calle + Número */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="mb-1.5 block text-xs text-zinc-600">
            Calle <span className="text-emerald-500">*</span>
          </label>
          <Input
            subtle
            placeholder="Av. Siempre Viva"
            value={calle}
            onChange={(e) => setCalle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-zinc-600">
            N° <span className="text-emerald-500">*</span>
          </label>
          <Input
            subtle
            placeholder="123"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Apartamento */}
      <div>
        <label className="mb-1.5 block text-xs text-zinc-600">
          Piso / Dpto
        </label>
        <Input
          subtle
          placeholder="Ej: 4B"
          value={apartamento}
          onChange={(e) => setApartamento(e.target.value)}
        />
      </div>

      {/* Localidad */}
      <div>
        <label className="mb-1.5 block text-xs text-zinc-600">
          Localidad <span className="text-emerald-500">*</span>
        </label>
        <Input
          subtle
          placeholder="La Plata"
          value={localidad}
          onChange={(e) => setLocalidad(e.target.value)}
          required
        />
      </div>

      {/* Código Postal + Provincia */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs text-zinc-600">
            Código Postal
          </label>
          <Input
            subtle
            placeholder="1900"
            value={codigoPostal}
            onChange={(e) => setCodigoPostal(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-zinc-600">
            Provincia
          </label>
          <Input
            subtle
            placeholder="Buenos Aires"
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
          />
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="mb-1.5 block text-xs text-zinc-600">Notas</label>
        <TextArea
          subtle
          placeholder="Ej: Dejar en portería"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
        />
      </div>

      {/* Es principal */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={esPrincipal}
          onChange={(e) => setEsPrincipal(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/30"
        />
        <span className="text-xs text-zinc-400">
          Establecer como dirección principal
        </span>
      </label>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button type="submit" size="lg" disabled={isPending} className="flex-1">
          {isPending ? "Guardando..." : "Guardar dirección"}
        </Button>
      </div>
    </form>
  );
}
