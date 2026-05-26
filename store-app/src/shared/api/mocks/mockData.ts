import type {
  User,
  UserRole,
  Ingrediente,
  Categoria,
  CategoriaTreeNode,
  Producto,
  ProductoIngrediente,
  EstadoPedido,
  EstadoPedidoCodigo,
  Pedido,
  DetallePedido,
  HistorialEstado,
  Pago,
  FormaPago,
  DireccionEntrega,
  DashboardMetrics,
} from '../types';

// ============================================
// DATOS MOCKEADOS REALISTAS
// ============================================

// --- Helper: generate dates ---
const pastDate = (daysAgo: number, hours = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
};

const now = () => new Date().toISOString();

// ============================================
// ROLES Y ESTADOS (Catálogos)
// ============================================

export const ROLES: { codigo: UserRole; nombre: string; descripcion: string }[] = [
  { codigo: 'ADMIN', nombre: 'Administrador', descripcion: 'Acceso total al sistema' },
  { codigo: 'STOCK', nombre: 'Gestor de Stock', descripcion: 'Gestiona inventario y productos' },
  { codigo: 'PEDIDOS', nombre: 'Gestor de Pedidos', descripcion: 'Gestiona ciclo de vida de pedidos' },
  { codigo: 'CLIENT', nombre: 'Cliente', descripcion: 'Usuario final de la tienda' },
];

export const ESTADOS_PEDIDO: EstadoPedido[] = [
  { codigo: 'PENDIENTE', nombre: 'Pendiente', descripcion: 'Pedido creado, pago pendiente', orden: 1, es_terminal: false },
  { codigo: 'CONFIRMADO', nombre: 'Confirmado', descripcion: 'Pago aprobado, listo para preparar', orden: 2, es_terminal: false },
  { codigo: 'EN_PREPARACION', nombre: 'En Preparación', descripcion: 'En cocina siendo preparado', orden: 3, es_terminal: false },
  { codigo: 'EN_CAMINO', nombre: 'En Camino', descripcion: 'Despachado hacia el cliente', orden: 4, es_terminal: false },
  { codigo: 'ENTREGADO', nombre: 'Entregado', descripcion: 'Entregado exitosamente', orden: 5, es_terminal: true },
  { codigo: 'CANCELADO', nombre: 'Cancelado', descripcion: 'Pedido cancelado', orden: 6, es_terminal: true },
];

export const FORMAS_PAGO: FormaPago[] = [
  { codigo: 'MERCADOPAGO', nombre: 'MercadoPago', habilitado: true },
  { codigo: 'EFECTIVO', nombre: 'Efectivo al recibir', habilitado: true },
  { codigo: 'TRANSFERENCIA', nombre: 'Transferencia Bancaria', habilitado: true },
];

// ============================================
// USUARIOS
// ============================================

export const MOCK_USERS: User[] = [
  {
    id: 1,
    nombre: 'Admin',
    apellido: 'FoodStore',
    email: 'admin@foodstore.com',
    telefono: '1155550001',
    roles: ['ADMIN'],
    created_at: pastDate(30),
    updated_at: pastDate(5),
  },
  {
    id: 2,
    nombre: 'Stock',
    apellido: 'Manager',
    email: 'stock@foodstore.com',
    telefono: '1155550002',
    roles: ['STOCK'],
    created_at: pastDate(25),
    updated_at: pastDate(3),
  },
  {
    id: 3,
    nombre: 'Pedidos',
    apellido: 'Gestion',
    email: 'pedidos@foodstore.com',
    telefono: '1155550003',
    roles: ['PEDIDOS'],
    created_at: pastDate(20),
    updated_at: pastDate(2),
  },
  {
    id: 4,
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@example.com',
    telefono: '1155551234',
    roles: ['CLIENT'],
    created_at: pastDate(15),
    updated_at: pastDate(1),
  },
  {
    id: 5,
    nombre: 'María',
    apellido: 'Gómez',
    email: 'maria.gomez@example.com',
    telefono: '1155555678',
    roles: ['CLIENT'],
    created_at: pastDate(10),
    updated_at: now(),
  },
];

