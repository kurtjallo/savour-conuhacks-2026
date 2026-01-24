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

# Map category_id to Walmart image URLs
IMAGE_URLS = {
    "eggs": "https://i5.walmartimages.com/seo/Great-Value-Large-White-Eggs-18-Count_6203b272-0a2c-4db2-84e3-872f72226687.jpeg",
    "milk": "https://i5.walmartimages.com/seo/Great-Value-2-Reduced-Fat-Milk-1-Gallon-128-Fl-Oz_967e7f76-a519-4f59-afce-89a7ded964bf.jpeg",
    "bread": "https://i5.walmartimages.com/seo/Wonder-Classic-White-Bread-20-oz_3d7d7e8d-36c3-4af3-b0bd-cc3e22c73a8d.jpeg",
    "butter": "https://i5.walmartimages.com/seo/Great-Value-Sweet-Cream-Salted-Butter-16-oz_d7c3bd6e-9af5-4f63-8b2a-b8fdcfe6f60c.jpeg",
    "apples": "https://i5.walmartimages.com/seo/Fresh-Gala-Apples-3-lb-Bag_bcfd9451-a73b-411f-84e3-1d866f833ae8.3e996f05a24facfa2ac526d6c631401d.jpeg",
    "bananas": "https://i5.walmartimages.com/seo/Fresh-Banana-Each_5939a6fa-a0d6-431c-88c6-b4f21608e4be.f7cd0cc487761d74c69b7731493c1581.jpeg",
    "potatoes": "https://i5.walmartimages.com/seo/Fresh-Whole-Russet-Potatoes-5lb-bag_39e383c7-abe5-42fa-9078-5d6d0bb5c0d4.8fc19a526bf85bd640d369c4c85a2bf2.jpeg",
    "onions": "https://i5.walmartimages.com/seo/Fresh-Yellow-Onion-Each_d76c3aa9-b8f6-4c5d-a3db-6c1ed8ebc93c.jpeg",
    "chicken": "https://i5.walmartimages.com/seo/Boneless-Skinless-Chicken-Breasts-4-7-6-1-lb-Tray_4693e429-b926-4913-984c-dd29d4bdd586.780145c264e407b17e86cd4a7106731f.jpeg",
    "ground-beef": "https://i5.walmartimages.com/seo/80-Lean-20-Fat-Ground-Beef-Chuck-1-lb-Tray-Fresh-All-Natural_eda2d926-ef1a-43d4-b5f3-ec02083aaf89.f688a6a033622f6b7c2eb9aeadfdcc3e.png",
    "pasta": "https://i5.walmartimages.com/seo/Barilla-Spaghetti-Pasta-16-oz_ec5b5d1d-62d2-4d27-9c0e-a5e7f0d2dd54.jpeg",
    "rice": "https://i5.walmartimages.com/seo/Great-Value-Long-Grain-Enriched-Rice-32-oz_b6f9b46f-3f1e-4f76-bf38-eebd14fcbf7a.jpeg",
    "cheese": "https://i5.walmartimages.com/seo/Great-Value-Finely-Shredded-Fiesta-Blend-Cheese-8-oz_5127b37a-3b27-42a9-8d3a-b971b90881bd.f935534052cc2f7792b8c3d017b0d5ce.jpeg",
    "canned-tomatoes": "https://i5.walmartimages.com/seo/Great-Value-Diced-Tomatoes-14-5-oz_a9b12e3f-e3f1-40bd-b51b-87c5a6eb2f1b.jpeg",
    "cereal": "https://i5.walmartimages.com/seo/Cheerios-Heart-Healthy-Cereal-Gluten-Free-Cereal-With-Whole-Grain-Oats-18-oz_0e3f9b8f-c6c4-4fc1-a3e2-1bb5f6e8d4f8.jpeg",
    "yogurt": "https://i5.walmartimages.com/seo/Great-Value-Original-Lowfat-Yogurt-32-oz_1c0b1b23-aee7-4f9c-a4a2-8eb5f45c4e8d.jpeg",
    "orange-juice": "https://i5.walmartimages.com/seo/Tropicana-Pure-Premium-No-Pulp-100-Orange-Juice-52-fl-oz_8d5f6c7c-e93a-4f8b-8b0c-1a4d5e9f8c0b.jpeg",
    "coffee": "https://i5.walmartimages.com/seo/Folgers-Classic-Roast-Ground-Coffee-Medium-Roast-30-4-oz_0a3b4c5d-e6f7-8a9b-c0d1-e2f3a4b5c6d7.jpeg",
    "sugar": "https://i5.walmartimages.com/seo/Great-Value-Pure-Granulated-Sugar-4-lb_a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpeg",
    "flour": "https://i5.walmartimages.com/seo/Gold-Medal-All-Purpose-Flour-5-lb_d4c3b2a1-0987-6543-fedc-ba0987654321.jpeg",
    "cooking-oil": "https://i5.walmartimages.com/seo/Great-Value-Vegetable-Oil-48-fl-oz_f0e9d8c7-b6a5-4321-0fed-cba987654321.jpeg",
    "frozen-pizza": "https://i5.walmartimages.com/seo/DiGiorno-Frozen-Pizza-Four-Cheese-Original-Rising-Crust_a1b2c3d4-5678-90ab-cdef-1234567890ab.jpeg",
    "ice-cream": "https://i5.walmartimages.com/seo/Great-Value-Vanilla-Flavored-Ice-Cream-1-Gallon_b2c3d4e5-6789-0abc-def1-234567890abc.jpeg",
    "bacon": "https://i5.walmartimages.com/seo/Oscar-Mayer-Naturally-Hardwood-Smoked-Bacon-16-oz_c3d4e5f6-7890-abcd-ef12-34567890abcd.jpeg",
    "lettuce": "https://i5.walmartimages.com/seo/Marketside-Fresh-Shredded-Iceberg-Lettuce-8-oz-Bag-Fresh_5868cfab-7943-4911-8972-b3fb8e2c31b0.6d4417e2a83151e26c64556d92c6db1f.jpeg"
}

