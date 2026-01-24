#!/usr/bin/env python3
"""Seed script for InflationFighter MongoDB database using Loblaws CSV data."""

import os
import re
import ast
import random
import certifi
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

STORES = [
    {"store_id": "nofrills", "name": "No Frills", "color": "#FFD700"},
    {"store_id": "freshco", "name": "FreshCo", "color": "#00A650"},
    {"store_id": "walmart", "name": "Walmart", "color": "#0071CE"},
    {"store_id": "loblaws", "name": "Loblaws", "color": "#E31837"},
    {"store_id": "metro", "name": "Metro", "color": "#003DA5"}
]

# Product IDs to select from CSV (diverse grocery items)
SELECTED_PRODUCT_IDS = [
    "20091825001_EA",   # Cilantro
    "20143381001_KG",   # Roma Tomatoes
    "20179038001_KG",   # Ginger
    "21004355001_EA",   # Garlic Bulbs
    "20834587001_EA",   # Milk 2%
    "20309069001_EA",   # French Bread
    "20526997001_KG",   # Bananas
    "20088245001_EA",   # Potatoes
    "20088533001_EA",   # Red Onions
    "20174029001_KG",   # Apples
    "20825986001_EA",   # Yogurt
    "20128503001_EA",   # Orange Juice
    "20066884001_EA",   # Cereal
    "20311706001_EA",   # Coffee
    "20024942001_EA",   # Sugar
    "20024935001_EA",   # Flour
    "20024950001_EA",   # Cooking Oil
    "20307418001_EA",   # Frozen Pizza
    "20164997001_EA",   # Ice Cream
    "20044563001_EA",   # Bacon
    "20088379001_EA",   # Lettuce
    "20071822001_EA",   # Butter
    "20306553001_EA",   # Pasta
    "20069211001_EA",   # Rice
    "20800659001_EA",   # Cheese
]


def extract_image_url(product_image_str):
    """Extract the main image URL from the productImage JSON string."""
    if pd.isna(product_image_str) or not product_image_str:
        return ""
    try:
        # Parse the JSON-like string
        images = ast.literal_eval(product_image_str)
        if images and len(images) > 0:
            # Get the largeUrl or imageUrl
            return images[0].get('largeUrl') or images[0].get('imageUrl', '')
    except (ValueError, SyntaxError):
        pass
    return ""


def generate_store_prices(loblaws_price):
    """Generate realistic prices for all stores based on Loblaws price."""
    if not loblaws_price or loblaws_price <= 0:
        loblaws_price = 2.99

    # No Frills and FreshCo are typically cheapest (5-15% less)
    # Walmart is competitive (3-10% less)
    # Metro is typically similar or slightly higher (0-10% more)
    prices = {
        "nofrills": round(loblaws_price * random.uniform(0.85, 0.95), 2),
        "freshco": round(loblaws_price * random.uniform(0.82, 0.92), 2),
        "walmart": round(loblaws_price * random.uniform(0.88, 0.97), 2),
        "loblaws": round(loblaws_price, 2),
        "metro": round(loblaws_price * random.uniform(0.95, 1.10), 2),
    }
    return prices


