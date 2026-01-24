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

# unit_qty: quantity in standard_unit (kg for weight, L for volume, count for discrete items)
# standard_unit: the base unit for price-per-unit calculation
CATEGORIES = [
    {"category_id": "eggs", "name": "Eggs", "icon": "egg", "unit": "dozen",
     "unit_qty": 12, "standard_unit": "egg",
     "search_terms": ["eggs", "egg", "dozen eggs"],
     "prices": {"nofrills": 4.49, "freshco": 4.29, "walmart": 4.47, "loblaws": 5.29, "metro": 5.49},
     "deals": {"nofrills": {"sale_price": 3.49, "regular_price": 4.49, "ends": "2025-02-07"}}},
    {"category_id": "milk", "name": "Milk (2%)", "icon": "milk", "unit": "4L",
     "unit_qty": 4, "standard_unit": "L",
     "search_terms": ["milk", "2% milk", "4L milk"],
     "prices": {"nofrills": 5.49, "freshco": 5.49, "walmart": 5.47, "loblaws": 5.99, "metro": 6.29},
     "deals": {"walmart": {"sale_price": 4.97, "regular_price": 5.47, "ends": "2025-02-05"}}},
    {"category_id": "bread", "name": "Bread", "icon": "bread-slice", "unit": "loaf",
     "unit_qty": 1, "standard_unit": "loaf",
     "search_terms": ["bread", "white bread", "loaf"],
     "prices": {"nofrills": 2.49, "freshco": 2.29, "walmart": 2.47, "loblaws": 3.49, "metro": 3.29}},
    {"category_id": "butter", "name": "Butter", "icon": "cube", "unit": "454g",
     "unit_qty": 0.454, "standard_unit": "kg",
     "search_terms": ["butter", "salted butter"],
     "prices": {"nofrills": 5.99, "freshco": 5.79, "walmart": 5.97, "loblaws": 6.99, "metro": 6.79}},
    {"category_id": "apples", "name": "Apples", "icon": "apple-whole", "unit": "per lb",
     "unit_qty": 0.4536, "standard_unit": "kg",
     "search_terms": ["apples", "apple", "gala", "red apples"],
     "prices": {"nofrills": 1.49, "freshco": 1.29, "walmart": 1.47, "loblaws": 1.99, "metro": 1.79}},
    {"category_id": "bananas", "name": "Bananas", "icon": "banana", "unit": "per lb",
     "unit_qty": 0.4536, "standard_unit": "kg",
     "search_terms": ["bananas", "banana"],
     "prices": {"nofrills": 0.69, "freshco": 0.59, "walmart": 0.67, "loblaws": 0.79, "metro": 0.74}},
    {"category_id": "potatoes", "name": "Potatoes", "icon": "potato", "unit": "10lb bag",
     "unit_qty": 4.536, "standard_unit": "kg",
     "search_terms": ["potatoes", "potato", "russet"],
     "prices": {"nofrills": 4.99, "freshco": 4.49, "walmart": 4.97, "loblaws": 6.99, "metro": 5.99}},
    {"category_id": "onions", "name": "Onions", "icon": "onion", "unit": "3lb bag",
     "unit_qty": 1.361, "standard_unit": "kg",
     "search_terms": ["onions", "onion", "yellow onions"],
     "prices": {"nofrills": 2.99, "freshco": 2.49, "walmart": 2.97, "loblaws": 3.99, "metro": 3.49}},
    {"category_id": "chicken", "name": "Chicken Breast", "icon": "drumstick-bite", "unit": "per kg",
     "unit_qty": 1, "standard_unit": "kg",
     "search_terms": ["chicken", "chicken breast", "boneless chicken"],
     "prices": {"nofrills": 13.21, "freshco": 11.00, "walmart": 12.10, "loblaws": 15.39, "metro": 14.30},
     "deals": {"loblaws": {"sale_price": 11.99, "regular_price": 15.39, "ends": "2025-02-03"}}},
    {"category_id": "ground-beef", "name": "Ground Beef", "icon": "burger", "unit": "per kg",
     "unit_qty": 1, "standard_unit": "kg",
     "search_terms": ["ground beef", "beef", "lean ground beef"],
     "prices": {"nofrills": 11.00, "freshco": 9.90, "walmart": 10.56, "loblaws": 13.21, "metro": 12.10}},
    {"category_id": "pasta", "name": "Pasta", "icon": "utensils", "unit": "900g",
     "unit_qty": 0.9, "standard_unit": "kg",
     "search_terms": ["pasta", "spaghetti", "penne"],
     "prices": {"nofrills": 1.99, "freshco": 1.79, "walmart": 1.97, "loblaws": 2.99, "metro": 2.49}},
    {"category_id": "rice", "name": "Rice", "icon": "bowl-rice", "unit": "2kg",
     "unit_qty": 2, "standard_unit": "kg",
     "search_terms": ["rice", "white rice", "long grain"],
     "prices": {"nofrills": 4.49, "freshco": 3.99, "walmart": 4.27, "loblaws": 5.99, "metro": 5.49}},
    {"category_id": "cheese", "name": "Cheese", "icon": "cheese", "unit": "400g block",
     "unit_qty": 0.4, "standard_unit": "kg",
     "search_terms": ["cheese", "cheddar", "marble cheese"],
     "prices": {"nofrills": 6.49, "freshco": 5.99, "walmart": 6.27, "loblaws": 7.99, "metro": 7.49},
     "deals": {"metro": {"sale_price": 5.99, "regular_price": 7.49, "ends": "2025-02-10"}}},
    {"category_id": "canned-tomatoes", "name": "Canned Tomatoes", "icon": "jar", "unit": "796ml",
     "unit_qty": 0.796, "standard_unit": "L",
     "search_terms": ["canned tomatoes", "diced tomatoes", "tomatoes"],
     "prices": {"nofrills": 1.29, "freshco": 0.99, "walmart": 1.27, "loblaws": 1.99, "metro": 1.79}},
    {"category_id": "cereal", "name": "Cereal", "icon": "bowl-food", "unit": "500g box",
     "unit_qty": 0.5, "standard_unit": "kg",
     "search_terms": ["cereal", "breakfast cereal", "cheerios"],
     "prices": {"nofrills": 4.49, "freshco": 3.99, "walmart": 4.27, "loblaws": 5.99, "metro": 5.29}},
    {"category_id": "yogurt", "name": "Yogurt", "icon": "yogurt", "unit": "500g tub",
     "unit_qty": 0.5, "standard_unit": "kg",
     "search_terms": ["yogurt", "greek yogurt", "plain yogurt"],
     "prices": {"nofrills": 3.99, "freshco": 3.79, "walmart": 3.97, "loblaws": 4.99, "metro": 4.79}},
    {"category_id": "orange-juice", "name": "Orange Juice", "icon": "orange-juice", "unit": "1.89L carton",
     "unit_qty": 1.89, "standard_unit": "L",
     "search_terms": ["orange juice", "oj", "juice", "tropicana"],
     "prices": {"nofrills": 4.49, "freshco": 4.29, "walmart": 4.47, "loblaws": 5.49, "metro": 5.29}},
    {"category_id": "coffee", "name": "Coffee", "icon": "coffee", "unit": "340g ground",
     "unit_qty": 0.34, "standard_unit": "kg",
     "search_terms": ["coffee", "ground coffee", "folgers", "maxwell house"],
     "prices": {"nofrills": 8.99, "freshco": 8.49, "walmart": 8.97, "loblaws": 10.99, "metro": 10.49}},
    {"category_id": "sugar", "name": "Sugar", "icon": "sugar", "unit": "2kg bag",
     "unit_qty": 2, "standard_unit": "kg",
     "search_terms": ["sugar", "white sugar", "granulated sugar"],
     "prices": {"nofrills": 3.49, "freshco": 3.29, "walmart": 3.47, "loblaws": 4.49, "metro": 4.29}},
    {"category_id": "flour", "name": "Flour", "icon": "flour", "unit": "2.5kg bag",
     "unit_qty": 2.5, "standard_unit": "kg",
     "search_terms": ["flour", "all purpose flour", "baking flour", "white flour"],
     "prices": {"nofrills": 4.49, "freshco": 4.29, "walmart": 4.47, "loblaws": 5.49, "metro": 5.29}},
    {"category_id": "cooking-oil", "name": "Cooking Oil", "icon": "cooking-oil", "unit": "1L vegetable oil",
     "unit_qty": 1, "standard_unit": "L",
     "search_terms": ["cooking oil", "vegetable oil", "canola oil", "oil"],
     "prices": {"nofrills": 4.29, "freshco": 3.99, "walmart": 4.27, "loblaws": 5.29, "metro": 4.99}},
    {"category_id": "frozen-pizza", "name": "Frozen Pizza", "icon": "frozen-pizza", "unit": "single pizza",
     "unit_qty": 1, "standard_unit": "pizza",
     "search_terms": ["frozen pizza", "pizza", "delissio", "dr oetker"],
     "prices": {"nofrills": 5.99, "freshco": 5.49, "walmart": 5.97, "loblaws": 7.99, "metro": 7.49}},
    {"category_id": "ice-cream", "name": "Ice Cream", "icon": "ice-cream", "unit": "1.5L tub",
     "unit_qty": 1.5, "standard_unit": "L",
     "search_terms": ["ice cream", "frozen dessert", "breyers", "chapman's"],
     "prices": {"nofrills": 4.99, "freshco": 4.79, "walmart": 4.97, "loblaws": 6.49, "metro": 5.99}},
    {"category_id": "bacon", "name": "Bacon", "icon": "bacon", "unit": "375g pack",
     "unit_qty": 0.375, "standard_unit": "kg",
     "search_terms": ["bacon", "pork bacon", "breakfast bacon", "maple leaf"],
     "prices": {"nofrills": 6.99, "freshco": 6.49, "walmart": 6.97, "loblaws": 8.49, "metro": 7.99}},
    {"category_id": "lettuce", "name": "Lettuce", "icon": "lettuce", "unit": "1 head",
     "unit_qty": 1, "standard_unit": "head",
     "search_terms": ["lettuce", "iceberg lettuce", "romaine", "salad"],
     "prices": {"nofrills": 2.49, "freshco": 2.29, "walmart": 2.47, "loblaws": 3.49, "metro": 2.99}}
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
