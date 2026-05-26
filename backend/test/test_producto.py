"""Tests CRUD del módulo Producto"""

# El router de producto está bajo /api/v1/productos
BASE_URL = "/api/v1/productos/"


def _crear_producto_basico(client, nombre="Pizza Clásica", precio=1200):
    """Helper para crear un producto"""
    resp = client.post(BASE_URL, json={
        "nombre": nombre,
        "descripcion": "Producto de prueba",
        "precio_base": precio,
        "imagenes_url": [],
        "stock_cantidad": 10,
        "disponible": True,
    })
    assert resp.status_code == 201
    return resp.json()


def test_crear_producto(client):
    """POST /api/v1/productos/ debe crear un producto (201)"""
    response = client.post(BASE_URL, json={
        "nombre": "Pizza Pepperoni",
        "descripcion": "Con pepperoni y queso",
        "precio_base": 1500,
        "imagenes_url": [],
        "stock_cantidad": 20,
        "disponible": True,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Pizza Pepperoni"
    assert data["precio_base"] == 1500
    assert data["stock_cantidad"] == 20
    assert data["disponible"] is True


def test_listar_productos(client):
    """GET /api/v1/productos/ debe listar productos"""
    _crear_producto_basico(client, "Pizza 1")
    _crear_producto_basico(client, "Pizza 2")
    response = client.get(BASE_URL)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


def test_obtener_producto_por_id(client):
    """GET /api/v1/productos/{id} debe retornar un producto"""
    created = _crear_producto_basico(client, "Pizza ID Test")
    response = client.get(f"{BASE_URL}{created['id']}")
    assert response.status_code == 200
    assert response.json()["nombre"] == "Pizza ID Test"


def test_obtener_producto_inexistente(client):
    """GET /api/v1/productos/{id} inexistente debe retornar 404"""
    response = client.get(f"{BASE_URL}99999")
    assert response.status_code == 404


def test_filtrar_productos_por_precio(client):
    """GET /api/v1/productos?min_precio=&max_precio= debe filtrar"""
    _crear_producto_basico(client, "Económico", precio=500)
    _crear_producto_basico(client, "Premium", precio=2000)
    response = client.get(f"{BASE_URL}?min_precio=1000&max_precio=2500")
    assert response.status_code == 200
    data = response.json()
    assert all(p["precio_base"] >= 1000 for p in data)
    assert all(p["precio_base"] <= 2500 for p in data)


def test_actualizar_producto(client):
    """PUT /api/v1/productos/{id} debe actualizar"""
    created = _crear_producto_basico(client, "Original")
    response = client.put(f"{BASE_URL}{created['id']}", json={
        "nombre": "Actualizado",
        "descripcion": "Nueva descripción",
        "precio_base": 2000,
        "imagenes_url": [],
        "stock_cantidad": 5,
        "disponible": True,
    })
    assert response.status_code == 200
    assert response.json()["nombre"] == "Actualizado"
    assert response.json()["precio_base"] == 2000


def test_eliminar_producto(client):
    """DELETE /api/v1/productos/{id} debe eliminar (204)"""
    created = _crear_producto_basico(client, "Para Eliminar")
    delete_resp = client.delete(f"{BASE_URL}{created['id']}")
    assert delete_resp.status_code == 204
    get_resp = client.get(f"{BASE_URL}{created['id']}")
    assert get_resp.status_code == 404