# unit_qty: quantity in standard_unit (kg for weight, L for volume, count for discrete items)
# standard_unit: the base unit for price-per-unit calculation
CATEGORIES = [
    {"category_id": "eggs", "name": "Eggs", "icon": "egg", "unit": "dozen",
     "unit_qty": 12, "standard_unit": "egg",
     "image_url": IMAGE_URLS.get("eggs", ""),
     "search_terms": ["eggs", "egg", "dozen eggs"],
     "prices": {"nofrills": 4.49, "freshco": 4.29, "walmart": 4.47, "loblaws": 5.29, "metro": 5.49},
     "deals": {"nofrills": {"sale_price": 3.49, "regular_price": 4.49, "ends": "2025-02-07"}},
     "previous_price": 5.99},
    {"category_id": "milk", "name": "Milk (2%)", "icon": "milk", "unit": "4L",
     "unit_qty": 4, "standard_unit": "L",
     "image_url": IMAGE_URLS.get("milk", ""),
     "search_terms": ["milk", "2% milk", "4L milk"],
     "prices": {"nofrills": 5.49, "freshco": 5.49, "walmart": 5.47, "loblaws": 5.99, "metro": 6.29},
     "deals": {"walmart": {"sale_price": 4.97, "regular_price": 5.47, "ends": "2025-02-05"}},
     "previous_price": 6.99},
    {"category_id": "bread", "name": "Bread", "icon": "bread-slice", "unit": "loaf",
     "unit_qty": 1, "standard_unit": "loaf",
     "image_url": IMAGE_URLS.get("bread", ""),
     "search_terms": ["bread", "white bread", "loaf"],
     "prices": {"nofrills": 2.49, "freshco": 2.29, "walmart": 2.47, "loblaws": 3.49, "metro": 3.29},
     "previous_price": 3.79},
    {"category_id": "butter", "name": "Butter", "icon": "cube", "unit": "454g",
     "unit_qty": 0.454, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("butter", ""),
     "search_terms": ["butter", "salted butter"],
     "prices": {"nofrills": 5.99, "freshco": 5.79, "walmart": 5.97, "loblaws": 6.99, "metro": 6.79},
     "previous_price": 7.49},
    {"category_id": "apples", "name": "Apples", "icon": "apple-whole", "unit": "per lb",
     "unit_qty": 0.4536, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("apples", ""),
     "search_terms": ["apples", "apple", "gala", "red apples"],
     "prices": {"nofrills": 1.49, "freshco": 1.29, "walmart": 1.47, "loblaws": 1.99, "metro": 1.79},
     "previous_price": 2.29},
    {"category_id": "bananas", "name": "Bananas", "icon": "banana", "unit": "per lb",
     "unit_qty": 0.4536, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("bananas", ""),
     "search_terms": ["bananas", "banana"],
     "prices": {"nofrills": 0.69, "freshco": 0.59, "walmart": 0.67, "loblaws": 0.79, "metro": 0.74},
     "previous_price": 0.89},
    {"category_id": "potatoes", "name": "Potatoes", "icon": "potato", "unit": "10lb bag",
     "unit_qty": 4.536, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("potatoes", ""),
     "search_terms": ["potatoes", "potato", "russet"],
     "prices": {"nofrills": 4.99, "freshco": 4.49, "walmart": 4.97, "loblaws": 6.99, "metro": 5.99},
     "previous_price": 7.49},
    {"category_id": "onions", "name": "Onions", "icon": "onion", "unit": "3lb bag",
     "unit_qty": 1.361, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("onions", ""),
     "search_terms": ["onions", "onion", "yellow onions"],
     "prices": {"nofrills": 2.99, "freshco": 2.49, "walmart": 2.97, "loblaws": 3.99, "metro": 3.49},
     "previous_price": 4.29},
    {"category_id": "chicken", "name": "Chicken Breast", "icon": "drumstick-bite", "unit": "per kg",
     "unit_qty": 1, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("chicken", ""),
     "search_terms": ["chicken", "chicken breast", "boneless chicken"],
     "prices": {"nofrills": 13.21, "freshco": 11.00, "walmart": 12.10, "loblaws": 15.39, "metro": 14.30},
     "deals": {"loblaws": {"sale_price": 11.99, "regular_price": 15.39, "ends": "2025-02-03"}},
     "previous_price": 16.99},
    {"category_id": "ground-beef", "name": "Ground Beef", "icon": "burger", "unit": "per kg",
     "unit_qty": 1, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("ground-beef", ""),
     "search_terms": ["ground beef", "beef", "lean ground beef"],
     "prices": {"nofrills": 11.00, "freshco": 9.90, "walmart": 10.56, "loblaws": 13.21, "metro": 12.10},
     "previous_price": 14.49},
    {"category_id": "pasta", "name": "Pasta", "icon": "utensils", "unit": "900g",
     "unit_qty": 0.9, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("pasta", ""),
     "search_terms": ["pasta", "spaghetti", "penne"],
     "prices": {"nofrills": 1.99, "freshco": 1.79, "walmart": 1.97, "loblaws": 2.99, "metro": 2.49},
     "previous_price": 3.29},
    {"category_id": "rice", "name": "Rice", "icon": "bowl-rice", "unit": "2kg",
     "unit_qty": 2, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("rice", ""),
     "search_terms": ["rice", "white rice", "long grain"],
     "prices": {"nofrills": 4.49, "freshco": 3.99, "walmart": 4.27, "loblaws": 5.99, "metro": 5.49},
     "previous_price": 6.49},
    {"category_id": "cheese", "name": "Cheese", "icon": "cheese", "unit": "400g block",
     "unit_qty": 0.4, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("cheese", ""),
     "search_terms": ["cheese", "cheddar", "marble cheese"],
     "prices": {"nofrills": 6.49, "freshco": 5.99, "walmart": 6.27, "loblaws": 7.99, "metro": 7.49},
     "deals": {"metro": {"sale_price": 5.99, "regular_price": 7.49, "ends": "2025-02-10"}},
     "previous_price": 8.49},
    {"category_id": "canned-tomatoes", "name": "Canned Tomatoes", "icon": "jar", "unit": "796ml",
     "unit_qty": 0.796, "standard_unit": "L",
     "image_url": IMAGE_URLS.get("canned-tomatoes", ""),
     "search_terms": ["canned tomatoes", "diced tomatoes", "tomatoes"],
     "prices": {"nofrills": 1.29, "freshco": 0.99, "walmart": 1.27, "loblaws": 1.99, "metro": 1.79},
     "previous_price": 2.29},
    {"category_id": "cereal", "name": "Cereal", "icon": "bowl-food", "unit": "500g box",
     "unit_qty": 0.5, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("cereal", ""),
     "search_terms": ["cereal", "breakfast cereal", "cheerios"],
     "prices": {"nofrills": 4.49, "freshco": 3.99, "walmart": 4.27, "loblaws": 5.99, "metro": 5.29},
     "previous_price": 6.49},
    {"category_id": "yogurt", "name": "Yogurt", "icon": "yogurt", "unit": "500g tub",
     "unit_qty": 0.5, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("yogurt", ""),
     "search_terms": ["yogurt", "greek yogurt", "plain yogurt"],
     "prices": {"nofrills": 3.99, "freshco": 3.79, "walmart": 3.97, "loblaws": 4.99, "metro": 4.79},
     "previous_price": 5.49},
    {"category_id": "orange-juice", "name": "Orange Juice", "icon": "orange-juice", "unit": "1.89L carton",
     "unit_qty": 1.89, "standard_unit": "L",
     "image_url": IMAGE_URLS.get("orange-juice", ""),
     "search_terms": ["orange juice", "oj", "juice", "tropicana"],
     "prices": {"nofrills": 4.49, "freshco": 4.29, "walmart": 4.47, "loblaws": 5.49, "metro": 5.29},
     "previous_price": 5.99},
    {"category_id": "coffee", "name": "Coffee", "icon": "coffee", "unit": "340g ground",
     "unit_qty": 0.34, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("coffee", ""),
     "search_terms": ["coffee", "ground coffee", "folgers", "maxwell house"],
     "prices": {"nofrills": 8.99, "freshco": 8.49, "walmart": 8.97, "loblaws": 10.99, "metro": 10.49},
     "previous_price": 11.99},
    {"category_id": "sugar", "name": "Sugar", "icon": "sugar", "unit": "2kg bag",
     "unit_qty": 2, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("sugar", ""),
     "search_terms": ["sugar", "white sugar", "granulated sugar"],
     "prices": {"nofrills": 3.49, "freshco": 3.29, "walmart": 3.47, "loblaws": 4.49, "metro": 4.29},
     "previous_price": 4.99},
    {"category_id": "flour", "name": "Flour", "icon": "flour", "unit": "2.5kg bag",
     "unit_qty": 2.5, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("flour", ""),
     "search_terms": ["flour", "all purpose flour", "baking flour", "white flour"],
     "prices": {"nofrills": 4.49, "freshco": 4.29, "walmart": 4.47, "loblaws": 5.49, "metro": 5.29},
     "previous_price": 5.99},
    {"category_id": "cooking-oil", "name": "Cooking Oil", "icon": "cooking-oil", "unit": "1L vegetable oil",
     "unit_qty": 1, "standard_unit": "L",
     "image_url": IMAGE_URLS.get("cooking-oil", ""),
     "search_terms": ["cooking oil", "vegetable oil", "canola oil", "oil"],
     "prices": {"nofrills": 4.29, "freshco": 3.99, "walmart": 4.27, "loblaws": 5.29, "metro": 4.99},
     "previous_price": 5.79},
    {"category_id": "frozen-pizza", "name": "Frozen Pizza", "icon": "frozen-pizza", "unit": "single pizza",
     "unit_qty": 1, "standard_unit": "pizza",
     "image_url": IMAGE_URLS.get("frozen-pizza", ""),
     "search_terms": ["frozen pizza", "pizza", "delissio", "dr oetker"],
     "prices": {"nofrills": 5.99, "freshco": 5.49, "walmart": 5.97, "loblaws": 7.99, "metro": 7.49},
     "previous_price": 8.49},
    {"category_id": "ice-cream", "name": "Ice Cream", "icon": "ice-cream", "unit": "1.5L tub",
     "unit_qty": 1.5, "standard_unit": "L",
     "image_url": IMAGE_URLS.get("ice-cream", ""),
     "search_terms": ["ice cream", "frozen dessert", "breyers", "chapman's"],
     "prices": {"nofrills": 4.99, "freshco": 4.79, "walmart": 4.97, "loblaws": 6.49, "metro": 5.99},
     "previous_price": 6.99},
    {"category_id": "bacon", "name": "Bacon", "icon": "bacon", "unit": "375g pack",
     "unit_qty": 0.375, "standard_unit": "kg",
     "image_url": IMAGE_URLS.get("bacon", ""),
     "search_terms": ["bacon", "pork bacon", "breakfast bacon", "maple leaf"],
     "prices": {"nofrills": 6.99, "freshco": 6.49, "walmart": 6.97, "loblaws": 8.49, "metro": 7.99},
     "previous_price": 9.49},
    {"category_id": "lettuce", "name": "Lettuce", "icon": "lettuce", "unit": "1 head",
     "unit_qty": 1, "standard_unit": "head",
     "image_url": IMAGE_URLS.get("lettuce", ""),
     "search_terms": ["lettuce", "iceberg lettuce", "romaine", "salad"],
     "prices": {"nofrills": 2.49, "freshco": 2.29, "walmart": 2.47, "loblaws": 3.49, "metro": 2.99},
     "previous_price": 3.79}
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
