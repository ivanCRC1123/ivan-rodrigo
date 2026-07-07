export function Footer() {
  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-900/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-zinc-600">
          &copy; {new Date().getFullYear()} MiTiendita. Todos los derechos
          reservados.
        </p>
        <div className="flex gap-6 text-sm text-zinc-600">
          <span className="transition hover:text-zinc-400">Términos</span>
          <span className="transition hover:text-zinc-400">Privacidad</span>
          <span className="transition hover:text-zinc-400">Ayuda</span>
        </div>
      </div>
    </footer>
  );
}
