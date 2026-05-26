"""Tests CRUD del módulo Ingrediente"""

BASE_URL = "/ingredientes/"


def test_crear_ingrediente(client):
    """POST /ingredientes/ debe crear un ingrediente (201 Created)"""
    response = client.post(BASE_URL, json={
        "nombre": "Queso Mozzarella",
        "descripcion": "Queso fresco",
        "es_alergeno": False,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Queso Mozzarella"
    assert data["es_alergeno"] is False
    assert "id" in data


def test_crear_ingrediente_alergeno(client):
    """POST /ingredientes/ con es_alergeno=True"""
    response = client.post(BASE_URL, json={
        "nombre": "Maní",
        "descripcion": "Alérgeno común",
        "es_alergeno": True,
    })
    assert response.status_code == 201
    assert response.json()["es_alergeno"] is True


def test_listar_ingredientes(client):
    """GET /ingredientes/ debe listar ingredientes"""
    client.post(BASE_URL, json={
        "nombre": "Tomate", "descripcion": "Rojo", "es_alergeno": False,
    })
    client.post(BASE_URL, json={
        "nombre": "Lechuga", "descripcion": "Verde", "es_alergeno": False,
    })
    response = client.get(BASE_URL)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    nombres = [i["nombre"] for i in data]
    assert "Tomate" in nombres
    assert "Lechuga" in nombres


def test_obtener_ingrediente_por_id(client):
    """GET /ingredientes/{id} debe retornar un ingrediente"""
    created = client.post(BASE_URL, json={
        "nombre": "Cebolla", "descripcion": "Morada", "es_alergeno": False,
    }).json()
    response = client.get(f"{BASE_URL}{created['id']}")
    assert response.status_code == 200
    assert response.json()["nombre"] == "Cebolla"


def test_obtener_ingrediente_inexistente(client):
    """GET /ingredientes/{id} con id inexistente debe retornar 404"""
    response = client.get(f"{BASE_URL}99999")
    assert response.status_code == 404


def test_actualizar_ingrediente(client):
    """PUT /ingredientes/{id} debe actualizar el ingrediente"""
    created = client.post(BASE_URL, json={
        "nombre": "Pimiento", "descripcion": "Verde", "es_alergeno": False,
    }).json()
    response = client.put(f"{BASE_URL}{created['id']}", json={
        "descripcion": "Pimiento rojo asado",
    })
    assert response.status_code == 200
    assert response.json()["descripcion"] == "Pimiento rojo asado"


def test_eliminar_ingrediente(client):
    """DELETE /ingredientes/{id} debe eliminar (204 No Content)"""
    created = client.post(BASE_URL, json={
        "nombre": "Orégano", "descripcion": "Seco", "es_alergeno": False,
    }).json()
    delete_resp = client.delete(f"{BASE_URL}{created['id']}")
    assert delete_resp.status_code == 204
    get_resp = client.get(f"{BASE_URL}{created['id']}")
    assert get_resp.status_code == 404
