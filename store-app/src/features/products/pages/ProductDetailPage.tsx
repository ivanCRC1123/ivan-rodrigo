import { useParams } from "react-router-dom";
import { useProductDetail } from "../hooks/useProducts";
import { useCartStore } from "../../../store/useCartStore";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProductDetail(id!);
  const { addItem } = useCartStore();

  if (isLoading) return <div>Cargando...</div>;
  if (error || !product) return <div>Producto no encontrado.</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">{product.nombre}</h1>
      <p className="my-2">{product.descripcion}</p>
      <p className="font-bold text-xl">${product.precio_base}</p>
      <button 
        className="bg-green-500 text-white p-2 mt-4 rounded"
        onClick={() => addItem({ id: String(product.id), name: product.nombre, price: product.precio_base, quantity: 1 })}
      >
        Agregar al carrito
      </button>
    </div>
  );
}
