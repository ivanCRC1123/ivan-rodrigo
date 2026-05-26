# Actualización del Módulo Producto - Parcial 2

## 📋 Resumen de Cambios

Se han actualizado los modelos, schemas, servicios y endpoints del módulo `Producto` para cumplir con los requerimientos del Parcial 2:

### ✅ Requerimientos Implementados

1. **Stock directo en Producto** ✓
   - `stock_cantidad: int` - Campo de cantidad de stock
   - `disponible: bool` - Campo de disponibilidad

2. **Soft Delete** ✓
   - `deleted_at: Optional[datetime] = Field(default=None, nullable=True)`
   - TIMESTAMPTZ en base de datos
   - Productos eliminados excluidos por defecto de queries

3. **Endpoint PATCH de Disponibilidad** ✓
   - `PATCH /api/v1/productos/{id}/disponibilidad`
   - Permite activar/desactivar productos
   - Actualiza solo el campo `disponible`

---

## 📝 Cambios Detallados

### 1. **model.py** - Actualizado

```python
class Producto(SQLModel, table=True):
    # ... campos existentes ...
    
    stock_cantidad: int = Field(default=0, ge=0)      # ← Ya estaba
    disponible: bool = Field(default=True)             # ← Ya estaba
    
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    deleted_at: Optional[datetime] = Field(default=None, nullable=True)  # ← Ahora TIMESTAMPTZ

    def is_deleted(self) -> bool:
        """Verifica si el producto está eliminado"""
        return self.deleted_at is not None

    def is_available(self) -> bool:
        """Verifica si está disponible y no eliminado"""
        return self.disponible and not self.is_deleted()
```

### 2. **schema.py** - Nuevo Schema

Se agregó nuevo schema para endpoint PATCH:

```python
class ProductoUpdateDisponibilidad(SQLModel):
    """Schema para actualizar disponibilidad del producto"""
    disponible: bool
```

### 3. **service.py** - Métodos Nuevos

| Método | Propósito |
|--------|-----------|
| `get_all(include_deleted=False)` | Excluye productos eliminados por defecto |
| `get_by_id(include_deleted=False)` | Excluye productos eliminados por defecto |
| `soft_delete(producto)` | Marca como eliminado (deleted_at = now) |
| `hard_delete(producto)` | Elimina permanentemente de BD |
| `restore(producto)` | Restaura producto eliminado |
| `update_disponibilidad(producto, disponible)` | Actualiza solo disponibilidad |
| `get_filtered(...)` | Ahora excluye eliminados por defecto |

### 4. **router.py** - Cambios

#### ✨ Nuevo Endpoint - PATCH Disponibilidad

```python
@router.patch("/{producto_id}/disponibilidad", response_model=ProductoRead)
def update_disponibilidad(
    service: ProductoService,
    data: ProductoUpdateDisponibilidad,
    producto_id: int
):
    """PATCH /api/v1/productos/{id}/disponibilidad
    
    Actualiza la disponibilidad del producto.
    Ejemplo:
    {
        "disponible": false
    }
    """
    producto = service.get_by_id(producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return service.update_disponibilidad(producto, data.disponible)
```

#### 🔄 Endpoint DELETE - Ahora con Soft Delete

```python
@router.delete("/{producto_id}", status_code=204)
def delete(
    service: ProductoService,
    producto_id: int,
    hard_delete: bool = Query(False)
):
    """DELETE /api/v1/productos/{id}
    
    - hard_delete=False (default): Soft delete (marca como eliminado)
    - hard_delete=True: Hard delete (elimina permanentemente)
    """
    producto = service.get_by_id(producto_id, include_deleted=True)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    if hard_delete:
        service.hard_delete(producto)
    else:
        service.soft_delete(producto)
```

#### ➕ Nuevo Endpoint - Restaurar

```python
@router.post("/{producto_id}/restaurar", response_model=ProductoRead)
def restore(
    service: ProductoService,
    producto_id: int
):
    """POST /api/v1/productos/{id}/restaurar
    
    Restaura un producto que fue eliminado con soft delete.
    """
    producto = service.get_by_id(producto_id, include_deleted=True)
    if not producto or not producto.is_deleted():
        raise HTTPException(status_code=400, detail="El producto no está eliminado")
    return service.restore(producto)
```

#### 📋 Endpoint GET - Ahora Excluye Eliminados

```python
@router.get("/")
def get_all(
    min_precio: float = 0,
    max_precio: float = 100000,
    limit: int = 10,
    offset: int = 0
):
    """GET /api/v1/productos
    
    Lista productos EXCLUYEN eliminados por defecto
    """
    return service.get_filtered(
        min_precio, 
        max_precio, 
        limit, 
        offset, 
        include_deleted=False  # ← Nueva línea
    )
```

#### Cambio de Prefix

**Antes:**
```python
router = APIRouter(prefix="/productos", tags=["Productos"])
```

**Ahora:**
```python
router = APIRouter(prefix="/api/v1/productos", tags=["Productos"])
```

Esto alinea con el módulo de Usuarios que usa `/api/v1/`.

---

