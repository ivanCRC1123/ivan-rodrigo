# Store App - Documentación Técnica

## 1. Arquitectura
Se ha implementado una arquitectura modular escalable basada en **Domain-Driven Design (DDD)** simplificado.

- `features/`: Lógica de negocio dividida por dominios (`products`, `orders`).
- `shared/`: Recursos globales (API client, componentes UI genéricos).
- `store/`: Estado global de la aplicación (Zustand).
- `router/`: Centralización de la configuración de rutas.

## 2. Tecnologías
- **Core**: React 19, TypeScript.
- **Estado**: Zustand (con `persist` middleware para `localStorage`).
- **Asincronía**: TanStack Query (Query & Mutation).
- **API**: Axios con interceptors centralizados.
- **Estilos**: Tailwind CSS 4.
- **Routing**: React Router 7.

## 3. Estructura de carpetas
```text
src/
  features/
    products/
      components/
      hooks/
      pages/
      services/
      types.ts
    orders/
      ... (misma estructura)
  shared/
    apiClient.ts
  store/
    useCartStore.ts
  router/
    AppRouter.tsx
```

## 4. Flujo de la App
1. **Home**: Catálogo de productos desde `/products` (TanStack Query).
2. **Detalle**: `/product/:id` carga detalles y permite añadir al carrito.
3. **Carrito**: `/cart` gestión de cantidades y persistencia local.
4. **Checkout**: `/checkout` envía el pedido vía POST a `/orders` y limpia el carrito tras el éxito.

## 5. Endpoints Consumidos
- `GET /products`: Listado.
- `GET /products/:id`: Detalle.
- `POST /orders`: Crear pedido.

## 6. Instrucciones
### Instalación
```bash
npm install
```

### Ejecución
```bash
npm run dev
```

### Variables de entorno
Configurar `VITE_API_BASE_URL` en un archivo `.env` si es necesario (el valor por defecto es `http://localhost:8000`).
