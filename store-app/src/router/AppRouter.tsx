import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductsPage from "../features/products/pages/ProductsPage";
import CartPage from "../features/products/pages/CartPage";
import ProductDetailPage from "../features/products/pages/ProductDetailPage";
import CheckoutPage from "../features/orders/pages/CheckoutPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  );
};
