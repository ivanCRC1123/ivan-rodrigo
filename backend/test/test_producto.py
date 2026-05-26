"""Tests CRUD del módulo Producto"""

# El router de producto está bajo /api/v1/productos
BASE_URL = "/api/v1/productos/"


def _crear_producto_basico(client, nombre="Pizza Clásica", precio=1200, headers=None):
    """Helper para crear un producto"""
    hdrs = headers or {}
    resp = client.post(BASE_URL, json={
        "nombre": nombre,
        "descripcion": "Producto de prueba",
        "precio_base": precio,
        "imagenes_url": [],
        "stock_cantidad": 10,
        "disponible": True,
    }, headers=hdrs)
    assert resp.status_code == 201
    return resp.json()


def test_crear_producto(client, auth_headers):
    """POST /api/v1/productos/ debe crear un producto (201)"""
    response = client.post(BASE_URL, json={
        "nombre": "Pizza Pepperoni",
        "descripcion": "Con pepperoni y queso",
        "precio_base": 1500,
        "imagenes_url": [],
        "stock_cantidad": 20,
        "disponible": True,
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Pizza Pepperoni"
    assert data["precio_base"] == 1500
    assert data["stock_cantidad"] == 20
    assert data["disponible"] is True


def test_listar_productos(client, auth_headers):
    """GET /api/v1/productos/ debe listar productos"""
    _crear_producto_basico(client, "Pizza 1", headers=auth_headers)
    _crear_producto_basico(client, "Pizza 2", headers=auth_headers)
    response = client.get(BASE_URL)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


def test_obtener_producto_por_id(client, auth_headers):
    """GET /api/v1/productos/{id} debe retornar un producto"""
    created = _crear_producto_basico(client, "Pizza ID Test", headers=auth_headers)
    response = client.get(f"{BASE_URL}{created['id']}")
    assert response.status_code == 200
    assert response.json()["nombre"] == "Pizza ID Test"


def test_obtener_producto_inexistente(client):
    """GET /api/v1/productos/{id} inexistente debe retornar 404"""
    response = client.get(f"{BASE_URL}99999")
    assert response.status_code == 404


def test_filtrar_productos_por_precio(client, auth_headers):
    """GET /api/v1/productos?min_precio=&max_precio= debe filtrar"""
    _crear_producto_basico(client, "Económico", precio=500, headers=auth_headers)
    _crear_producto_basico(client, "Premium", precio=2000, headers=auth_headers)
    response = client.get(f"{BASE_URL}?min_precio=1000&max_precio=2500")
    assert response.status_code == 200
    data = response.json()
    assert all(p["precio_base"] >= 1000 for p in data)
    assert all(p["precio_base"] <= 2500 for p in data)


def test_actualizar_producto(client, auth_headers):
    """PUT /api/v1/productos/{id} debe actualizar"""
    created = _crear_producto_basico(client, "Original", headers=auth_headers)
    response = client.put(f"{BASE_URL}{created['id']}", json={
        "nombre": "Actualizado",
        "descripcion": "Nueva descripción",
        "precio_base": 2000,
        "imagenes_url": [],
        "stock_cantidad": 5,
        "disponible": True,
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["nombre"] == "Actualizado"
    assert response.json()["precio_base"] == 2000


def test_eliminar_producto(client, auth_headers):
    """DELETE /api/v1/productos/{id} debe eliminar (204)"""
    created = _crear_producto_basico(client, "Para Eliminar", headers=auth_headers)
    delete_resp = client.delete(f"{BASE_URL}{created['id']}", headers=auth_headers)
    assert delete_resp.status_code == 204
    get_resp = client.get(f"{BASE_URL}{created['id']}")
    assert get_resp.status_code == 404
