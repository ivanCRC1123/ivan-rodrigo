# Módulo Pedido (Orders Module)

Complete implementation of order management with RBAC audit trail, snapshot pattern for product data, and atomic transaction handling.

## Architecture

### Models
- **Pedido**: Main order entity with status tracking, user reference, and totals
- **DetallePedido**: Order items with product snapshot (nombre_producto, precio_unitario immutable)
- **HistorialEstadoPedido**: Append-only audit trail recording every state transition
- **EstadoPedido**: Enum with valid states (PENDIENTE, CONFIRMADO, EN_PREPARACION, EN_CAMINO, ENTREGADO, CANCELADO)
- **FormaPago**: Enum for payment methods (TARJETA, EFECTIVO, TRANSFERENCIA)

### Key Design Patterns

#### 1. Snapshot Pattern
When an order is created, product data (nombre_producto, precio_unitario) is captured at that moment in DetallePedido. This ensures:
- Historical orders always show the exact price and name at purchase time
- Product updates don't affect existing orders
- Product deletions don't break order history

```python
# Service creates a snapshot when order is created
for detalle in detalles_data:
    producto = session.get(Producto, detalle.producto_id)
    detalle_obj = DetallePedido(
        pedido_id=pedido.id,
        producto_id=producto.id,
        nombre_producto=producto.nombre,  # SNAPSHOT
        precio_unitario=producto.precio,  # SNAPSHOT
        cantidad=detalle.cantidad,
    )
```

#### 2. Append-Only Audit Trail
HistorialEstadoPedidoRepository enforces immutability:
- Only INSERT operations allowed
- No update() or delete() methods exposed
- GET `/{pedido_id}/historial` returns complete state transition timeline

```python
# Every state change creates an immutable record
historial = HistorialEstadoPedido(
    pedido_id=pedido.id,
    estado_anterior=pedido.estado,
    estado_nuevo=nuevo_estado,
    razon=razon,
    timestamp=datetime.utcnow(),
)
session.add(historial)
```

#### 3. Unit of Work Pattern (Atomic Transactions)
PedidoService.crear_pedido() ensures atomicity:
- Validates all data BEFORE transaction starts
- Creates pedido + detalles + historial in single transaction
- Any failure triggers automatic ROLLBACK
- No partial orders in database

```python
try:
    # Validate before transaction
    self._validar_productos_disponibles(detalles_data, session)
    
    # Create order + details + history in one transaction
    pedido = Pedido(usuario_id=usuario_id, estado=EstadoPedido.PENDIENTE)
    session.add(pedido)
    session.flush()  # Get pedido.id
    
    for detalle in detalles_data:
        session.add(DetallePedido(...))
    session.add(HistorialEstadoPedido(...))
    
    session.commit()  # All-or-nothing
except Exception:
    session.rollback()
    raise
```

#### 4. State Machine
Enforces valid state transitions:
- PENDIENTE → CONFIRMADO (order confirmed)
- CONFIRMADO → EN_PREPARACION (kitchen starts prep)
- EN_PREPARACION → EN_CAMINO (ready for delivery)
- EN_CAMINO → ENTREGADO (order delivered)
- PENDIENTE|CONFIRMADO → CANCELADO (can only cancel before prep starts)

```python
_VALID_TRANSITIONS = {
    EstadoPedido.PENDIENTE: [EstadoPedido.CONFIRMADO, EstadoPedido.CANCELADO],
    EstadoPedido.CONFIRMADO: [EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO],
    EstadoPedido.EN_PREPARACION: [EstadoPedido.EN_CAMINO],
    EstadoPedido.EN_CAMINO: [EstadoPedido.ENTREGADO],
    EstadoPedido.ENTREGADO: [],
    EstadoPedido.CANCELADO: [],
}
```

## REST API Endpoints

### Create Order
```http
POST /api/v1/pedidos/
Content-Type: application/json

{
  "usuario_id": 1,
  "forma_pago": "TARJETA",
  "detalles": [
    {"producto_id": 10, "cantidad": 2},
    {"producto_id": 20, "cantidad": 1}
  ]
}
```

