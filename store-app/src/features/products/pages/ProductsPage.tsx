import { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { Link } from "react-router-dom";

export default function ProductsPage() {
  const { data: products, isLoading, error } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  if (isLoading) return <div>Cargando productos...</div>;
  if (error) return <div>Error al cargar productos.</div>;

  const filtered = products?.filter((p) => 
    (category === "All" || p.categorias.some(c => c.nombre === category)) &&
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ["All", ...new Set(products?.flatMap(p => p.categorias.map(c => c.nombre)) || [])];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Catálogo</h1>
      <input 
        className="border p-2 mb-4 w-full"
        placeholder="Buscar..." 
        onChange={(e) => setSearch(e.target.value)} 
      />
      <select onChange={(e) => setCategory(e.target.value)} className="mb-4 border p-2">
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered?.map((product) => (
          <div key={product.id} className="border p-4 rounded shadow">
            <h2 className="font-bold">{product.nombre}</h2>
            <p>${product.precio_base}</p>
            <Link to={`/product/${product.id}`} className="text-blue-500">Ver detalle</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
