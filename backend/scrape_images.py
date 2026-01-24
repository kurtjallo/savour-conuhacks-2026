"""
One-time script to scrape product images using Firecrawl
Run this ONCE to populate image URLs in the database
"""
import os
from dotenv import load_dotenv
from firecrawl import FirecrawlApp
from database import categories_collection
import asyncio

load_dotenv()

FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")
app = FirecrawlApp(api_key=FIRECRAWL_API_KEY)

# Target URLs for each category (example: No Frills product pages)
CATEGORY_URLS = {
    "eggs": "https://www.nofrills.ca/search?search-bar=eggs",
    "milk": "https://www.nofrills.ca/search?search-bar=milk",
    "bread": "https://www.nofrills.ca/search?search-bar=bread",
    "butter": "https://www.nofrills.ca/search?search-bar=butter",
    # Add all 15 categories...
}

async def scrape_and_save_images():
    """Scrape product images and save to database"""
    
    for category_id, url in CATEGORY_URLS.items():
        print(f"Scraping {category_id}...")
        
        try:
            # Scrape page with Firecrawl
            result = app.scrape_url(url, params={
                'formats': ['screenshot', 'html'],
                'onlyMainContent': True
            })
            
            # Extract first product image (you'll need to parse HTML)
            # This is a simplified example - adjust based on actual HTML structure
            image_url = extract_product_image(result.get('html', ''))
            
            if image_url:
                # Update MongoDB with image URL
                await categories_collection.update_one(
                    {"category_id": category_id},
                    {"$set": {"image_url": image_url}}
                )
                print(f"✓ Saved image for {category_id}: {image_url}")
            else:
                print(f"✗ No image found for {category_id}")
                
        except Exception as e:
            print(f"Error scraping {category_id}: {e}")

def extract_product_image(html: str) -> str:
    """
    Parse HTML to find product image
    You'll need to inspect the actual page structure
    """
    # Example: look for common patterns
    # This will vary based on the store website
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')
    
    # Try to find product image
    img = soup.select_one('.product-image img, .product-tile img, [data-testid="product-image"]')
    if img and img.get('src'):
        return img['src']
    
    return None

if __name__ == "__main__":
    asyncio.run(scrape_and_save_images())
