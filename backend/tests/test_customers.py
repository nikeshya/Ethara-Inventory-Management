import pytest

def test_create_customer(client):
    response = client.post(
        "/api/v1/customers",
        json={
            "full_name": "Test Customer",
            "email": "test@example.com",
            "phone": "+1-555-0000"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"

def test_create_customer_invalid_email(client):
    response = client.post(
        "/api/v1/customers",
        json={
            "full_name": "Invalid Email",
            "email": "not-an-email"
        }
    )
    assert response.status_code == 422
