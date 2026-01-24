#!/usr/bin/env python3
"""
Copy sample images from Kaggle dataset to static folder.
Maps app category_id to Kaggle dataset image paths.
For items not in Kaggle dataset, Unsplash URLs are used in seed_db.py.
"""
import shutil
import os
from pathlib import Path

# Mapping from our category_id to Kaggle dataset paths
# Only categories with matching Kaggle images are included here
CATEGORY_MAPPING = {
    # Fruits
    "bananas": "GroceryStoreDataset/dataset/test/Fruit/Banana",
    "apples": "GroceryStoreDataset/dataset/test/Fruit/Apple/Royal-Gala",

    # Vegetables
    "onions": "GroceryStoreDataset/dataset/test/Vegetables/Onion/Yellow-Onion",
    "potatoes": "GroceryStoreDataset/dataset/test/Vegetables/Potato/Solid-Potato",
    "lettuce": "GroceryStoreDataset/dataset/test/Vegetables/Cabbage",

    # Packages - images are in brand subdirectories
    "milk": "GroceryStoreDataset/dataset/test/Packages/Milk/Arla-Standard-Milk",
    "yogurt": "GroceryStoreDataset/dataset/test/Packages/Yoghurt/Yoggi-Vanilla-Yoghurt",
    "orange-juice": "GroceryStoreDataset/dataset/test/Packages/Juice/Bravo-Orange-Juice",
}

def copy_images():
    """Copy one image per category to static folder"""
    static_dir = Path("static/images")
    static_dir.mkdir(parents=True, exist_ok=True)
    
    for category_id, source_path in CATEGORY_MAPPING.items():
        source = Path(source_path)
        if not source.exists():
            print(f"⚠️  Skipping {category_id}: {source_path} not found")
            continue
            
        # Get first image from directory
        images = list(source.glob("*.jpg"))
        if not images:
            print(f"⚠️  No images found in {source_path}")
            continue
            
        first_image = images[0]
        dest = static_dir / f"{category_id}.jpg"
        
        shutil.copy(first_image, dest)
        print(f"✓ Copied {category_id}.jpg")

if __name__ == "__main__":
    copy_images()
    print("\n✅ Done! Images copied to static/images/")