**Response (201 Created):**
```json
{
  "pedido_id": 5,
  "numero_pedido": "PED-20240525-A1B2C",
  "monto_total": 49.99,
  "estado": "PENDIENTE",
  "usuario_id": 1
}
```

### List All Orders (with pagination)
```http
GET /api/v1/pedidos/?skip=0&limit=10
```

### List Orders by User
```http
GET /api/v1/pedidos/usuario/1
```

### Get Order Details
```http
GET /api/v1/pedidos/5
```

**Response:**
```json
{
  "id": 5,
  "numero_pedido": "PED-20240525-A1B2C",
  "usuario_id": 1,
  "estado": "PENDIENTE",
  "forma_pago": "TARJETA",
  "monto_total": 49.99,
  "detalles": [
    {
      "id": 15,
      "producto_id": 10,
      "nombre_producto": "Hamburguesa Classic",
      "precio_unitario": 12.99,
      "cantidad": 2
    },
    {
      "id": 16,
      "producto_id": 20,
      "nombre_producto": "Papas Fritas",
      "precio_unitario": 3.50,
      "cantidad": 1
    }
  ],
  "created_at": "2024-05-25T14:30:00Z",
  "updated_at": "2024-05-25T14:30:00Z"
}
```

### Get Audit Trail (Immutable History)
```http
GET /api/v1/pedidos/5/historial
```

**Response:**
```json
[
  {
    "id": 101,
    "pedido_id": 5,
    "estado_anterior": "PENDIENTE",
    "estado_nuevo": "CONFIRMADO",
    "razon": "Cliente confirmó pedido",
    "timestamp": "2024-05-25T14:31:00Z"
  },
  {
    "id": 102,
    "pedido_id": 5,
    "estado_anterior": "CONFIRMADO",
    "estado_nuevo": "EN_PREPARACION",
    "razon": "Cocina inició preparación",
    "timestamp": "2024-05-25T14:35:00Z"
  }
]
```

### Change Order State
```http
PATCH /api/v1/pedidos/5/estado
Content-Type: application/json

{
  "nuevo_estado": "CONFIRMADO",
  "razon": "Cliente confirmó pedido"
}
```

**Response (200 OK):**
```json
{
  "id": 5,
  "numero_pedido": "PED-20240525-A1B2C",
  "estado_anterior": "PENDIENTE",
  "estado_nuevo": "CONFIRMADO",
  "estado_cambio_en": "2024-05-25T14:31:00Z"
}
```

### Cancel Order
```http
POST /api/v1/pedidos/5/cancelar
Content-Type: application/json

{
  "razon": "Cliente canceló"
}
```

**Response (200 OK):**
```json
{
  "pedido_id": 5,
  "estado": "CANCELADO",
  "cancelado_en": "2024-05-25T14:32:00Z",
  "razon": "Cliente canceló"
}
```

### Check if Order Can Be Cancelled
```http
GET /api/v1/pedidos/5/puede-cancelarse
```

**Response (200 OK):**
```json
{
  "pedido_id": 5,
  "estado_actual": "PENDIENTE",
  "puede_cancelarse": true,
  "razon": "Pedido está en estado PENDIENTE"
}
```

### Get Order by Number
```http
GET /api/v1/pedidos/numero/PED-20240525-A1B2C
```

## Error Handling

### Invalid Product (409 Conflict)
```json
{
  "detail": "Producto con ID 999 no existe"
}
```

### Insufficient Stock (409 Conflict)
```json
{
  "detail": "Producto ID 10 no tiene stock suficiente (disponible: 5, solicitado: 10)"
}
```

### Invalid State Transition (400 Bad Request)
```json
{
  "detail": "Transición inválida de ENTREGADO a PENDIENTE"
}
```

### Cannot Cancel (400 Bad Request)
```json
{
  "detail": "El pedido no puede ser cancelado en estado EN_CAMINO"
}
```

### Order Not Found (404 Not Found)
```json
{
  "detail": "Pedido con ID 999 no encontrado"
}
```

## Soft Delete

