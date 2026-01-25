#!/usr/bin/env python3
"""
Safe update script to add location data to existing stores.

SAFETY: This script uses ONLY update_one() with $set operator.
        It does NOT delete any data.
"""

import os
import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

# Toronto store locations
STORE_LOCATIONS = {
    "nofrills": {
        "address": "45 Overlea Blvd, Toronto, ON",
        "lat": 43.7054,
        "lng": -79.3378
    },
    "freshco": {
        "address": "1750 Brimley Rd, Scarborough, ON",
        "lat": 43.7701,
        "lng": -79.2629
    },
    "walmart": {
        "address": "900 Dufferin St, Toronto, ON",
        "lat": 43.6629,
        "lng": -79.4350
    },
    "loblaws": {
        "address": "60 Carlton St, Toronto, ON",
        "lat": 43.6615,
        "lng": -79.3780
    },
    "metro": {
        "address": "10 Lower Jarvis St, Toronto, ON",
        "lat": 43.6480,
        "lng": -79.3715
    }
}


def update_store_locations():
    """Add location fields to existing store documents using $set (safe update)."""
    uri = os.getenv("MONGODB_URI")
    if not uri:
        print("ERROR: MONGODB_URI not found in environment")
        return False

    try:
        print("Connecting to MongoDB Atlas...")
        client = MongoClient(uri, tlsCAFile=certifi.where())
        client.admin.command('ping')
        print("Connected!")

        db = client.inflationfighter

        # SAFETY CHECK: Verify categories collection still has data
        category_count = db.categories.count_documents({})
        print(f"\nSafety check: categories collection has {category_count} documents")
        if category_count < 900:
            print("WARNING: Categories count seems low. Aborting to be safe.")
            return False

        # Verify stores exist before updating
        store_count = db.stores.count_documents({})
        print(f"Stores collection has {store_count} documents")
        if store_count == 0:
            print("ERROR: No stores found in database. Cannot update.")
            return False

        print("\nUpdating store locations (using $set only - NO deletions)...")
        for store_id, location in STORE_LOCATIONS.items():
            result = db.stores.update_one(
                {"store_id": store_id},
                {"$set": {
                    "address": location["address"],
                    "lat": location["lat"],
                    "lng": location["lng"]
                }}
            )
            if result.matched_count == 0:
                print(f"  {store_id}: NOT FOUND (skipped)")
            elif result.modified_count > 0:
                print(f"  {store_id}: UPDATED with location ({location['lat']}, {location['lng']})")
            else:
                print(f"  {store_id}: already has location data (unchanged)")

        # Verify updates
        print("\nVerification - stores with locations:")
        for store in db.stores.find({}):
            lat = store.get("lat", "N/A")
            lng = store.get("lng", "N/A")
            address = store.get("address", "N/A")
            print(f"  {store['store_id']}: ({lat}, {lng}) - {address}")

        # Final safety check
        final_category_count = db.categories.count_documents({})
        print(f"\nFinal safety check: categories collection has {final_category_count} documents")

        print("\nSTORE LOCATIONS UPDATED SUCCESSFULLY!")
        return True

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    update_store_locations()
