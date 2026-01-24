# Phase 1: Data Setup

## Objective
Set up MongoDB Atlas database with seed data for 5 Canadian grocery stores and 15 product categories with realistic prices.

## Tasks

### Task 1: Create seed script with store and category data
**Files:** `backend/scripts/seed_db.py`, `backend/requirements.txt`, `backend/.env.example`

### Task 2: Run seed script to populate MongoDB
**Requires:** User has MongoDB Atlas cluster and connection string

### Task 3: Verify data via MongoDB query

## Store Data (5 stores)
```python
STORES = [
    {"store_id": "nofrills", "name": "No Frills", "color": "#FFD700"},
    {"store_id": "freshco", "name": "FreshCo", "color": "#00A650"},
    {"store_id": "walmart", "name": "Walmart", "color": "#0071CE"},
    {"store_id": "loblaws", "name": "Loblaws", "color": "#E31837"},
    {"store_id": "metro", "name": "Metro", "color": "#003DA5"}
]
```

## Category Data (15 products with prices)
```python
CATEGORIES = [
    {"category_id": "eggs", "name": "Eggs", "icon": "egg", "unit": "dozen",
     "prices": {"nofrills": 4.49, "freshco": 4.29, "walmart": 4.47, "loblaws": 5.29, "metro": 5.49}},
    {"category_id": "milk", "name": "Milk (2%)", "icon": "milk", "unit": "4L",
     "prices": {"nofrills": 5.49, "freshco": 5.49, "walmart": 5.47, "loblaws": 5.99, "metro": 6.29}},
    {"category_id": "bread", "name": "Bread", "icon": "bread-slice", "unit": "loaf",
     "prices": {"nofrills": 2.49, "freshco": 2.29, "walmart": 2.47, "loblaws": 3.49, "metro": 3.29}},
    {"category_id": "butter", "name": "Butter", "icon": "cube", "unit": "454g",
     "prices": {"nofrills": 5.99, "freshco": 5.79, "walmart": 5.97, "loblaws": 6.99, "metro": 6.79}},
    {"category_id": "apples", "name": "Apples", "icon": "apple-whole", "unit": "per lb",
     "prices": {"nofrills": 1.49, "freshco": 1.29, "walmart": 1.47, "loblaws": 1.99, "metro": 1.79}},
    {"category_id": "bananas", "name": "Bananas", "icon": "banana", "unit": "per lb",
     "prices": {"nofrills": 0.69, "freshco": 0.59, "walmart": 0.67, "loblaws": 0.79, "metro": 0.74}},
    {"category_id": "potatoes", "name": "Potatoes", "icon": "potato", "unit": "10lb bag",
     "prices": {"nofrills": 4.99, "freshco": 4.49, "walmart": 4.97, "loblaws": 6.99, "metro": 5.99}},
    {"category_id": "onions", "name": "Onions", "icon": "onion", "unit": "3lb bag",
     "prices": {"nofrills": 2.99, "freshco": 2.49, "walmart": 2.97, "loblaws": 3.99, "metro": 3.49}},
    {"category_id": "chicken", "name": "Chicken Breast", "icon": "drumstick-bite", "unit": "per kg",
     "prices": {"nofrills": 13.21, "freshco": 11.00, "walmart": 12.10, "loblaws": 15.39, "metro": 14.30}},
    {"category_id": "ground-beef", "name": "Ground Beef", "icon": "burger", "unit": "per kg",
     "prices": {"nofrills": 11.00, "freshco": 9.90, "walmart": 10.56, "loblaws": 13.21, "metro": 12.10}},
    {"category_id": "pasta", "name": "Pasta", "icon": "utensils", "unit": "900g",
     "prices": {"nofrills": 1.99, "freshco": 1.79, "walmart": 1.97, "loblaws": 2.99, "metro": 2.49}},
    {"category_id": "rice", "name": "Rice", "icon": "bowl-rice", "unit": "2kg",
     "prices": {"nofrills": 4.49, "freshco": 3.99, "walmart": 4.27, "loblaws": 5.99, "metro": 5.49}},
    {"category_id": "cheese", "name": "Cheese", "icon": "cheese", "unit": "400g block",
     "prices": {"nofrills": 6.49, "freshco": 5.99, "walmart": 6.27, "loblaws": 7.99, "metro": 7.49}},
    {"category_id": "canned-tomatoes", "name": "Canned Tomatoes", "icon": "jar", "unit": "796ml",
     "prices": {"nofrills": 1.29, "freshco": 0.99, "walmart": 1.27, "loblaws": 1.99, "metro": 1.79}},
    {"category_id": "cereal", "name": "Cereal", "icon": "bowl-food", "unit": "500g box",
     "prices": {"nofrills": 4.49, "freshco": 3.99, "walmart": 4.27, "loblaws": 5.99, "metro": 5.29}}
]
```

## Success Criteria
- [ ] MongoDB Atlas cluster accessible
- [ ] `stores` collection has 5 documents
- [ ] `categories` collection has 15 documents
- [ ] Each category has prices from all 5 stores
