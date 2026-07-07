export interface SidebarLink {
  to: string;
  label: string;
  roles: string[];
}

export interface SidebarSection {
  title: string;
  icon: string;
  links: SidebarLink[];
}

export const sidebarSections: SidebarSection[] = [
  {
    title: "General",
    icon: "layout-dashboard",
    links: [{ to: "/dashboard", label: "Dashboard", roles: ["ADMIN", "STOCK", "PEDIDOS"] }],
  },
  {
    title: "Inventario",
    icon: "package",
    links: [
      { to: "/productos", label: "Productos", roles: ["ADMIN", "STOCK"] },
      { to: "/categorias", label: "Categorías", roles: ["ADMIN", "STOCK"] },
      { to: "/ingredientes", label: "Ingredientes", roles: ["ADMIN", "STOCK"] },
      { to: "/unidades-medida", label: "Unidades", roles: ["ADMIN", "STOCK"] },
    ],
  },
  {
    title: "Administración",
    icon: "users",
    links: [
      { to: "/usuarios", label: "Usuarios", roles: ["ADMIN"] },
      { to: "/pedidos", label: "Pedidos", roles: ["ADMIN", "PEDIDOS"] },
    ],
  },
];

export const sidebarLinks: SidebarLink[] = sidebarSections.flatMap((s) => s.links);

export const routeRoles: Record<string, string[]> = Object.fromEntries(
  sidebarLinks.map(({ to, roles }) => [to, roles])
);
