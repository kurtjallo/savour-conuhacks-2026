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

# Quebec/Montreal store chains with multiple locations per chain
STORE_CHAINS = [
    {
        "store_id": "superc",
        "name": "Super C",
        "color": "#FF6B00",
        "locations": [
            {"location_id": "superc_hochelaga", "address": "3190 Rue Sherbrooke E, Montreal, QC H1W 1C9", "lat": 45.5426, "lng": -73.5418},
            {"location_id": "superc_st_leonard", "address": "5975 Rue Jean-Talon E, Saint-Leonard, QC H1S 1M4", "lat": 45.5894, "lng": -73.5805},
            {"location_id": "superc_lasalle", "address": "7475 Blvd Newman, LaSalle, QC H8N 1X3", "lat": 45.4306, "lng": -73.6389},
            {"location_id": "superc_laval", "address": "1600 Blvd Le Corbusier, Laval, QC H7S 2K1", "lat": 45.5607, "lng": -73.7249},
        ]
    },
    {
        "store_id": "maxi",
        "name": "Maxi",
        "color": "#E31837",
        "locations": [
            {"location_id": "maxi_downtown", "address": "1500 Rue Sainte-Catherine O, Montreal, QC H3G 1S4", "lat": 45.4959, "lng": -73.5779},
            {"location_id": "maxi_villeray", "address": "7200 Rue Saint-Hubert, Montreal, QC H2R 2N3", "lat": 45.5393, "lng": -73.6186},
            {"location_id": "maxi_lasalle", "address": "7676 Blvd Newman, LaSalle, QC H8N 1X3", "lat": 45.4304, "lng": -73.6397},
            {"location_id": "maxi_laval", "address": "3100 Blvd Le Carrefour, Laval, QC H7T 2K7", "lat": 45.5569, "lng": -73.7467},
        ]
    },
    {
        "store_id": "iga",
        "name": "IGA",
        "color": "#D71920",
        "locations": [
            {"location_id": "iga_plateau", "address": "5252 Av du Parc, Montreal, QC H2V 4G7", "lat": 45.5228, "lng": -73.6078},
            {"location_id": "iga_ndg", "address": "5858 Sherbrooke St W, Montreal, QC H4A 1X3", "lat": 45.4683, "lng": -73.6147},
            {"location_id": "iga_rosemont", "address": "3696 Rue Masson, Montreal, QC H1X 1S6", "lat": 45.5500, "lng": -73.5750},
            {"location_id": "iga_verdun", "address": "4901 Rue Wellington, Verdun, QC H4G 1X6", "lat": 45.4575, "lng": -73.5714},
        ]
    },
    {
        "store_id": "provigo",
        "name": "Provigo",
        "color": "#E31837",
        "locations": [
            {"location_id": "provigo_mcgill", "address": "1425 Rue Bishop, Montreal, QC H3G 2E5", "lat": 45.4961, "lng": -73.5725},
            {"location_id": "provigo_westmount", "address": "4920 Rue de Maisonneuve O, Westmount, QC H3Z 1N3", "lat": 45.4796, "lng": -73.5994},
            {"location_id": "provigo_villeray", "address": "7101 Rue Saint-Denis, Montreal, QC H2R 1P4", "lat": 45.5381, "lng": -73.6118},
            {"location_id": "provigo_ahuntsic", "address": "360 Rue Fleury O, Montreal, QC H3L 1V3", "lat": 45.5493, "lng": -73.6507},
        ]
    },
    {
        "store_id": "metro",
        "name": "Metro",
        "color": "#003DA5",
        "locations": [
            {"location_id": "metro_downtown", "address": "1500 Rue Peel, Montreal, QC H3A 1S8", "lat": 45.5003, "lng": -73.5728},
            {"location_id": "metro_plateau", "address": "3575 Av du Parc, Montreal, QC H2X 3P9", "lat": 45.5116, "lng": -73.5780},
            {"location_id": "metro_mile_end", "address": "5650 Av du Parc, Montreal, QC H2V 4H2", "lat": 45.5253, "lng": -73.6093},
            {"location_id": "metro_cote_des_neiges", "address": "6700 Ch de la Cote-des-Neiges, Montreal, QC H3S 2B2", "lat": 45.4984, "lng": -73.6296},
        ]
    },
    {
        "store_id": "walmart",
        "name": "Walmart",
        "color": "#0071CE",
        "locations": [
            {"location_id": "walmart_marche_central", "address": "9180 Blvd de l'Academie, Montreal, QC H4N 3G4", "lat": 45.5336, "lng": -73.6608},
            {"location_id": "walmart_lasalle", "address": "7500 Blvd Newman, LaSalle, QC H8N 1X2", "lat": 45.4309, "lng": -73.6391},
            {"location_id": "walmart_anjou", "address": "7400 Blvd des Galeries d'Anjou, Anjou, QC H1M 3M2", "lat": 45.6087, "lng": -73.5495},
            {"location_id": "walmart_laval", "address": "3055 Blvd Le Carrefour, Laval, QC H7T 1C8", "lat": 45.5557, "lng": -73.7451},
        ]
    },
]