def slugify(text):
    """Convert text to URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text[:50]


def load_products_from_csv():
    """Load products from Loblaws CSV file."""
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'grocery_data_jan_2025.csv')

    if not os.path.exists(csv_path):
        print(f"ERROR: CSV file not found at {csv_path}")
        return []

    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} products from CSV")

    # Filter for products with valid titles, prices, and images
    df = df[df['title'].notna() & (df['pricing.price'].notna()) & (df['productImage'].notna())]

    # Remove duplicates by title
    df = df.drop_duplicates(subset=['title'])

    # Select diverse products - prioritize common grocery items
    priority_keywords = [
        'milk', 'bread', 'egg', 'butter', 'cheese', 'yogurt', 'chicken', 'beef',
        'pork', 'fish', 'salmon', 'shrimp', 'apple', 'banana', 'orange', 'tomato',
        'potato', 'onion', 'carrot', 'lettuce', 'spinach', 'broccoli', 'pepper',
        'rice', 'pasta', 'cereal', 'oat', 'flour', 'sugar', 'oil', 'coffee',
        'tea', 'juice', 'water', 'soda', 'chips', 'cracker', 'cookie', 'chocolate',
        'ice cream', 'pizza', 'bacon', 'sausage', 'ham', 'turkey', 'garlic', 'ginger'
    ]

    selected_products = []
    used_titles = set()

    # First pass: get products matching priority keywords
    for keyword in priority_keywords:
        if len(selected_products) >= 50:
            break
        matches = df[df['title'].str.lower().str.contains(keyword, na=False)]
        for _, row in matches.iterrows():
            if len(selected_products) >= 50:
                break
            title = row['title']
            if title not in used_titles:
                selected_products.append(row)
                used_titles.add(title)

    # Second pass: fill remaining slots with other products
    if len(selected_products) < 50:
        remaining = df[~df['title'].isin(used_titles)]
        for _, row in remaining.iterrows():
            if len(selected_products) >= 50:
                break
            selected_products.append(row)

    print(f"Selected {len(selected_products)} diverse products")
    return selected_products


def create_categories_from_csv():
    """Create category documents from CSV data."""
    products = load_products_from_csv()
    categories = []

    for row in products:
        title = row['title']
        loblaws_price = float(row['pricing.price']) if pd.notna(row['pricing.price']) else 2.99
        image_url = extract_image_url(row['productImage'])
        package_sizing = row['packageSizing'] if pd.notna(row['packageSizing']) else "1 ea"
        brand = row['brand'] if pd.notna(row['brand']) else ""

        # Create category_id from title
        category_id = slugify(title)

        # Generate prices for all stores
        prices = generate_store_prices(loblaws_price)

        # Find cheapest store
        cheapest_store = min(prices, key=prices.get)

        # Generate previous price (10-25% higher than current Loblaws price)
        previous_price = round(loblaws_price * random.uniform(1.10, 1.25), 2)

        # Create search terms
        search_terms = [title.lower()]
        if brand:
            search_terms.append(brand.lower())
        # Add individual words from title
        for word in title.lower().split():
            if len(word) > 2 and word not in search_terms:
                search_terms.append(word)

        category = {
            "category_id": category_id,
            "name": title,
            "brand": brand,
            "icon": "shopping-basket",  # Default icon
            "unit": package_sizing.split(',')[0] if ',' in package_sizing else package_sizing,
            "image_url": image_url,
            "search_terms": search_terms[:5],  # Limit to 5 search terms
            "prices": prices,
            "previous_price": previous_price,
        }

        categories.append(category)

    return categories


def seed_database():
    uri = os.getenv("MONGODB_URI")
    if not uri:
        print("ERROR: MONGODB_URI not found. Create .env file with connection string.")
        return False

    try:
        print("Connecting to MongoDB Atlas...")
        client = MongoClient(uri, tlsCAFile=certifi.where())
        client.admin.command('ping')
        print("Connected!")

        db = client.inflationfighter

        print("Clearing existing data...")
        db.stores.delete_many({})
        db.categories.delete_many({})

        print(f"Inserting {len(STORES)} stores...")
        db.stores.insert_many(STORES)

        print("\nLoading products from Loblaws CSV...")
        categories = create_categories_from_csv()

        if not categories:
            print("ERROR: No categories created from CSV")
            return False

        print(f"Inserting {len(categories)} categories...")
        db.categories.insert_many(categories)

        print(f"\nVerification:")
        print(f"  stores: {db.stores.count_documents({})} documents")
        print(f"  categories: {db.categories.count_documents({})} documents")

        # Show sample products
        print("\nSample products:")
        for cat in list(db.categories.find().limit(5)):
            cheapest = min(cat["prices"].items(), key=lambda x: x[1])
            print(f"  {cat['name'][:40]}: ${cheapest[1]:.2f} at {cheapest[0]}")
            print(f"    Image: {cat['image_url'][:60]}...")

        print("\nDATABASE SEEDED SUCCESSFULLY!")
        return True

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    seed_database()
