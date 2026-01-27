"""
Copyright (c) 2026 Savour. All Rights Reserved.

This software and associated documentation files are proprietary and confidential.
Unauthorized copying, distribution, modification, or use of this software,
via any medium, is strictly prohibited without express written permission from Savour.
"""

import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv


load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")
client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
db = client.inflationfighter

stores_collection = db.stores
categories_collection = db.categories
metadata_collection = db.metadata
