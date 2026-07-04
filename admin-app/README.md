# MiTiendita Admin App

Panel de administración para la tienda MiTiendita. Construido con **React 19**, **TypeScript**, **Vite** y **Tailwind CSS 4**.

---

## Stack Tecnológico

[React]
[TypeScript]
[Vite]
[Tailwind CSS]
[React Router]
[TanStack React Query]
[Zustand]
[Axios]
[ESLint]

---

## Estructura del Proyecto

```
admin-app/
├── index.html                    # Entry point HTML
├── vite.config.ts                # Configuración de Vite
├── tsconfig.json                 # Configuración de TypeScript
├── package.json
│
└── src/
    ├── main.tsx                  # Punto de entrada React
    ├── App.tsx                   # Componente raíz
    ├── index.css                 # Estilos globales (Tailwind)
    │
    ├── assets/                   # Recursos estáticos (imágenes, SVGs)
    │
    ├── features/                 # Módulos organizados por feature
    │   ├── auth/                 # Autenticación
    │   │   ├── pages/            #   LoginPage, RegisterPage
    │   │   ├── services/         #   auth.ts (API calls)
    │   │   ├── store/            #   authStore.ts (Zustand)
    │   │   └── types/            #   Interfaces de usuario/auth
    │   │
    │   ├── categories/           # Gestión de categorías
    │   │   ├── pages/            #   CategoriesPage
    │   │   ├── components/       #   CategoryTable, FormModal, Search
    │   │   ├── hooks/            #   useCategories (queries + mutations)
    │   │   ├── api/              #   categoria.api.ts
    │   │   └── types/            #   CategoriaRead, CategoriaCreate, etc.
    │   │
    │   ├── dashboard/            # Dashboard de métricas
    │   │   ├── pages/            #   DashboardPage
    │   │   └── types/            #   DashboardMetrics
    │   │
    │   ├── ingredients/          # Gestión de ingredientes
    │   │   ├── pages/            #   IngredientsPage
    │   │   ├── components/       #   Tabla, FormModal
    │   │   ├── hooks/            #   useIngredients
    │   │   ├── services/         #   ingrediente.ts
    │   │   └── types/            #   Ingrediente interfaces
    │   │
    │   ├── orders/               # Gestión de pedidos
    │   │   ├── pages/            #   PedidosPage
    │   │   ├── services/         #   pedido.ts (API calls)
    │   │   └── types/            #   Pedido, EstadoPedido interfaces
    │   │
    │   ├── products/             # Gestión de productos
    │   │   ├── pages/            #   ProductsPage, ProductDetailPage
    │   │   ├── components/       #   ProductTable, FormModal, etc.
    │   │   ├── hooks/            #   useProducts
    │   │   ├── services/         #   producto.ts
    │   │   └── types/            #   Producto interfaces
    │   │
    │   └── usuario/              # Administración de usuarios (ADMIN)
    │       ├── pages/            #   UsersPage
    │       ├── hooks/            #   useUsers
    │       ├── services/         #   users.ts
    │       └── types/            #   UserAdminUpdate
    │
    ├── router/                   # Enrutamiento
    │   ├── AppRouter.tsx         #   Definición de rutas
    │   ├── ProtectedRoute.tsx    #   Guard de autenticación + roles
    │   └── routes.config.ts      #   Configuración de sidebar + roles
    │
    └── shared/                   # Componentes y utilidades compartidas
        ├── components/           #   AdminLayout, Modal
        ├── ui/                   #   InputField, AlertError, Badge
        └── services/             #   api.ts (Axios instance + interceptors)
```

---

## Rutas

| Ruta             | Página              | Roles permitidos      |
| ---------------- | ------------------- | --------------------- |
| `/login`         | Login               | Público               |
| `/register`      | Registro            | Público               |
| `/dashboard`     | Dashboard           | ADMIN, STOCK, PEDIDOS |
| `/productos`     | Lista de productos  | ADMIN, STOCK          |
| `/productos/:id` | Detalle de producto | ADMIN, STOCK          |
| `/categorias`    | Categorías          | ADMIN, STOCK          |
| `/ingredientes`  | Ingredientes        | ADMIN, STOCK          |
| `/usuarios`      | Usuarios            | ADMIN                 |
| `/pedidos`       | Pedidos             | ADMIN, PEDIDOS        |

---

## Roles del Sistema

| Rol         | Acceso                                                                  |
| ----------- | ----------------------------------------------------------------------- |
| **ADMIN**   | Todas las secciones. Crear, editar, eliminar.                           |
| **STOCK**   | Productos, categorías, ingredientes (solo lectura en ciertas acciones). |
| **PEDIDOS** | Dashboard, pedidos.                                                     |
| **CLIENT**  | Sin acceso al panel admin (reservado para frontend público).            |

---

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (puerto 5174)
npm run dev

# Build de producción
npm run build

# Linting
npm run lint
```

---

### Autenticación

Flujo JWT con interceptores de Axios:

1. Login → recibe `access_token` → se guarda en Zustand (persist en localStorage).
2. Cada request lleva `Authorization: Bearer <token>` (interceptor).
3. Si el servidor responde 401 → se limpia el store y redirige a `/login`.

---

## 🔗 Video de presentación parcial 1

👉 [Ver video acá](https://youtu.be/p2klSAbQZUI)

## 🔗 Video de presentación parcial 2

👉 [Ver video acá](https://youtu.be/lu2nIAksql0)

---
