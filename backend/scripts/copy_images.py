#!/usr/bin/env python3
"""
Copy sample images from Kaggle dataset to static folder
"""
import shutil
import os
from pathlib import Path

# Mapping from our category_id to Kaggle dataset paths
CATEGORY_MAPPING = {
    "bananas": "GroceryStoreDataset/dataset/test/Fruit/Banana",
    "apples": "GroceryStoreDataset/dataset/test/Fruit/Apple/Royal-Gala",
    "onions": "GroceryStoreDataset/dataset/test/Vegetables/Onion",
    "potatoes": "GroceryStoreDataset/dataset/test/Vegetables/Potato",
    "carrots": "GroceryStoreDataset/dataset/test/Vegetables/Carrots",
    "milk": "GroceryStoreDataset/dataset/test/Packages/Milk",
    "yogurt": "GroceryStoreDataset/dataset/test/Packages/Yoghurt",
    "orange-juice": "GroceryStoreDataset/dataset/test/Packages/Juice",
    "lettuce": "GroceryStoreDataset/dataset/test/Vegetables/Cabbage",  # closest match
    # Add remaining categories with closest matches
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
