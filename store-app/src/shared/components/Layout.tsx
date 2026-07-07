import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 antialiased">
      <Navbar />

      {/* Espaciador para barra de navegación fija*/}
      <div className="h-16" />

      {/* ========== main contenido ========== */}
      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
