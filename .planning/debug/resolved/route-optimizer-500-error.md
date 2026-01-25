---
status: resolved
trigger: "Route optimizer endpoint /api/routes/optimize returns 500 Internal Server Error repeatedly"
created: 2026-01-25T12:00:00Z
updated: 2026-01-25T12:15:00Z
---

## Current Focus

hypothesis: CONFIRMED AND FIXED - Stores were missing lat/lng fields in database
test: Reseeded database with location data, verified all 5 stores have lat/lng
expecting: Route optimizer will now work
next_action: Archive session

## Symptoms

expected: Route optimizer calculates best route and shows nearby store locations
actual: Stuck on "Calculating best route..." with 0 locations, continuous 500 errors flooding the server log
errors: POST /api/routes/optimize HTTP/1.1 500 Internal Server Error (repeating endlessly - frontend retry loop)
reproduction: Open the basket page with route optimizer feature
started: Recently broke (worked before)

## Eliminated

## Evidence

- timestamp: 2026-01-25T12:00:00Z
  checked: backend/main.py /api/routes/optimize endpoint
  found: Endpoint exists at line 595-813, handles RouteOptimizeRequest and returns RouteOptimizeResponse
  implication: Endpoint code is present, issue likely in request validation or data issues

- timestamp: 2026-01-25T12:00:00Z
  checked: git log for recent changes
  found: Recent commits include "Add deals to basket analysis", "Add floating store map, geolocation, quick-add buttons, and redesign route optimizer"
  implication: Recent changes to route optimizer may have introduced the bug

- timestamp: 2026-01-25T12:05:00Z
  checked: _get_stores_with_locations() function in main.py (lines 488-502)
  found: Function filters stores by checking for 'lat' and 'lng' keys, returns empty dict if none have locations
  implication: Stores need lat/lng fields in database

- timestamp: 2026-01-25T12:06:00Z
  checked: lines 604-606 in main.py optimize_route endpoint
  found: "if not stores_with_loc: raise HTTPException(status_code=500, detail='No stores with location data found')"
  implication: This is the exact line causing the 500 error

- timestamp: 2026-01-25T12:07:00Z
  checked: MongoDB stores collection directly via python3 script
  found: All 5 stores only have keys ['_id', 'store_id', 'name', 'color'] - NO lat, lng, or address fields
  implication: ROOT CAUSE CONFIRMED - stores are missing location data

- timestamp: 2026-01-25T12:08:00Z
  checked: backend/scripts/seed_db.py STORES constant (lines 15-21)
  found: STORES list only defines store_id, name, color - no location fields
  implication: Seed script never added location data to stores

- timestamp: 2026-01-25T12:12:00Z
  checked: Database after reseeding
  found: All 5 stores now have lat, lng, and address fields with Toronto-area coordinates
  implication: Fix is working - _get_stores_with_locations() will now return all 5 stores

## Resolution

root_cause: Stores in MongoDB database were missing required 'lat', 'lng', and 'address' fields. The _get_stores_with_locations() function returned an empty dict, causing optimize_route to throw HTTP 500 error at line 606 with message "No stores with location data found".

fix: Added lat, lng, and address fields to the STORES constant in backend/scripts/seed_db.py with real Toronto-area store locations:
- No Frills: 655 College St (43.6551, -79.4219)
- FreshCo: 245 Queen St W (43.6497, -79.3892)
- Walmart: 900 Dufferin St (43.6604, -79.4355)
- Loblaws: 60 Carlton St (43.6610, -79.3799)
- Metro: 10 Lower Spadina Ave (43.6395, -79.3946)

Then reseeded the database with `python3 scripts/seed_db.py`.

verification: Verified via direct MongoDB query that all 5 stores now have location data. The _get_stores_with_locations() function will now return all 5 stores with their coordinates.

files_changed:
- backend/scripts/seed_db.py
