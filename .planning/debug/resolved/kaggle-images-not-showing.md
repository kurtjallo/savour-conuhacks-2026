---
status: resolved
trigger: "Product images showing Unsplash placeholders instead of Kaggle dataset images"
created: 2026-01-24T00:00:00Z
updated: 2026-01-24T00:06:00Z
---

## Current Focus

hypothesis: CONFIRMED - seed_db.py uses Unsplash URLs, not Kaggle images
test: Fix implemented and verified
expecting: 8 categories show Kaggle images, remaining categories show Unsplash images
next_action: N/A - resolved

## Symptoms

expected: Images on product pages should load from the Kaggle grocery dataset
actual: Shows Unsplash placeholder images instead of Kaggle images
errors: No errors visible in browser console or terminal
reproduction: View any product page - images show Unsplash placeholders
started: Never worked - Kaggle images were never implemented/working

## Eliminated

## Evidence

- timestamp: 2026-01-24T00:00:30Z
  checked: backend/scripts/seed_db.py
  found: Lines 19-46 define IMAGE_URLS dict with hardcoded Unsplash URLs (images.unsplash.com)
  implication: This is why Unsplash images are showing - they are explicitly set in seed data

- timestamp: 2026-01-24T00:00:45Z
  checked: backend/scripts/copy_images.py
  found: Script exists to copy Kaggle images to static/images but only 4 images actually copied (apples, bananas, carrots, lettuce)
  implication: copy_images.py was partially run but incomplete

- timestamp: 2026-01-24T00:00:50Z
  checked: backend/GroceryStoreDataset/
  found: Kaggle dataset exists with images in test/Fruit/, test/Vegetables/, test/Packages/
  implication: Kaggle images are available locally

- timestamp: 2026-01-24T00:00:55Z
  checked: backend/static/images/
  found: Only 4 images present (apples.jpg, bananas.jpg, carrots.jpg, lettuce.jpg)
  implication: Most categories have no local image file

- timestamp: 2026-01-24T00:01:00Z
  checked: frontend/src/components/CategoryCard.tsx
  found: Component correctly checks category.image_url and displays it (lines 52-67)
  implication: Frontend is working correctly - it just receives Unsplash URLs from API

- timestamp: 2026-01-24T00:02:00Z
  checked: Kaggle dataset contents vs app categories
  found: Kaggle has ~10 items we can map (banana, apple, orange, onion, potato, carrot, lettuce/cabbage, tomato, milk, yogurt, juice). App has 25 categories total. Categories like eggs, bread, butter, chicken, ground-beef, pasta, rice, cheese, cereal, coffee, sugar, flour, cooking-oil, frozen-pizza, ice-cream, bacon have NO Kaggle images.
  implication: A hybrid approach needed - use Kaggle images where available, keep Unsplash as fallback for items not in Kaggle dataset

## Resolution

root_cause: The seed_db.py script used hardcoded Unsplash URLs in the IMAGE_URLS dict instead of URLs pointing to local static files from the Kaggle dataset. The copy_images.py script was created but only partially mapped categories and was never fully integrated. Additionally, the frontend was not prepending the API_BASE to relative URLs.

fix:
1. Updated copy_images.py to correctly map 8 categories to Kaggle images (with correct nested paths)
2. Ran copy_images.py to copy images to static/images/
3. Updated seed_db.py to use get_image_url() function that returns /static/images/{category_id}.jpg for Kaggle categories and Unsplash URLs for others
4. Re-ran seed_db.py to update MongoDB with new image URLs
5. Added resolveImageUrl() helper in frontend/src/lib/api.ts to prepend API_BASE to relative URLs
6. Updated 3 frontend components to use resolveImageUrl() for image sources

verification:
  - Frontend builds successfully (no TypeScript errors)
  - Database contains 8 Kaggle image URLs (/static/images/{category}.jpg)
  - Database contains 17 Unsplash fallback URLs for categories not in Kaggle dataset
  - Static images present: apples.jpg, bananas.jpg, lettuce.jpg, milk.jpg, onions.jpg, orange-juice.jpg, potatoes.jpg, yogurt.jpg
  - resolveImageUrl() function correctly prepends API_BASE to relative URLs
files_changed:
  - backend/scripts/copy_images.py
  - backend/scripts/seed_db.py
  - frontend/src/lib/api.ts
  - frontend/src/components/CategoryCard.tsx
  - frontend/src/screens/AllProductsScreen.tsx
  - frontend/src/screens/CategoryScreen.tsx
