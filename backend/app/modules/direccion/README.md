# Módulo Dirección de Entrega (Delivery Address Module)

Complete implementation of delivery address management with automatic principal address enforcement and soft delete support.

## Architecture

### Model
- **DireccionEntrega**: Delivery address with user reference, alias, complete address data, and principal flag

### Key Features

#### 1. One Principal Address Per User
Business rule: A user can have multiple delivery addresses, but only ONE can be principal.
- If a user marks an address as principal (`es_principal=True`), all other addresses are automatically deactivated
- If the first address is created, it automatically becomes principal
- If the principal address is deleted, the next address becomes principal

#### 2. Soft Delete
All addresses use logical deletion (soft delete):
- `deleted_at: TIMESTAMPTZ` field
- Deleted addresses don't appear in queries by default
- Can be restored by setting `deleted_at = NULL` (if needed)

## REST API Endpoints

### Create Address
```http
POST /api/v1/direcciones/
Content-Type: application/json

{
  "usuario_id": 1,
  "alias": "Casa",
  "calle": "Calle Principal",
  "numero": "123",
  "apartamento": "4B",
  "localidad": "La Plata",
  "codigo_postal": "1900",
  "provincia": "Buenos Aires",
  "notas": "Dejar en portería",
  "es_principal": true
}
```

**Response (201 Created):**
```json
{
  "mensaje": "Dirección creada exitosamente",
  "direccion_id": 1,
  "alias": "Casa",
  "es_principal": true
}
```

**Behavior:**
- If `es_principal=True`, automatically deactivates other principal addresses for this user
- If it's the first address, `es_principal` is automatically set to `True`

### List Addresses
```http
GET /api/v1/direcciones/?usuario_id=1
```

Returns simple list of addresses, ordered by principal first.

### List Addresses (Formatted)
```http
GET /api/v1/direcciones/usuario/1
```

Returns addresses with complete formatted direction string.

### Get Principal Address
```http
GET /api/v1/direcciones/usuario/1/principal
```

Returns the principal address for a user.

**Response:**
```json
{
  "id": 1,
  "usuario_id": 1,
  "alias": "Casa",
  "calle": "Calle Principal",
  "numero": "123",
  "localidad": "La Plata",
  "es_principal": true,
  ...
}
```

### Get Address by ID
```http
GET /api/v1/direcciones/1
```

### Update Address
```http
PATCH /api/v1/direcciones/1
Content-Type: application/json

{
  "alias": "Casa Antigua",
  "calle": "Nueva calle",
  "numero": "456",
  "es_principal": true
}
```

**Response (200 OK):**
```json
{
  "mensaje": "Dirección actualizada exitosamente",
  "direccion_id": 1,
  "alias": "Casa Antigua",
  "es_principal": true,
  "updated_at": "2024-05-25T14:30:00Z"
}
```

**Special Behavior:**
- If `es_principal` changes to `True`, automatically deactivates other principal addresses

### Mark as Principal (Shortcut)
```http
PATCH /api/v1/direcciones/2/principal
```

Quick endpoint to mark an address as principal without providing full update data.

**Response (200 OK):**
```json
{
  "mensaje": "Dirección marcada como principal exitosamente",
  "direccion_id": 2,
  "alias": "Trabajo",
  "es_principal": true
}
```

**Behavior:**
- Automatically deactivates the previous principal address
- Perfect for quick switching between addresses

### Delete Address
```http
DELETE /api/v1/direcciones/1
```

**Response:** `204 No Content`

**Behavior:**
- Soft delete (sets `deleted_at` timestamp)
- If the deleted address was principal, the next address becomes principal automatically
- Deleted addresses don't appear in list queries

## Business Logic Examples

### Scenario 1: First Address Creation
```python
# User creates their first address
POST /api/v1/direcciones/
{
  "usuario_id": 1,
  "alias": "Casa",
  "calle": "Calle Principal",
  "numero": "123",
  ...
  "es_principal": false  # Set to false, but will be true automatically
}

# Response: es_principal=true (automatically set because it's the first)
```

### Scenario 2: Changing Principal Address
```python
# User has addresses: Casa (principal), Trabajo (not), Gym (not)
# User marks Trabajo as principal

PATCH /api/v1/direcciones/2/principal

# System behavior:
# - Casa: es_principal = false (automatically deactivated)
# - Trabajo: es_principal = true (activated)
# - Gym: es_principal = false (unchanged)
```

### Scenario 3: Deleting Principal Address
```python
# User deletes Casa (the principal address)

DELETE /api/v1/direcciones/1

# System behavior:
# - Casa: deleted_at = now (soft deleted)
# - Trabajo: es_principal = true (automatically becomes principal)
# - Gym: es_principal = false (unchanged)
```

## Database Schema

```sql
CREATE TABLE direccion_entrega (
    id INTEGER PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuario(id),
    
    alias VARCHAR(50) NOT NULL,
    calle VARCHAR(200) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    apartamento VARCHAR(50),
    localidad VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20),
    provincia VARCHAR(100),
    notas VARCHAR(500),
    
    es_principal BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE  -- Soft delete
);

CREATE INDEX idx_usuario_id ON direccion_entrega(usuario_id);
CREATE INDEX idx_es_principal ON direccion_entrega(es_principal);
```

## Service Layer

The `DireccionEntregaService` enforces all business rules:

1. **One Principal Per User**: `_asegurar_una_principal()` helper method
2. **Auto-Principal First**: Detects if it's the first address and sets `es_principal=True`
3. **Auto-Principal on Delete**: If deleted address was principal, promotes the next one
4. **Soft Delete**: All deletions use `deleted_at` timestamp

## Integration Notes

- Router is registered in `app/main.py` with prefix `/api/v1/direcciones`
- Model is imported and created in database lifespan
- Service uses transactional operations with `session.commit()` and `session.rollback()`
- All soft-deleted records are automatically filtered from queries

## Implementation Checklist
- ✅ DireccionEntrega model with soft delete and relationships
- ✅ DireccionEntregaRepository with soft delete filtering
- ✅ DireccionEntregaService with business logic:
  - ✅ One principal per user enforcement
  - ✅ Auto-principal for first address
  - ✅ Auto-promotion on deletion
  - ✅ CRUD operations
- ✅ REST API with 9 endpoints
- ✅ Comprehensive error handling
- ✅ Router registration in main.py
- ✅ Soft delete implementation
- ✅ Test suite with curl examples