// ============================================
// DIRECCIONES
// ============================================

export const MOCK_DIRECCIONES: DireccionEntrega[] = [
  {
    id: 1,
    usuario_id: 4,
    alias: 'Casa',
    linea1: 'Av. Rivadavia 1234, Piso 3, Dpto B',
    ciudad: 'CABA',
    codigo_postal: '1002',
    referencia: 'Entre calles: Callao y Bartolomé Mitre',
    es_principal: true,
    created_at: pastDate(14),
    updated_at: pastDate(14),
  },
  {
    id: 2,
    usuario_id: 4,
    alias: 'Trabajo',
    linea1: 'Av. Corrientes 5678, Piso 10',
    ciudad: 'CABA',
    codigo_postal: '1043',
    referencia: 'Edificio América, Oficina 1002',
    es_principal: false,
    created_at: pastDate(10),
    updated_at: pastDate(10),
  },
  {
    id: 3,
    usuario_id: 5,
    alias: 'Mi Casa',
    linea1: 'Calle San Martín 890',
    ciudad: 'Caballito',
    codigo_postal: '1405',
    referencia: 'Lateral derecho, puerta negra',
    es_principal: true,
    created_at: pastDate(9),
    updated_at: pastDate(9),
  },
];

// ============================================
// INGREDIENTES (con alérgenos)
// ============================================

export const MOCK_INGREDIENTES: Ingrediente[] = [
  { id: 1, nombre: 'Harina de trigo', descripcion: 'Harina 000 para pizza', es_alergeno: true, created_at: pastDate(60), updated_at: pastDate(60) },
  { id: 2, nombre: 'Queso mozzarella', descripcion: 'Mozzarella fresca', es_alergeno: true, created_at: pastDate(60), updated_at: pastDate(60) },
  { id: 3, nombre: 'Salsa de tomate', descripcion: 'Salsa de tomate natural', es_alergeno: false, created_at: pastDate(60), updated_at: pastDate(60) },
  { id: 4, nombre: 'Aceitunas negras', descripcion: 'Aceitunas sin carozo', es_alergeno: false, created_at: pastDate(55), updated_at: pastDate(55) },
  { id: 5, nombre: 'Jamon cocido', descripcion: 'Jamón cocido premium', es_alergeno: false, created_at: pastDate(55), updated_at: pastDate(55) },
  { id: 6, nombre: 'Champiñones', descripcion: 'Champiñones frescos laminados', es_alergeno: false, created_at: pastDate(55), updated_at: pastDate(55) },
  { id: 7, nombre: 'Carne de hamburguesa', descripcion: 'Medallón 180g de carne vacuna', es_alergeno: false, created_at: pastDate(50), updated_at: pastDate(50) },
  { id: 8, nombre: 'Lechuga', descripcion: 'Lechuga fresca en hojas', es_alergeno: false, created_at: pastDate(50), updated_at: pastDate(50) },
  { id: 9, nombre: 'Tomate', descripcion: 'Rodajas de tomate fresco', es_alergeno: false, created_at: pastDate(50), updated_at: pastDate(50) },
  { id: 10, nombre: 'Cebolla', descripcion: 'Cebolla en rodajas', es_alergeno: false, created_at: pastDate(50), updated_at: pastDate(50) },
  { id: 11, nombre: 'Pan de hamburguesa', descripcion: 'Pan de papa con semillas de sésamo', es_alergeno: true, created_at: pastDate(45), updated_at: pastDate(45) },
  { id: 12, nombre: 'Queso cheddar', descripcion: 'Queso cheddar laminado', es_alergeno: true, created_at: pastDate(45), updated_at: pastDate(45) },
  { id: 13, nombre: 'Huevo', descripcion: 'Huevo frito o revuelto', es_alergeno: true, created_at: pastDate(40), updated_at: pastDate(40) },
  { id: 14, nombre: 'Papas fritas', descripcion: 'Papas prefritas congeladas', es_alergeno: false, created_at: pastDate(40), updated_at: pastDate(40) },
  { id: 15, nombre: 'Coca-Cola', descripcion: 'Coca-Cola 500ml', es_alergeno: false, created_at: pastDate(35), updated_at: pastDate(35) },
  { id: 16, nombre: 'Agua mineral', descripcion: 'Agua sin gas 500ml', es_alergeno: false, created_at: pastDate(35), updated_at: pastDate(35) },
  { id: 17, nombre: 'Helado de vainilla', descripcion: 'Helado cremoso de vainilla', es_alergeno: true, created_at: pastDate(30), updated_at: pastDate(30) },
  { id: 18, nombre: 'Chocolate', descripcion: 'Cobertura de chocolate amargo', es_alergeno: true, created_at: pastDate(30), updated_at: pastDate(30) },
  { id: 19, nombre: 'Dulce de leche', descripcion: 'Dulce de leche tradicional', es_alergeno: true, created_at: pastDate(30), updated_at: pastDate(30) },
  { id: 20, nombre: 'Masa de empanada', descripcion: 'Masa de empanada argentina', es_alergeno: true, created_at: pastDate(25), updated_at: pastDate(25) },
];

