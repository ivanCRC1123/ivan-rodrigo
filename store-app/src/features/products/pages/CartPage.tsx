import { useCartStore } from "../../../store/useCartStore";
import { Link } from "react-router-dom";

export default function CartPage() {
  const { items, removeItem } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Carrito</h1>
      {items.length === 0 ? <p>Carrito vacío</p> : (
        <>
          {items.map(item => (
            <div key={item.id} className="flex justify-between border-b p-2">
              <span>{item.name} x {item.quantity}</span>
              <span>${item.price * item.quantity}</span>
              <button onClick={() => removeItem(item.id)} className="text-red-500">Eliminar</button>
            </div>
          ))}
          <div className="mt-4 font-bold text-xl mb-4">Total: ${total}</div>
          <Link to="/checkout" className="p-2 bg-blue-500 text-white rounded">Ir a Checkout</Link>
        </>
      )}
    </div>
  );
}
