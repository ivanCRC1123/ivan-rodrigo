import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductsPage from "./features/products/pages/ProductsPage";
import CartPage from "./features/products/pages/CartPage";
import ProductDetailPage from "./features/products/pages/ProductDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