# Flattened list for backward compatibility (first location per chain)
STORES = []
for chain in STORE_CHAINS:
    first_loc = chain["locations"][0]
    STORES.append({
        "store_id": chain["store_id"],
        "name": chain["name"],
        "color": chain["color"],
        "address": first_loc["address"],
        "lat": first_loc["lat"],
        "lng": first_loc["lng"],
        "locations": chain["locations"]  # Include all locations
    })

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


def generate_store_prices(base_price):
    """Generate mixed prices for Quebec stores based on base price (from CSV).

    Randomized pricing - any store can have the best deal on any product.
    This creates a more realistic shopping experience where deals are spread
    across all stores, not just discount banners.
    """
    if not base_price or base_price <= 0:
        base_price = 2.99

    stores = ["superc", "maxi", "walmart", "iga", "provigo", "metro"]

    # Shuffle stores to randomize who gets the best price
    random.shuffle(stores)

    # Define price tiers (from cheapest to most expensive)
    price_tiers = [
        (0.78, 0.85),  # Tier 1: Best deal
        (0.82, 0.90),  # Tier 2: Great price
        (0.88, 0.96),  # Tier 3: Good price
        (0.94, 1.02),  # Tier 4: Average
        (0.98, 1.08),  # Tier 5: Slightly above average
        (1.02, 1.12),  # Tier 6: Premium
    ]

    prices = {}
    for i, store in enumerate(stores):
        low, high = price_tiers[i]
        prices[store] = round(base_price * random.uniform(low, high), 2)

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

    # Select diverse products - ESSENTIALS FIRST, then other items
    # Order matters! Products are added in keyword order, so essentials appear at top

    # TIER 1: Specific search patterns for basic essentials
    # These are tuples of (pattern, exclude_words) to allow per-keyword filtering
    essential_searches = [
        # Eggs - exclude chocolate/candy eggs
        (r'\beggs?,\s*(large|medium|extra large|small|free)', ['chocolate', 'candy', 'easter', 'surprise', 'mini']),
        (r'large.*eggs|eggs.*large', ['chocolate', 'candy', 'easter', 'surprise', 'mini']),
        # Milk
        (r'^milk,?\s*\d', []),  # "Milk, 2%" etc
        (r'homogenized milk|whole milk|skim milk', ['chocolate', 'almond', 'oat', 'soy', 'coconut']),
        # Butter
        (r'^butter,?\s*(salted|unsalted)?$', ['peanut', 'almond', 'cookie', 'spread']),
        (r'salted butter|unsalted butter', ['peanut', 'almond', 'cookie']),
        # Bread
        (r'^bread,?\s*(white|whole wheat|multigrain)?', ['crumb', 'pudding']),
        (r'white bread|whole wheat bread|sliced bread', ['crumb', 'pudding']),
        # Potatoes
        (r'^potatoes?,?\s*(russet|yellow|red|white)?', ['chip', 'fries', 'salad', 'mashed']),
        (r'russet potatoes|yellow potatoes|baking potatoes', ['chip', 'fries']),
        # Onions
        (r'^(red |yellow |white )?onions?,?\s*\d?', ['rings', 'powder', 'soup']),
        # Tomatoes
        (r'^(roma |vine |cherry )?tomatoes?', ['sauce', 'paste', 'soup', 'diced', 'canned']),
        # Carrots
        (r'^carrots?,?\s*\d?', ['cake', 'juice', 'baby']),
        # Lettuce
        (r'^(romaine |iceberg )?lettuce', ['salad mix']),
        # Garlic
        (r'^garlic\s*(bulbs?)?', ['powder', 'bread', 'sauce']),
        # Bananas
        (r'^bananas?,?\s*(bunch)?', ['chip', 'dried', 'pepper', 'sliced', 'frozen']),
        # Apples
        (r'^(gala |fuji |granny smith |honeycrisp )?apples?', ['juice', 'sauce', 'cider', 'pie', 'bar', 'strawberry', 'fruit']),
        # Chicken
        (r'chicken breast|chicken thigh|whole chicken', ['nugget', 'strip', 'finger', 'soup']),
        # Ground beef
        (r'(lean |extra lean )?ground beef', ['patty', 'burger']),
        # Rice
        (r'^(white |brown |jasmine |basmati )?rice,?\s*\d?', ['cake', 'crisp', 'pudding', 'cereal']),
        # Pasta
        (r'^(spaghetti|penne|fusilli|rigatoni|linguine|fettuccine)', ['sauce', 'salad']),
        # Flour
        (r'^(all.purpose |bread |whole wheat )?flour', ['tortilla']),
        # Sugar
        (r'^(white |brown |granulated )?sugar,?\s*\d?', ['free', 'substitute', 'cone', 'snap']),
        # Oil
        (r'^(vegetable |canola |olive |cooking )?oil', ['essential', 'baby', 'oregano', 'fish']),
        # Additional essential dairy
        (r'^cream,?\s*\d', ['ice', 'whipped', 'sour']),
        (r'^(whipping |heavy )?cream\b', ['ice', 'cheese', 'sour']),
        # Additional essential meats
        (r'^(boneless |bone-in )?pork chops?', ['breaded']),
        (r'^(beef )?steak', ['salisbury', 'cheese']),
        (r'^(sliced |deli )?turkey\b', ['ground', 'whole']),
        (r'^(sliced |deli )?ham\b', ['burger']),
        # Canned essentials
        (r'^(canned |diced |crushed )?tomatoes', ['sun-dried', 'fresh']),
        (r'^tomato (sauce|paste)', []),
    ]

    # TIER 2: More common items with exclusions
    tier2_searches = [
        (r'^(cheddar |mozzarella |parmesan )?cheese\b', ['spread', 'string', 'processed', 'slice', 'flavored', 'crisps', 'ball', 'puff']),
        (r'^(greek |plain )?yogurt', ['drink', 'tube', 'covered', 'flavour']),
        (r'^sour cream\b', ['dip', 'chips', 'chives']),
        (r'^broccoli\s*(crowns|florets)?$', ['slaw', 'salad', 'beef']),
        (r'^(bell |green |red |sweet )?peppers?\b', ['stuffed', 'roasted', 'pizza', 'jack', 'cayenne', 'hot']),
        (r'^(english )?cucumbers?\b', ['pickled', 'salad', 'mint', 'tea', 'facial']),
        (r'^celery\s*(hearts|stalks)?', ['salt', 'soup']),
        (r'^(baby )?spinach\b', ['dip', 'salad', 'artichoke']),
        (r'^(green |red |napa )?cabbage\b', ['roll', 'slaw', 'corned']),
        (r'^(sweet |canned )?corn\b', ['chip', 'flakes', 'syrup', 'beef', 'nut', 'dog']),
        (r'^mushrooms?\b', ['soup', 'sauce', 'truffle', 'stuffing']),
        (r'^ginger\b', ['ale', 'snap', 'cookie']),
        (r'^(navel )?oranges?\b', ['juice', 'mango', 'sparkling']),
        (r'^lemons?\b', ['juice', 'aid', 'iced', 'tea']),
        (r'^(red |green )?grapes\b', ['juice', 'jelly']),
        (r'^strawberries\b', ['jam', 'syrup']),
        (r'^blueberries\b', ['jam', 'muffin']),
        (r'^avocados?\b', ['oil', 'dip', 'chunk']),
        (r'^(pork )?(loin|chops|tenderloin)', ['processed']),
        (r'^(atlantic |wild |fresh )?salmon\b', ['smoked', 'canned', 'sashimi']),
        (r'^bacon\b', ['bits', 'flavour']),
        (r'^sausages?\b', ['roll']),
        (r'^bagels?\b', ['chips', 'seasoning']),
        (r'^(flour |corn )?tortillas?\b', ['chips']),
        (r'^(hamburger |hot dog )?buns\b', []),
        # Additional produce
        (r'^zucchini\b', ['bread', 'noodle']),
        (r'^(butternut |acorn |spaghetti )?squash\b', ['drink']),
        (r'^asparagus\b', ['soup']),
        (r'^kale\b', ['chips', 'smoothie']),
        (r'^(green |string )?beans\b', ['coffee', 'jelly', 'baked', 'refried']),
        (r'^(frozen |canned |green )?peas\b', ['split', 'soup']),
        (r'^cauliflower\b', ['rice', 'pizza']),
        (r'^(sweet )?potatoes?\b', ['chip', 'fries']),
        # Additional fruits
        (r'^watermelon\b', ['juice', 'candy']),
        (r'^cantaloupe\b', []),
        (r'^(peaches|nectarines)\b', ['canned', 'cobbler']),
        (r'^pears?\b', ['juice', 'canned']),
        (r'^plums?\b', ['sauce']),
        (r'^raspberries\b', ['jam', 'syrup']),
        (r'^(fresh |frozen )?mango\b', ['juice', 'chutney']),
        (r'^(fresh |canned )?pineapple\b', ['juice', 'upside']),
        (r'^limes?\b', ['juice', 'key']),
        (r'^(clementines|mandarins|tangerines)\b', []),
        # Additional dairy
        (r'^cream cheese\b', ['flavored', 'spread']),
        (r'^cottage cheese\b', []),
        (r'^(half.and.half|half & half)\b', []),
        (r'^(almond |oat |soy |coconut )milk\b', ['chocolate']),
        # Additional meats and seafood
        (r'^(ground |minced )chicken\b', []),
        (r'^(ground |minced )pork\b', []),
        (r'^(ground |minced )turkey\b', []),
        (r'^(fresh |frozen )?shrimp\b', ['paste', 'chips']),
        (r'^(fresh |frozen )?tilapia\b', []),
        (r'^(canned )?tuna\b', ['salad', 'helper']),
        (r'^(fresh |frozen )?cod\b', ['liver']),
        (r'^chicken (wings|drumsticks|legs)\b', ['buffalo']),
        (r'^(beef |pork )?ribs\b', ['short']),
        (r'^roast (beef|pork|chicken)\b', []),
    ]

    # TIER 3: Pantry staples
    tier3_searches = [
        (r'^table salt|^salt,?\s*\d', ['free', 'substitute']),
        (r'^(white |balsamic |apple cider )?vinegar', []),
        (r'^ketchup', []),
        (r'^mustard', ['greens', 'seed']),
        (r'^(canned |black |kidney |pinto )?beans', ['coffee', 'jelly']),
        (r'^(chicken |beef |vegetable )?broth', []),
        (r'^cereal', ['bar']),
        (r'^(rolled |quick |steel cut )?oats', ['milk', 'bar']),
        (r'^(ground |instant )?coffee', ['creamer', 'cake']),
        (r'^(black |green |herbal )?tea\s*(bags)?', ['iced']),
        (r'^(orange |apple )?juice', ['box']),
        (r'^honey,?\s*\d?', ['mustard', 'garlic']),
        (r'^(strawberry |grape )?jam', []),
        (r'^peanut butter', ['cup', 'cookie']),
        # Additional condiments
        (r'^mayonnaise|^mayo\b', ['vegan']),
        (r'^(bbq|barbecue) sauce\b', []),
        (r'^soy sauce\b', ['low']),
        (r'^hot sauce\b', []),
        (r'^(ranch |caesar |italian )?salad dressing\b', []),
        (r'^(pure |real )?maple syrup\b', ['flavored']),
        (r'^worcestershire sauce\b', []),
        (r'^teriyaki sauce\b', []),
        (r'^sriracha\b', []),
        (r'^relish\b', []),
        (r'^(dill |bread.and.butter )?pickles\b', []),
        (r'^(green |black |kalamata )?olives\b', []),
        # Baking essentials
        (r'^baking powder\b', []),
        (r'^baking soda\b', []),
        (r'^(active dry |instant )?yeast\b', ['nutritional']),
        (r'^(unsweetened )?cocoa powder\b', []),
        (r'^(pure )?vanilla extract\b', []),
        (r'^cornstarch\b', []),
        (r'^(icing |powdered |confectioner.s )?sugar\b', []),
        # Additional grains
        (r'^quinoa\b', ['salad']),
        (r'^couscous\b', ['salad']),
        (r'^(plain |italian |panko )?bread crumbs\b', []),
        (r'^(elbow )?macaroni\b', ['cheese', 'salad']),
        (r'^egg noodles\b', []),
        (r'^(instant |cup )?ramen\b', []),
        # Canned goods
        (r'^(canned )?chickpeas\b', ['hummus']),
        (r'^(canned )?lentils\b', ['soup']),
        (r'^(canned )?coconut milk\b', []),
        (r'^(cream of )?(mushroom |chicken |tomato )?soup\b', []),
        (r'^(canned )?corn\b', ['chip', 'flakes', 'syrup']),
        # Spices
        (r'^(ground |black )?pepper\b', ['bell', 'hot', 'cayenne', 'stuffed']),
        (r'^(ground )?cinnamon\b', ['roll', 'bun']),
        (r'^(ground )?cumin\b', []),
        (r'^paprika\b', []),
        (r'^(italian |dried )?oregano\b', []),
        (r'^(dried )?basil\b', []),
        (r'^(garlic |onion )?powder\b', []),
        (r'^chili powder\b', []),
        (r'^bay leaves\b', []),
        (r'^(dried )?thyme\b', []),
        (r'^(dried )?rosemary\b', []),
    ]

    # TIER 4: Nice to have
    tier4_searches = [
        (r'^(potato )?chips', []),
        (r'^crackers', []),
        (r'^(chocolate chip )?cookies', []),
        (r'^(milk |dark )?chocolate', ['cake', 'milk', 'spread']),
        (r'^ice cream', ['sandwich', 'bar', 'cone']),
        (r'^(frozen )?pizza', []),
        (r'^(spring |bottled )?water', ['coconut', 'sparkling']),
        # Additional frozen foods
        (r'^frozen (vegetables|veggies)\b', []),
        (r'^frozen (fruit|berries)\b', []),
        (r'^frozen (chicken|fish) (fillets|breasts)\b', []),
        (r'^(fish |chicken )?nuggets\b', []),
        (r'^fish sticks\b', []),
        (r'^frozen (fries|french fries)\b', []),
        (r'^(frozen )?waffles\b', []),
        (r'^(frozen )?burritos\b', []),
        (r'^(frozen )?pie\b', ['pizza']),
        # Additional snacks
        (r'^granola bars?\b', []),
        (r'^(mixed |trail )?nuts\b', ['donut', 'doughnut']),
        (r'^trail mix\b', []),
        (r'^(microwave )?popcorn\b', []),
        (r'^pretzels\b', []),
        (r'^(corn |tortilla )?chips\b', ['chocolate']),
        (r'^salsa\b', []),
        (r'^hummus\b', []),
        (r'^guacamole\b', []),
        # Beverages
        (r'^sparkling water\b', []),
        (r'^(cola|soda|pop)\b', ['baking']),
        (r'^(ginger ale|ginger beer)\b', []),
        (r'^(sports |energy )?drink\b', ['yogurt', 'mixed']),
        (r'^(apple |grape |cranberry )?juice\b', ['orange']),
        (r'^(chocolate |strawberry )?milk\b', ['almond', 'oat', 'soy']),
        # Breakfast items
        (r'^(breakfast |pork )?sausage\b', ['roll', 'italian']),
        (r'^(english )?muffins\b', []),
        (r'^pancake mix\b', []),
        (r'^(maple )?syrup\b', ['cough', 'corn']),
        (r'^(granola|muesli)\b', ['bar']),
        # Deli items
        (r'^(rotisserie |roasted )?chicken\b', ['breast', 'thigh', 'wing', 'soup', 'stock', 'broth']),
        (r'^(sliced |deli )?(roast beef|turkey|ham|salami|pepperoni)\b', []),
        # Misc essentials
        (r'^(paper )?towels\b', []),
        (r'^(toilet |bathroom )paper\b', []),
        (r'^(dish |laundry )?detergent\b', []),
        (r'^(plastic |garbage |trash )?bags\b', ['chip', 'snack']),
        (r'^(aluminum |tin )?foil\b', []),
        (r'^(plastic |cling )?wrap\b', []),
    ]

    def matches_search(title, pattern, excludes):
        """Check if title matches pattern and doesn't contain excluded words."""
        title_lower = title.lower().strip()
        import re
        if not re.search(pattern, title_lower):
            return False
        return not any(excl in title_lower for excl in excludes)

    selected_products = []
    used_titles = set()

    # First pass: get ONE product per essential search
    for pattern, excludes in essential_searches:
        if len(selected_products) >= 1000:
            break
        for _, row in df.iterrows():
            title = row['title']
            if title not in used_titles and matches_search(title, pattern, excludes):
                selected_products.append(row)
                used_titles.add(title)
                break

    # Second pass: get ONE product per tier2 search
    for pattern, excludes in tier2_searches:
        if len(selected_products) >= 1000:
            break
        for _, row in df.iterrows():
            title = row['title']
            if title not in used_titles and matches_search(title, pattern, excludes):
                selected_products.append(row)
                used_titles.add(title)
                break

    # Third pass: get ONE product per tier3 search
    for pattern, excludes in tier3_searches:
        if len(selected_products) >= 1000:
            break
        for _, row in df.iterrows():
            title = row['title']
            if title not in used_titles and matches_search(title, pattern, excludes):
                selected_products.append(row)
                used_titles.add(title)
                break

    # Fourth pass: get ONE product per tier4 search
    for pattern, excludes in tier4_searches:
        if len(selected_products) >= 1000:
            break
        for _, row in df.iterrows():
            title = row['title']
            if title not in used_titles and matches_search(title, pattern, excludes):
                selected_products.append(row)
                used_titles.add(title)
                break

    # Fifth pass: fill remaining with any products that have images
    all_searches = essential_searches + tier2_searches + tier3_searches + tier4_searches
    for pattern, excludes in all_searches:
        if len(selected_products) >= 1000:
            break
        for _, row in df.iterrows():
            if len(selected_products) >= 1000:
                break
            title = row['title']
            if title not in used_titles and matches_search(title, pattern, excludes):
                selected_products.append(row)
                used_titles.add(title)

    # Second pass: fill remaining slots with other products
    if len(selected_products) < 1000:
        remaining = df[~df['title'].isin(used_titles)]
        for _, row in remaining.iterrows():
            if len(selected_products) >= 1000:
                break
            selected_products.append(row)

    print(f"Selected {len(selected_products)} diverse products")
    return selected_products