// ============================================
// CATEGORÍAS (Jerárquicas)
// ============================================

export const MOCK_CATEGORIAS: Categoria[] = [
  // Nivel 0 (Raíz)
  { id: 1, nombre: 'Comidas', descripcion: 'Platos principales', imagen_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300', parent_id: null, created_at: pastDate(60), updated_at: pastDate(60) },
  { id: 2, nombre: 'Bebidas', descripcion: 'Bebidas frías y calientes', imagen_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300', parent_id: null, created_at: pastDate(60), updated_at: pastDate(60) },
  { id: 3, nombre: 'Postres', descripcion: 'Dulces y postres', imagen_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300', parent_id: null, created_at: pastDate(60), updated_at: pastDate(60) },
  
  // Nivel 1 (Hijos de Comidas)
  { id: 4, nombre: 'Pizzas', descripcion: 'Pizzas artesanales', imagen_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300', parent_id: 1, created_at: pastDate(55), updated_at: pastDate(55) },
  { id: 5, nombre: 'Hamburguesas', descripcion: 'Hamburguesas premium', imagen_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300', parent_id: 1, created_at: pastDate(55), updated_at: pastDate(55) },
  { id: 6, nombre: 'Empanadas', descripcion: 'Empanadas argentinas', imagen_url: 'https://images.unsplash.com/photo-1629157190517-cf3b1abac143?w=300', parent_id: 1, created_at: pastDate(55), updated_at: pastDate(55) },
  
  // Nivel 2 (Hijos de Pizzas)
  { id: 7, nombre: 'Pizzas Tradicionales', descripcion: 'Recetas clásicas', imagen_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300', parent_id: 4, created_at: pastDate(50), updated_at: pastDate(50) },
  { id: 8, nombre: 'Pizzas Especiales', descripcion: 'Creaciones de la casa', imagen_url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=300', parent_id: 4, created_at: pastDate(50), updated_at: pastDate(50) },
];

// ============================================
// PRODUCTOS
// ============================================

// Helper: relaciones producto-ingrediente
const createPI = (producto_id: number, ingrediente_id: number, es_removible = true): ProductoIngrediente => ({
  producto_id,
  ingrediente_id,
  es_removible,
  ingrediente: MOCK_INGREDIENTES.find(i => i.id === ingrediente_id),
});

export const MOCK_PRODUCTOS: Producto[] = [
  // --- Pizzas Tradicionales ---
  {
    id: 1,
    nombre: 'Pizza Muzzarella',
    descripcion: 'Pizza clásica con salsa de tomate, mozzarella y orégano.',
    precio_base: 8500.00,
    imagenes_url: [
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
    ],
    stock_cantidad: 50,
    disponible: true,
    categorias: [MOCK_CATEGORIAS[0], MOCK_CATEGORIAS[3], MOCK_CATEGORIAS[6]],
    ingredientes: [createPI(1, 1, false), createPI(1, 2), createPI(1, 3, false)],
    created_at: pastDate(60),
    updated_at: pastDate(5),
  },
  {
    id: 2,
    nombre: 'Pizza Napolitana',
    descripcion: 'Pizza con tomate, mozzarella, ajo y albahaca fresca.',
    precio_base: 9200.00,
    imagenes_url: ['https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600'],
    stock_cantidad: 45,
    disponible: true,
    categorias: [MOCK_CATEGORIAS[0], MOCK_CATEGORIAS[3], MOCK_CATEGORIAS[6]],
    ingredientes: [createPI(2, 1, false), createPI(2, 2), createPI(2, 3, false)],
    created_at: pastDate(58),
    updated_at: pastDate(3),
  },
  {
    id: 3,
    nombre: 'Pizza Jamón y Morrón',
    descripcion: 'Pizza con jamón cocido, morrones asados y mozzarella.',
    precio_base: 9800.00,
    imagenes_url: ['https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600'],
    stock_cantidad: 40,
    disponible: true,
    categorias: [MOCK_CATEGORIAS[0], MOCK_CATEGORIAS[3], MOCK_CATEGORIAS[7]],
    ingredientes: [createPI(3, 1, false), createPI(3, 2), createPI(3, 3, false), createPI(3, 5)],
    created_at: pastDate(55),
    updated_at: pastDate(2),
  },
  {
    id: 4,
    nombre: 'Pizza Fugazza',
    descripcion: 'Pizza de cebolla caramelizada con mozzarella.',
    precio_base: 8900.00,
    imagenes_url: ['https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=600'],
    stock_cantidad: 35,
    disponible: true,
    categorias: [MOCK_CATEGORIAS[0], MOCK_CATEGORIAS[3], MOCK_CATEGORIAS[7]],
    ingredientes: [createPI(4, 1, false), createPI(4, 2), createPI(4, 10)],
    created_at: pastDate(52),
    updated_at: pastDate(1),
  },
  
  // --- Hamburguesas ---
  {
    id: 5,
    nombre: 'Hamburguesa Clásica',
    descripcion: 'Medallón de carne de 180g, queso cheddar, lechuga, tomate y cebolla en pan de papa.',
    precio_base: 7500.00,
    imagenes_url: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600',
    ],
    stock_cantidad: 60,
    disponible: true,
    categorias: [MOCK_CATEGORIAS[0], MOCK_CATEGORIAS[4]],
    ingredientes: [
      createPI(5, 7, false), createPI(5, 11, false), 
      createPI(5, 12), createPI(5, 8), createPI(5, 9), createPI(5, 10)
    ],
    created_at: pastDate(50),
    updated_at: pastDate(1),
  },
  {
    id: 6,
    nombre: 'Hamburguesa Doble',
    descripcion: 'Doble medallón de carne, doble queso cheddar, panceta y salsa especial.',
    precio_base: 10500.00,
    imagenes_url: ['https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600'],
    stock_cantidad: 40,
    disponible: true,
    categorias: [MOCK_CATEGORIAS[0], MOCK_CATEGORIAS[4]],
    ingredientes: [
      createPI(6, 7, false), createPI(6, 11, false), 
      createPI(6, 12), createPI(6, 8)
    ],
    created_at: pastDate(48),
    updated_at: now(),
  },
  {
    id: 7,
    nombre: 'Hamburguesa Vegetariana',
    descripcion: 'Medallón de lentejas y quinoa con queso, lechuga, tomate y guacamole.',
    precio_base: 8200.00,
    imagenes_url: ['https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600'],
    stock_cantidad: 25,
    disponible: true,
    categorias: [MOCK_CATEGORIAS[0], MOCK_CATEGORIAS[4]],
    ingredientes: [createPI(7, 11, false), createPI(7, 2), createPI(7, 8), createPI(7, 9)],
    created_at: pastDate(45),
    updated_at: now(),
  },
  
  // --- Empanadas ---
  {
    id: 8,
    nombre: 'Docena de Empanadas de Carne',
    descripcion: '12 empanadas de carne cortada a cuchillo con cebolla, pimentón y aceitunas.',
    precio_base: 12000.00,
    imagenes_url: ['https://images.unsplash.com/photo-1629157190517-cf3b1abac143?w=600'],
    stock_cantidad: 80,
    disponible: true,
    categorias: [MOCK_CATEGORIAS[0], MOCK_CATEGORIAS[5]],
    ingredientes: [createPI(8, 20, false), createPI(8, 4)],
    created_at: pastDate(42),
    updated_at: pastDate(1),
  },
  {
    id: 9,
    nombre: 'Docena de Empanadas de Jamón y Queso',
    descripcion: '12 empanadas rellenas de jamón cocido y mozzarella.',
    precio_base: 11500.00,
    imagenes_url: ['https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600'],
    stock_cantidad: 60,
    disponible: true,
    categorias: [MOCK_CATEGORIAS[0], MOCK_CATEGORIAS[5]],
    ingredientes: [createPI(9, 20, false), createPI(9, 5), createPI(9, 2)],
    created_at: pastDate(40),
    updated_at: pastDate(2),
  },
  
  // --- Bebidas ---
  {
    id: 10,
    nombre: 'Coca-Cola 500ml',
    descripcion: 'Gaseosa Coca-Cola en botella de 500ml.',
    precio_base: 1800.00,
    imagenes_url: ['https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600'],
    stock_cantidad: 200,
    disponible: true,
    categorias: [MOCK_CATEGORIAS[1]],
    ingredientes: [createPI(10, 15, false)],
    created_at: pastDate(35),
    updated_at: pastDate(1),
  },
  {
    id: 11,
    nombre: 'Agua Mineral Sin Gas 500ml',
    descripcion: 'Agua mineral natural sin gas.',
    precio_base: 1200.00,
    imagenes_url: ['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600'],
    stock_cantidad: 150,
    disponible: true,
    categorias: [MOCK_CATEGORIAS[1]],
    ingredientes: [createPI(11, 16, false)],
    created_at: pastDate(35),
    updated_at: pastDate(1),
  },
  
  // --- Postres ---
  {
    id: 12,
    nombre: 'Helado de Vainilla con DDL',
    descripcion: 'Dos bochas de helado de vainilla con dulce de leche y cobertura de chocolate.',
    precio_base: 4500.00,
    imagenes_url: ['https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600'],
    stock_cantidad: 50,
    disponible: true,
    categorias: [MOCK_CATEGORIAS[2]],
    ingredientes: [createPI(12, 17, false), createPI(12, 19), createPI(12, 18)],
    created_at: pastDate(30),
    updated_at: now(),
  },
  {
    id: 13,
    nombre: 'Flan Casero',
    descripcion: 'Flan casero con caramelo, crema batida y frutas de estación.',
    precio_base: 3800.00,
    imagenes_url: ['https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=600'],
    stock_cantidad: 30,
    disponible: true,
    categorias: [MOCK_CATEGORIAS[2]],
    ingredientes: [createPI(13, 13, false)],
    created_at: pastDate(28),
    updated_at: now(),
  },
  {
    id: 14,
    nombre: 'Papas Fritas Grandes',
    descripcion: 'Porción abundante de papas fritas crujientes con sal fina.',
    precio_base: 3200.00,
    imagenes_url: ['https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600'],
    stock_cantidad: 100,
    disponible: true,
    categorias: [MOCK_CATEGORIAS[0]],
    ingredientes: [createPI(14, 14, false)],
    created_at: pastDate(25),
    updated_at: pastDate(1),
  },
];

// ============================================
// PEDIDOS
// ============================================

// Detalles de pedido (snapshots)
const createDetalle = (
  id: number, 
  pedido_id: number, 
  producto_id: number, 
  cantidad: number, 
  personalizacion: number[] = []
): DetallePedido => {
  const prod = MOCK_PRODUCTOS.find(p => p.id === producto_id);
  return {
    id,
    pedido_id,
    producto_id,
    nombre_snapshot: prod?.nombre || `Producto #${producto_id}`,
    precio_snapshot: prod?.precio_base || 0,
    cantidad,
    personalizacion,
    ingredientes_removidos: personalizacion.map(
      ingId => MOCK_INGREDIENTES.find(i => i.id === ingId)?.nombre || `Ingrediente #${ingId}`
    ),
  };
};

const createHistorial = (
  id: number, 
  pedido_id: number, 
  estado_hasta: EstadoPedidoCodigo, 
  estado_desde: EstadoPedidoCodigo | null,
  usuario_id: number | null,
  horasAgo: number = 0,
  motivo?: string
): HistorialEstado => ({
  id,
  pedido_id,
  estado_desde,
  estado_hasta,
  usuario_id,
  motivo,
  created_at: pastDate(0, horasAgo),
});

export const MOCK_PEDIDOS: Pedido[] = [
  {
    id: 1,
    usuario_id: 4,
    estado_codigo: 'ENTREGADO',
    forma_pago_codigo: 'MERCADOPAGO',
    direccion_id: 1,
    subtotal: 16000,
    costo_envio: 500,
    descuento: 0,
    total: 16500,
    notas: 'Sin aceitunas por favor',
    created_at: pastDate(5, 2),
    updated_at: pastDate(5, 1),
  },
  {
    id: 2,
    usuario_id: 4,
    estado_codigo: 'EN_CAMINO',
    forma_pago_codigo: 'MERCADOPAGO',
    direccion_id: 1,
    subtotal: 17800,
    costo_envio: 500,
    descuento: 0,
    total: 18300,
    notas: 'Hamburguesa sin cebolla',
    created_at: pastDate(0, 3),
    updated_at: pastDate(0, 1),
  },
  {
    id: 3,
    usuario_id: 5,
    estado_codigo: 'EN_PREPARACION',
    forma_pago_codigo: 'MERCADOPAGO',
    direccion_id: 3,
    subtotal: 24000,
    costo_envio: 500,
    descuento: 0,
    total: 24500,
    created_at: pastDate(0, 2),
    updated_at: pastDate(0, 1),
  },
  {
    id: 4,
    usuario_id: 5,
    estado_codigo: 'CONFIRMADO',
    forma_pago_codigo: 'EFECTIVO',
    direccion_id: 3,
    subtotal: 7500,
    costo_envio: 500,
    descuento: 0,
    total: 8000,
    notas: 'Retirar en local',
    created_at: pastDate(0, 1),
    updated_at: pastDate(0, 0.5),
  },
  {
    id: 5,
    usuario_id: 4,
    estado_codigo: 'PENDIENTE',
    forma_pago_codigo: 'MERCADOPAGO',
    direccion_id: 2,
    subtotal: 9800,
    costo_envio: 500,
    descuento: 0,
    total: 10300,
    created_at: pastDate(0, 0.2),
    updated_at: pastDate(0, 0.2),
  },
  {
    id: 6,
    usuario_id: 5,
    estado_codigo: 'CANCELADO',
    forma_pago_codigo: 'MERCADOPAGO',
    direccion_id: 3,
    subtotal: 15000,
    costo_envio: 500,
    descuento: 0,
    total: 15500,
    notas: '',
    created_at: pastDate(3, 4),
    updated_at: pastDate(3, 3),
  },
];

export const MOCK_DETALLES_PEDIDO: DetallePedido[] = [
  // Pedido 1 - ENTREGADO
  createDetalle(1, 1, 1, 1),  // Pizza Muzzarella x1
  createDetalle(2, 1, 5, 1),  // Hamburguesa Clásica x1
  createDetalle(3, 1, 10, 2), // Coca x2
  
  // Pedido 2 - EN_CAMINO
  createDetalle(4, 2, 5, 1, [10]),  // Hamburguesa sin cebolla
  createDetalle(5, 2, 14, 1),  // Papas fritas
  createDetalle(6, 2, 10, 1),  // Coca
  createDetalle(7, 2, 12, 1),  // Helado
  
  // Pedido 3 - EN_PREP
  createDetalle(8, 3, 8, 1),   // Docena carne
  createDetalle(9, 3, 9, 1),   // Docena jamón y queso
  createDetalle(10, 3, 10, 4), // Coca x4
  
  // Pedido 4 - CONFIRMADO
  createDetalle(11, 4, 5, 1),  // Hamburguesa
  
  // Pedido 5 - PENDIENTE
  createDetalle(12, 5, 3, 1),  // Pizza Jamón y Morrón
  
  // Pedido 6 - CANCELADO
  createDetalle(13, 6, 1, 1),
  createDetalle(14, 6, 5, 1),
];

export const MOCK_HISTORIAL_PEDIDOS: HistorialEstado[] = [
  // Pedido 1 - completo
  createHistorial(1, 1, 'PENDIENTE', null, 4, 120),
  createHistorial(2, 1, 'CONFIRMADO', 'PENDIENTE', null, 118, 'Pago aprobado MercadoPago'),
  createHistorial(3, 1, 'EN_PREPARACION', 'CONFIRMADO', 3, 110),
  createHistorial(4, 1, 'EN_CAMINO', 'EN_PREPARACION', 3, 60),
  createHistorial(5, 1, 'ENTREGADO', 'EN_CAMINO', 3, 2),
  
  // Pedido 2 - en camino
  createHistorial(6, 2, 'PENDIENTE', null, 4, 180),
  createHistorial(7, 2, 'CONFIRMADO', 'PENDIENTE', null, 178, 'Pago aprobado'),
  createHistorial(8, 2, 'EN_PREPARACION', 'CONFIRMADO', 3, 120),
  createHistorial(9, 2, 'EN_CAMINO', 'EN_PREPARACION', 3, 60),
  
  // Pedido 3 - en preparación
  createHistorial(10, 3, 'PENDIENTE', null, 5, 120),
  createHistorial(11, 3, 'CONFIRMADO', 'PENDIENTE', null, 118, 'Pago aprobado'),
  createHistorial(12, 3, 'EN_PREPARACION', 'CONFIRMADO', 3, 60),
  
  // Pedido 4 - confirmado
  createHistorial(13, 4, 'PENDIENTE', null, 5, 60),
  createHistorial(14, 4, 'CONFIRMADO', 'PENDIENTE', 3, 30, 'Pago en efectivo confirmado'),
  
  // Pedido 5 - pendiente
  createHistorial(15, 5, 'PENDIENTE', null, 4, 12),
  
  // Pedido 6 - cancelado
  createHistorial(16, 6, 'PENDIENTE', null, 5, 72),
  createHistorial(17, 6, 'CONFIRMADO', 'PENDIENTE', null, 70, 'Pago aprobado'),
  createHistorial(18, 6, 'CANCELADO', 'CONFIRMADO', 1, 30, 'Cliente solicitó cancelación por teléfono'),
];

// ============================================
// PAGOS
// ============================================

const createUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0;
  const v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});

export const MOCK_PAGOS: Pago[] = [
  {
    id: 1, pedido_id: 1, mp_payment_id: 12345678901,
    mp_status: 'approved', mp_status_detail: 'accredited',
    external_reference: createUUID(), idempotency_key: createUUID(),
    monto: 16500, created_at: pastDate(5, 119), updated_at: pastDate(5, 118),
  },
  {
    id: 2, pedido_id: 2, mp_payment_id: 12345678902,
    mp_status: 'approved', mp_status_detail: 'accredited',
    external_reference: createUUID(), idempotency_key: createUUID(),
    monto: 18300, created_at: pastDate(0, 179), updated_at: pastDate(0, 178),
  },
  {
    id: 3, pedido_id: 3, mp_payment_id: 12345678903,
    mp_status: 'approved', mp_status_detail: 'accredited',
    external_reference: createUUID(), idempotency_key: createUUID(),
    monto: 24500, created_at: pastDate(0, 119), updated_at: pastDate(0, 118),
  },
  {
    id: 4, pedido_id: 5, mp_payment_id: null,
    mp_status: 'pending', mp_status_detail: 'waiting_payment',
    external_reference: createUUID(), idempotency_key: createUUID(),
    monto: 10300, created_at: pastDate(0, 12), updated_at: pastDate(0, 12),
  },
  {
    id: 5, pedido_id: 6, mp_payment_id: 12345678904,
    mp_status: 'cancelled', mp_status_detail: 'cancelled_by_user',
    external_reference: createUUID(), idempotency_key: createUUID(),
    monto: 15500, created_at: pastDate(3, 70), updated_at: pastDate(3, 30),
  },
];

// ============================================
// MÉTRICAS DASHBOARD
// ============================================

export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  total_pedidos_hoy: 12,
  total_ventas_hoy: 145800,
  pedidos_por_estado: {
    PENDIENTE: 2,
    CONFIRMADO: 3,
    EN_PREPARACION: 4,
    EN_CAMINO: 2,
    ENTREGADO: 1,
    CANCELADO: 0,
  },
  productos_mas_vendidos: [
    { producto_id: 1, nombre: 'Pizza Muzzarella', cantidad: 8 },
    { producto_id: 5, nombre: 'Hamburguesa Clásica', cantidad: 6 },
    { producto_id: 10, nombre: 'Coca-Cola 500ml', cantidad: 15 },
    { producto_id: 8, nombre: 'Docena de Empanadas de Carne', cantidad: 4 },
  ],
  ingresos_ultimos_7_dias: [
    { fecha: '2025-05-19', total: 85000 },
    { fecha: '2025-05-20', total: 102000 },
    { fecha: '2025-05-21', total: 78000 },
    { fecha: '2025-05-22', total: 145000 },
    { fecha: '2025-05-23', total: 120000 },
    { fecha: '2025-05-24', total: 180000 },
    { fecha: '2025-05-25', total: 145800 },
  ],
  total_usuarios_registrados: 5,
  productos_bajo_stock: [
    { id: 7, nombre: 'Hamburguesa Vegetariana', stock_cantidad: 5 },
    { id: 13, nombre: 'Flan Casero', stock_cantidad: 3 },
  ],
};

// ============================================
// ÁRBOL DE CATEGORÍAS (Jerárquico)
// ============================================

export const buildCategoryTree = (): CategoriaTreeNode[] => {
  const map = new Map<number, CategoriaTreeNode>();
  const roots: CategoriaTreeNode[] = [];
  
  // Initialize all nodes
  MOCK_CATEGORIAS.forEach(cat => {
    map.set(cat.id, { ...cat, children: [] });
  });
  
  // Build hierarchy
  MOCK_CATEGORIAS.forEach(cat => {
    const node = map.get(cat.id)!;
    if (cat.parent_id) {
      const parent = map.get(cat.parent_id);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });
  
  return roots;
};

export const MOCK_CATEGORIA_TREE = buildCategoryTree();

// ============================================
// TOKENS FALSOS (JWT-like)
// ============================================

export const generateFakeJWT = (userId: number, roles: UserRole[], expiresInMin = 30): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(JSON.stringify({
    sub: userId,
    user_id: userId,
    roles,
    iat: now,
    exp: now + (expiresInMin * 60),
    type: 'access'
  }));
  const signature = btoa('fake-signature-for-mock');
  return `${header}.${payload}.${signature}`;
};

export const generateRefreshToken = (): string => {
  return 'refresh_' + createUUID();
};