All models use soft delete with `deleted_at: TIMESTAMPTZ` **EXCEPT** HistorialEstadoPedido:
- Pedido.deleted_at
- DetallePedido.deleted_at
- HistorialEstadoPedido has NO deleted_at (immutable audit trail)

Queries automatically filter `deleted_at.is_(None)` to exclude deleted records.

## Testing Examples

### Test Order Creation and State Transitions
```bash
# 1. Create order
curl -X POST http://localhost:8000/api/v1/pedidos/ \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "forma_pago": "TARJETA",
    "detalles": [
      {"producto_id": 1, "cantidad": 2}
    ]
  }'

# Response: {"pedido_id": 5, "numero_pedido": "PED-20240525-A1B2C", ...}

# 2. Confirm order
curl -X PATCH http://localhost:8000/api/v1/pedidos/5/estado \
  -H "Content-Type: application/json" \
  -d '{
    "nuevo_estado": "CONFIRMADO",
    "razon": "Cliente confirmó"
  }'

# 3. View audit trail
curl http://localhost:8000/api/v1/pedidos/5/historial

# 4. Move to preparation
curl -X PATCH http://localhost:8000/api/v1/pedidos/5/estado \
  -H "Content-Type: application/json" \
  -d '{
    "nuevo_estado": "EN_PREPARACION",
    "razon": "Cocina inició preparación"
  }'

# 5. Attempt to cancel (should fail - not in PENDIENTE/CONFIRMADO)
curl -X POST http://localhost:8000/api/v1/pedidos/5/cancelar \
  -H "Content-Type: application/json" \
  -d '{"razon": "Cambio de idea"}' 
# Expected: 400 Bad Request
```

### Test Snapshot Pattern
```bash
# 1. Create order with producto_id=1 (precio=10.00)
curl -X POST http://localhost:8000/api/v1/pedidos/ \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "forma_pago": "EFECTIVO",
    "detalles": [
      {"producto_id": 1, "cantidad": 1}
    ]
  }'
# Response includes pedido_id=5

# 2. Update producto_id=1 price to 20.00
curl -X PATCH http://localhost:8000/api/v1/productos/1 \
  -H "Content-Type: application/json" \
  -d '{"precio": 20.00}'

# 3. Get order details - should still show 10.00 (snapshot preserved)
curl http://localhost:8000/api/v1/pedidos/5
# Response: detalles[0].precio_unitario = 10.00 (not 20.00)
```

## Database Schema

### Pedido Table
```sql
CREATE TABLE pedido (
    id INTEGER PRIMARY KEY,
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    usuario_id INTEGER NOT NULL REFERENCES usuario(id),
    estado VARCHAR(50) NOT NULL,
    forma_pago VARCHAR(50),
    monto_total DECIMAL(10, 2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP  -- Soft delete
);
```

### DetallePedido Table
```sql
CREATE TABLE detalle_pedido (
    id INTEGER PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES producto(id),
    nombre_producto VARCHAR(255) NOT NULL,  -- Snapshot
    precio_unitario DECIMAL(10, 2) NOT NULL,  -- Snapshot
    cantidad INTEGER NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP  -- Soft delete
);
```

### HistorialEstadoPedido Table
```sql
CREATE TABLE historial_estado_pedido (
    id INTEGER PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    razon VARCHAR(500),
    timestamp TIMESTAMP NOT NULL,
    -- NO deleted_at - audit trail is immutable and append-only
);
```

## Integration Notes

- Router is registered in `app/main.py` with prefix `/api/v1/pedidos`
- Models are imported and created in database lifespan
- PedidoService uses Unit of Work pattern with session management
- All soft-deleted records are automatically filtered from queries
- HistorialEstadoPedido is append-only by design

## Implementation Checklist
- ✅ Models with relationships and validations
- ✅ Schemas for all CRUD operations
- ✅ Repository layer with append-only enforcement
- ✅ Service layer with atomic transactions and state machine
- ✅ REST API with comprehensive endpoints
- ✅ Error handling and validation
- ✅ Router registration in main.py
- ✅ Snapshot pattern for product data preservation
- ✅ Append-only audit trail
- ✅ Soft delete implementation
- ✅ Unit of Work transactions
- ⏳ Integration and acceptance testing