def generate_deals(prices):
    """Generate deals for ~25% of products with 15-35% off at random stores."""
    if random.random() > 0.25:  # 75% chance of no deals
        return {}

    deals = {}
    # Pick 1-2 random stores to have deals
    num_deals = random.randint(1, 2)
    deal_stores = random.sample(list(prices.keys()), min(num_deals, len(prices)))

    for store_id in deal_stores:
        regular_price = prices[store_id]
        discount = random.uniform(0.15, 0.35)  # 15-35% off
        sale_price = round(regular_price * (1 - discount), 2)

        # Deal ends in 3-14 days
        from datetime import datetime, timedelta
        end_date = datetime.now() + timedelta(days=random.randint(3, 14))

        deals[store_id] = {
            "sale_price": sale_price,
            "regular_price": regular_price,
            "ends": end_date.strftime("%Y-%m-%d")
        }

    return deals


def create_categories_from_csv():
    """Create category documents from CSV data."""
    products = load_products_from_csv()
    categories = []

    for idx, row in enumerate(products):
        title = row['title']
        loblaws_price = float(row['pricing.price']) if pd.notna(row['pricing.price']) else 2.99
        image_url = extract_image_url(row['productImage'])
        package_sizing = row['packageSizing'] if pd.notna(row['packageSizing']) else "1 ea"
        brand = row['brand'] if pd.notna(row['brand']) else ""

        # Create category_id from title
        category_id = slugify(title)

        # Generate prices for all stores
        prices = generate_store_prices(loblaws_price)

        # Generate deals for some products
        deals = generate_deals(prices)

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
            "deals": deals,  # Add deals
            "previous_price": previous_price,
            "sort_order": idx,  # Maintain essentials-first ordering
        }

        categories.append(category)

    return categories


