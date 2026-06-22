import pytest

def test_order_flow(client):
    # 1. Create a customer
    customer_response = client.post(
        "/api/v1/customers",
        json={
            "full_name": "Order Test Customer",
            "email": "ordertest@example.com"
        }
    )
    customer_id = customer_response.json()["id"]

    # 2. Create a product
    product_response = client.post(
        "/api/v1/products",
        json={
            "name": "Order Test Product",
            "sku": "ORDER-SKU-01",
            "price": 50.0,
            "stock_quantity": 10
        }
    )
    product_id = product_response.json()["id"]

    # 3. Create an order
    order_response = client.post(
        "/api/v1/orders",
        json={
            "customer_id": customer_id,
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 2
                }
            ]
        }
    )
    assert order_response.status_code == 201
    order_data = order_response.json()
    assert order_data["total_amount"] == 100.0

    # 4. Verify stock was reduced
    product_check = client.get(f"/api/v1/products/{product_id}")
    assert product_check.json()["stock_quantity"] == 8

def test_insufficient_stock(client):
    customer_response = client.post(
        "/api/v1/customers",
        json={
            "full_name": "Stock Test Customer",
            "email": "stocktest@example.com"
        }
    )
    
    product_response = client.post(
        "/api/v1/products",
        json={
            "name": "Low Stock Product",
            "sku": "LOW-SKU-01",
            "price": 10.0,
            "stock_quantity": 1
        }
    )
    
    order_response = client.post(
        "/api/v1/orders",
        json={
            "customer_id": customer_response.json()["id"],
            "items": [
                {
                    "product_id": product_response.json()["id"],
                    "quantity": 5  # Requesting more than available
                }
            ]
        }
    )
    assert order_response.status_code == 400
    assert "Insufficient stock" in order_response.json()["error"]
