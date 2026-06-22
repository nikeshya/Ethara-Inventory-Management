"""
Database seed script.
Populates the database with realistic demo data for the Ethara AI assessment.
"""

import os
import sys
import random

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.core.logging import logger

# Demo data
CATEGORIES = ["Electronics", "Office Supplies", "Furniture", "Accessories", "Software"]

PRODUCTS_DATA = [
    {"name": "MacBook Pro 16-inch", "sku": "APP-MBP-16", "price": 2499.00, "stock": 50, "category": "Electronics", "desc": "Apple M2 Max chip with 12-core CPU and 38-core GPU"},
    {"name": "Dell XPS 15", "sku": "DELL-XPS-15", "price": 1899.99, "stock": 35, "category": "Electronics", "desc": "13th Gen Intel Core i9, 32GB RAM, 1TB SSD"},
    {"name": "Ergonomic Office Chair", "sku": "FUR-ERG-01", "price": 299.50, "stock": 120, "category": "Furniture", "desc": "Premium mesh back with adjustable lumbar support"},
    {"name": "Standing Desk", "sku": "FUR-DESK-ST", "price": 450.00, "stock": 45, "category": "Furniture", "desc": "Electric height adjustable standing desk (48x24 inches)"},
    {"name": "Wireless Noise-Cancelling Headphones", "sku": "ACC-SONY-WH", "price": 348.00, "stock": 8, "category": "Accessories", "desc": "Sony WH-1000XM5 industry leading noise cancellation"},
    {"name": "Mechanical Keyboard", "sku": "ACC-KEY-MCH", "price": 149.99, "stock": 5, "category": "Accessories", "desc": "Keychron Q1 Pro wireless custom mechanical keyboard"},
    {"name": "27-inch 4K Monitor", "sku": "ELE-MON-27", "price": 399.00, "stock": 60, "category": "Electronics", "desc": "Dell UltraSharp 27 4K USB-C Hub Monitor"},
    {"name": "Adobe Creative Cloud", "sku": "SFW-ADB-CC", "price": 599.88, "stock": 1000, "category": "Software", "desc": "1-year subscription to all Adobe creative apps"},
]

CUSTOMERS_DATA = [
    {"name": "Nikesh Kumar Yadav", "email": "nikesh.kumar@ethara.ai", "phone": "+91-9205880273", "address": "Gurugram, Haryana, India"},
    {"name": "Jane Doe", "email": "jane.doe@example.com", "phone": "+1-555-0123", "address": "123 Tech Park, San Francisco, CA"},
    {"name": "John Smith", "email": "john.smith@example.com", "phone": "+44-20-7946-0958", "address": "45 Business Rd, London, UK"},
    {"name": "Alice Johnson", "email": "alice.j@corp.net", "phone": "+1-555-9876", "address": "789 Enterprise Blvd, New York, NY"},
    {"name": "Bob Williams", "email": "bwilliams@startup.io", "phone": "+61-2-9876-5432", "address": "Level 4, 10 Innovation Way, Sydney"},
]

def seed_database():
    """Seed the database with products, customers, and orders."""
    logger.info("Starting database seed...")
    
    # Recreate tables
    logger.info("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Seed Products
        logger.info("Seeding products...")
        db_products = []
        for p in PRODUCTS_DATA:
            product = Product(
                name=p["name"],
                sku=p["sku"],
                price=p["price"],
                stock_quantity=p["stock"],
                category=p["category"],
                description=p["desc"],
            )
            db.add(product)
            db_products.append(product)
        db.commit()
        for p in db_products:
            db.refresh(p)
            
        # Seed Customers
        logger.info("Seeding customers...")
        db_customers = []
        for c in CUSTOMERS_DATA:
            customer = Customer(
                full_name=c["name"],
                email=c["email"],
                phone=c["phone"],
                address=c["address"],
            )
            db.add(customer)
            db_customers.append(customer)
        db.commit()
        for c in db_customers:
            db.refresh(c)
            
        # Seed Orders
        logger.info("Seeding orders...")
        statuses = ["delivered", "shipped", "confirmed", "pending", "cancelled"]
        
        for i in range(15):  # Create 15 random orders
            customer = random.choice(db_customers)
            status = random.choice(statuses)
            
            # Select 1 to 4 random products
            order_products = random.sample(db_products, random.randint(1, 4))
            
            total_amount = 0.0
            order_items = []
            
            for product in order_products:
                qty = random.randint(1, 3)
                # We don't reduce stock here since this is historical seed data
                # but we'll act as if we sold them
                unit_price = product.price
                subtotal = unit_price * qty
                total_amount += subtotal
                
                order_items.append(
                    OrderItem(
                        product_id=product.id,
                        quantity=qty,
                        unit_price=unit_price,
                        subtotal=subtotal
                    )
                )
                
            order = Order(
                customer_id=customer.id,
                total_amount=round(total_amount, 2),
                status=status,
            )
            db.add(order)
            db.flush()  # to get order.id
            
            for item in order_items:
                item.order_id = order.id
                db.add(item)
                
        db.commit()
        logger.info("Database seeded successfully!")
        
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