def seed_database():
    from datetime import datetime

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
        db.metadata.delete_many({})

        print(f"Inserting {len(STORES)} stores...")
        db.stores.insert_many(STORES)

        print("\nLoading products from Loblaws CSV...")
        categories = create_categories_from_csv()

        if not categories:
            print("ERROR: No categories created from CSV")
            return False

        print(f"Inserting {len(categories)} categories...")
        db.categories.insert_many(categories)

        # Insert metadata with last_updated timestamp
        print("Adding metadata...")
        db.metadata.insert_one({
            "key": "prices",
            "last_updated": datetime.utcnow().isoformat() + "Z",
            "source": "Loblaws CSV + generated prices"
        })

        print(f"\nVerification:")
        print(f"  stores: {db.stores.count_documents({})} documents")
        print(f"  categories: {db.categories.count_documents({})} documents")
        print(f"  metadata: {db.metadata.count_documents({})} documents")

        # Count products with deals
        deals_count = db.categories.count_documents({"deals": {"$ne": {}}})
        print(f"  products with deals: {deals_count}")

        # Show sample products
        print("\nSample products:")
        for cat in list(db.categories.find().limit(5)):
            cheapest = min(cat["prices"].items(), key=lambda x: x[1])
            deal_info = f" (DEAL!)" if cat.get("deals") else ""
            print(f"  {cat['name'][:40]}: ${cheapest[1]:.2f} at {cheapest[0]}{deal_info}")
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