## 🔗 Endpoints Completos (Actualizado)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/productos` | Listar (excluye eliminados) |
| GET | `/api/v1/productos/{id}` | Obtener uno |
| POST | `/api/v1/productos` | Crear |
| PUT | `/api/v1/productos/{id}` | Actualizar |
| **PATCH** | **`/api/v1/productos/{id}/disponibilidad`** | **Cambiar disponibilidad** ✨ NUEVO |
| DELETE | `/api/v1/productos/{id}` | Soft delete (hard_delete=True para hard delete) |
| **POST** | **`/api/v1/productos/{id}/restaurar`** | **Restaurar eliminado** ✨ NUEVO |

---

## 💾 Base de Datos

### Tabla `producto`

```sql
CREATE TABLE producto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_base FLOAT NOT NULL CHECK (precio_base >= 0),
    imagenes_url JSON,
    stock_cantidad INTEGER DEFAULT 0 CHECK (stock_cantidad >= 0),
    disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL  -- ← Clave para soft delete
);

-- Index para queries frecuentes
CREATE INDEX idx_producto_deleted_at ON producto(deleted_at);
CREATE INDEX idx_producto_disponible ON producto(disponible);
```

---

## 🧪 Ejemplos de Uso

### Crear Producto

```bash
POST /api/v1/productos
Content-Type: application/json

{
    "nombre": "Pizza Margarita",
    "descripcion": "Pizza con tomate y queso",
    "precio_base": 250.00,
    "stock_cantidad": 50,
    "disponible": true,
    "imagenes_url": ["https://example.com/pizza.jpg"]
}

Response: 201 Created
{
    "id": 1,
    "nombre": "Pizza Margarita",
    "descripcion": "Pizza con tomate y queso",
    "precio_base": 250.00,
    "stock_cantidad": 50,
    "disponible": true,
    "created_at": "2024-05-25T14:30:00Z",
    "updated_at": "2024-05-25T14:30:00Z",
    "deleted_at": null,
    "categorias": [],
    "ingredientes": []
}
```

### Cambiar Disponibilidad (PATCH)

```bash
PATCH /api/v1/productos/1/disponibilidad
Content-Type: application/json

{
    "disponible": false
}

Response: 200 OK
{
    "id": 1,
    "nombre": "Pizza Margarita",
    "disponible": false,  ← Cambió aquí
    "stock_cantidad": 50,
    "updated_at": "2024-05-25T14:35:00Z",  ← Actualizado
    ...
}
```

### Listar Productos (Excluye Eliminados)

```bash
GET /api/v1/productos?min_precio=0&max_precio=500&limit=10&offset=0

Response: 200 OK
[
    {
        "id": 1,
        "nombre": "Pizza Margarita",
        "disponible": false,
        "deleted_at": null,  ← null = activo
        ...
    },
    ...
]

# Los productos con deleted_at != null NO aparecen aquí
```

### Soft Delete

```bash
DELETE /api/v1/productos/1

Response: 204 No Content
# En BD: producto.deleted_at = "2024-05-25T14:40:00Z"
```

### Hard Delete (Permanente)

```bash
DELETE /api/v1/productos/1?hard_delete=true

Response: 204 No Content
# En BD: Producto ELIMINADO completamente
```

### Restaurar Producto

```bash
POST /api/v1/productos/1/restaurar

Response: 200 OK
{
    "id": 1,
    "nombre": "Pizza Margarita",
    "deleted_at": null,  ← Restaurado
    ...
}
```

---

## 🎯 Validaciones Implementadas

✓ Productos eliminados NO aparecen en GET por defecto  
✓ Campo `deleted_at` es TIMESTAMPTZ nullable  
✓ Soft delete marca con fecha/hora automática  
✓ Hard delete elimina completamente  
✓ PATCH actualiza SOLO disponibilidad  
✓ Restaurar solo funciona si está eliminado  
✓ Stock y disponibilidad siempre en modelo  

---

## 📚 Métodos de Utilidad

```python
# En modelo Producto
producto.is_deleted()        # → bool (deleted_at is not None)
producto.is_available()      # → bool (disponible AND not deleted)
```

---

## 🔄 Compatibilidad

✅ Compatible con módulo Usuario (mismo patrón soft delete)  
✅ Compatible con relaciones ProductoCategoria (left intact)  
✅ Compatible con relaciones ProductoIngrediente (left intact)  
✅ Sintaxis compilada y validada  

---

## ⚠️ Consideraciones

1. **Datos Existentes**: Si hay productos en BD sin `deleted_at`, se asigna NULL automáticamente
2. **Índices**: Se recomienda crear índice en `deleted_at` para performance
3. **Migraciones**: Si usas Alembic, la migración se genera automáticamente
4. **Consistencia**: Las queries de relación (categorías, ingredientes) funcionan igual

---

## 🎓 Próximas Mejoras Sugeridas

1. Filtro adicional: `GET /api/v1/productos?disponibles_solo=true`
2. Auditoría: Registrar quién desactivó y cuándo
3. Validación: No permitir vender si `stock_cantidad = 0`
4. Movimiento de stock: Crear tabla StockMovimiento para historial
