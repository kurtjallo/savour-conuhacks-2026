#!/usr/bin/env python3
"""Seed script for InflationFighter MongoDB database."""

import os
import certifi
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

CATEGORIES = [
    {"category_id": "eggs", "name": "Eggs", "icon": "egg", "unit": "dozen",
     "search_terms": ["eggs", "egg", "dozen eggs"],
     "prices": {"nofrills": 4.49, "freshco": 4.29, "walmart": 4.47, "loblaws": 5.29, "metro": 5.49}},
    {"category_id": "milk", "name": "Milk (2%)", "icon": "milk", "unit": "4L",
     "search_terms": ["milk", "2% milk", "4L milk"],
     "prices": {"nofrills": 5.49, "freshco": 5.49, "walmart": 5.47, "loblaws": 5.99, "metro": 6.29}},
    {"category_id": "bread", "name": "Bread", "icon": "bread-slice", "unit": "loaf",
     "search_terms": ["bread", "white bread", "loaf"],
     "prices": {"nofrills": 2.49, "freshco": 2.29, "walmart": 2.47, "loblaws": 3.49, "metro": 3.29}},
    {"category_id": "butter", "name": "Butter", "icon": "cube", "unit": "454g",
     "search_terms": ["butter", "salted butter"],
     "prices": {"nofrills": 5.99, "freshco": 5.79, "walmart": 5.97, "loblaws": 6.99, "metro": 6.79}},
    {"category_id": "apples", "name": "Apples", "icon": "apple-whole", "unit": "per lb",
     "search_terms": ["apples", "apple", "gala", "red apples"],
     "prices": {"nofrills": 1.49, "freshco": 1.29, "walmart": 1.47, "loblaws": 1.99, "metro": 1.79}},
    {"category_id": "bananas", "name": "Bananas", "icon": "banana", "unit": "per lb",
     "search_terms": ["bananas", "banana"],
     "prices": {"nofrills": 0.69, "freshco": 0.59, "walmart": 0.67, "loblaws": 0.79, "metro": 0.74}},
    {"category_id": "potatoes", "name": "Potatoes", "icon": "potato", "unit": "10lb bag",
     "search_terms": ["potatoes", "potato", "russet"],
     "prices": {"nofrills": 4.99, "freshco": 4.49, "walmart": 4.97, "loblaws": 6.99, "metro": 5.99}},
    {"category_id": "onions", "name": "Onions", "icon": "onion", "unit": "3lb bag",
     "search_terms": ["onions", "onion", "yellow onions"],
     "prices": {"nofrills": 2.99, "freshco": 2.49, "walmart": 2.97, "loblaws": 3.99, "metro": 3.49}},
    {"category_id": "chicken", "name": "Chicken Breast", "icon": "drumstick-bite", "unit": "per kg",
     "search_terms": ["chicken", "chicken breast", "boneless chicken"],
     "prices": {"nofrills": 13.21, "freshco": 11.00, "walmart": 12.10, "loblaws": 15.39, "metro": 14.30}},
    {"category_id": "ground-beef", "name": "Ground Beef", "icon": "burger", "unit": "per kg",
     "search_terms": ["ground beef", "beef", "lean ground beef"],
     "prices": {"nofrills": 11.00, "freshco": 9.90, "walmart": 10.56, "loblaws": 13.21, "metro": 12.10}},
    {"category_id": "pasta", "name": "Pasta", "icon": "utensils", "unit": "900g",
     "search_terms": ["pasta", "spaghetti", "penne"],
     "prices": {"nofrills": 1.99, "freshco": 1.79, "walmart": 1.97, "loblaws": 2.99, "metro": 2.49}},
    {"category_id": "rice", "name": "Rice", "icon": "bowl-rice", "unit": "2kg",
     "search_terms": ["rice", "white rice", "long grain"],
     "prices": {"nofrills": 4.49, "freshco": 3.99, "walmart": 4.27, "loblaws": 5.99, "metro": 5.49}},
    {"category_id": "cheese", "name": "Cheese", "icon": "cheese", "unit": "400g block",
     "search_terms": ["cheese", "cheddar", "marble cheese"],
     "prices": {"nofrills": 6.49, "freshco": 5.99, "walmart": 6.27, "loblaws": 7.99, "metro": 7.49}},
    {"category_id": "canned-tomatoes", "name": "Canned Tomatoes", "icon": "jar", "unit": "796ml",
     "search_terms": ["canned tomatoes", "diced tomatoes", "tomatoes"],
     "prices": {"nofrills": 1.29, "freshco": 0.99, "walmart": 1.27, "loblaws": 1.99, "metro": 1.79}},
    {"category_id": "cereal", "name": "Cereal", "icon": "bowl-food", "unit": "500g box",
     "search_terms": ["cereal", "breakfast cereal", "cheerios"],
     "prices": {"nofrills": 4.49, "freshco": 3.99, "walmart": 4.27, "loblaws": 5.99, "metro": 5.29}}
]


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

        print(f"Inserting {len(CATEGORIES)} categories...")
        db.categories.insert_many(CATEGORIES)

        print(f"\nVerification:")
        print(f"  stores: {db.stores.count_documents({})} documents")
        print(f"  categories: {db.categories.count_documents({})} documents")

        eggs = db.categories.find_one({"category_id": "eggs"})
        if eggs:
            cheapest = min(eggs["prices"].items(), key=lambda x: x[1])
            print(f"  Sample: Eggs cheapest at {cheapest[0]}: ${cheapest[1]:.2f}")

        print("\nDATABASE SEEDED SUCCESSFULLY!")
        return True

    except Exception as e:
        print(f"ERROR: {e}")
        return False


if __name__ == "__main__":
    seed_database()
