"""Tests CRUD del módulo Categoría"""

BASE_URL = "/categorias/"


def test_crear_categoria(client):
    """POST /categorias/ debe crear una categoría (201 Created)"""
    response = client.post(BASE_URL, json={
        "nombre": "Pizzas",
        "descripcion": "Todas las pizzas",
        "imagen_url": None,
        "parent_id": None,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Pizzas"
    assert data["descripcion"] == "Todas las pizzas"
    assert "id" in data


def test_listar_categorias(client):
    """GET /categorias/ debe listar categorías"""
    client.post(BASE_URL, json={
        "nombre": "Bebidas", "descripcion": "Bebidas frías", "imagen_url": None,
    })
    response = client.get(BASE_URL)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(c["nombre"] == "Bebidas" for c in data)


def test_obtener_categoria_por_id(client):
    """GET /categorias/{id} debe retornar una categoría"""
    created = client.post(BASE_URL, json={
        "nombre": "Postres", "descripcion": "Dulces", "imagen_url": None,
    }).json()
    response = client.get(f"{BASE_URL}{created['id']}")
    assert response.status_code == 200
    assert response.json()["nombre"] == "Postres"


def test_obtener_categoria_inexistente(client):
    """GET /categorias/{id} con id inexistente debe retornar 404"""
    response = client.get(f"{BASE_URL}99999")
    assert response.status_code == 404


def test_actualizar_categoria(client):
    """PUT /categorias/{id} debe actualizar la categoría"""
    created = client.post(BASE_URL, json={
        "nombre": "Temporal", "descripcion": "Temp", "imagen_url": None,
    }).json()
    response = client.put(f"{BASE_URL}{created['id']}", json={
        "nombre": "Actualizada",
        "descripcion": "Descripción actualizada",
        "imagen_url": None,
        "parent_id": None,
    })
    assert response.status_code == 200
    assert response.json()["nombre"] == "Actualizada"


def test_eliminar_categoria(client):
    """DELETE /categorias/{id} debe eliminar la categoría (204 No Content)"""
    created = client.post(BASE_URL, json={
        "nombre": "Eliminar", "descripcion": "Se va", "imagen_url": None,
    }).json()
    delete_resp = client.delete(f"{BASE_URL}{created['id']}")
    assert delete_resp.status_code == 204
    # Verificar que ya no existe
    get_resp = client.get(f"{BASE_URL}{created['id']}")
    assert get_resp.status_code == 404
