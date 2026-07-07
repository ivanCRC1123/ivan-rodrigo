# MiTiendita — Store App

Frontend de e-commerce para la gestión de productos, pedidos y autenticación de clientes. Consume una API REST construida con FastAPI (Python).

---

## Tech Stack

| Capa Tecnología
| **Framework** React 19
| **Lenguaje** TypeScript 6
| **Build** Vite 8
| **Routing** React Router DOM 7
| **Estado global** Zustand 5 (persistencia en localStorage)
| **HTTP / API** Axios 1 (interceptors: JWT + 401 redirect)
| **Server cache** TanStack React Query 5
| **Estilos** Tailwind CSS v4
| **Linting** ESLint 10 + typescript-eslint

---

## Instalacion

# 1. Clonar el repositorio

git clone <repo-url>
cd store-app

# 2. Instalar dependencias

npm install

# 3. Iniciar servidor de desarrollo (HMR en http://localhost:5173)

npm run dev

> **Requisito:** El backend debe estar corriendo en `http://localhost:8000`. Consulta la documentación del backend para su configuración.

## Arquitectura

El proyecto sigue una organización **feature-based** (por dominio), con una capa `shared` para código reutilizable.

```
src/
├── main.tsx                 # Entra point de la aplicación
├── index.css                # Entra point de Tailwind CSS
│
├── router/                  # Enrutamiento
│   ├── AppRouter.tsx         #   Definición de rutas públicas y protegidas
│   └── ProtectedRoute.tsx    #   Guardado de autenticación (RequireAuth)
│
├── store/                   # Estado global (Zustand + persist)
│   ├── useCartStore.ts       #   Carrito de compras
│   └── useAuthStore.ts       #   Autenticación (login, register, logout)
│
├── shared/                  # Código compartido entre features
│   ├── components/           #   Layout, Navbar, Footer
│   ├── ui/                  #   Componentes atómicos (Button, Input, Alert, Spinner…)
│   ├── services/            #   apiClient (Axios), queryClient (React Query), apiError
│   └── types/               #   Tipos compartidos (auth, common)
│
└── features/                # Módulos por dominio
    ├── products/             #   Productos — páginas, componentes, servicios, tipos
    ├── orders/               #   Pedidos — checkout, historial, servicios, tipos
    ├── auth/                 #   Autenticación — login, registro
    ├── addresses/            #   Direcciones de envío — CRUD, selector
    ├── categories/           #   Categorías de productos (tipos)
    └── ingredients/          #   Ingredientes personalizables (tipos)
```

## Mapa de rutas

| Ruta           | Página                | Protegida |
| -------------- | --------------------- | --------- |
| `/`            | Catálogo de productos | NO        |
| `/cart`        | Carrito de compras    | NO        |
| `/product/:id` | Detalle de producto   | NO        |
| `/login`       | Inicio de sesión      | NO        |
| `/register`    | Registro de usuario   | NO        |
| `/checkout`    | Finalizar compra      | YES       |
| `/mis-pedidos` | Historial de pedidos  | YES       |

---

## API

Endpoint base: `http://localhost:8000`

### Interceptores

1. **Request**: agrega automáticamente el header `Authorization: Bearer <token>` desde la store persistida.
2. **Response**: si recibe un `401`, limpia la sesión y redirige a `/login` (a menos que ya esté allí).

---

## 🔗 Video de presentación parcial 1

👉 [Ver video acá](https://youtu.be/p2klSAbQZUI)

## 🔗 Video de presentación parcial 2

👉 [Ver video acá](https://youtu.be/lu2nIAksql0)
