import pytest

def test_create_product(client):
    response = client.post(
        "/api/v1/products",
        json={
            "name": "Test Product",
            "sku": "TEST-SKU-01",
            "price": 99.99,
            "stock_quantity": 50,
            "category": "Testing"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Product"
    assert data["sku"] == "TEST-SKU-01"

def test_create_product_invalid_price(client):
    response = client.post(
        "/api/v1/products",
        json={
            "name": "Invalid Price Product",
            "sku": "TEST-SKU-02",
            "price": -10.0,
            "stock_quantity": 50
        }
    )
    assert response.status_code == 422

def test_get_products(client):
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
