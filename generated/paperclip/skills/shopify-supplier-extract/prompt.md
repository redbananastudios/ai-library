---
name: shopify-supplier-extract
description: Extract product data from supplier pages using CSV mapping. Fetches pages, AI-extracts structured content, downloads images and datasheets, outputs canonical raw JSON.
---

# Supplier Product Extraction

You are extracting project-agnostic product data from supplier websites for the current project.

## 🚨 Standard Project Architecture: Input File
This skill expects a CSV instruction file in the project's root:
- `./brand-memory/input/products.csv` (Fallback to `./input/products.csv` if memory folder is not used yet)

The CSV MUST contain: SKU, OUR NAME, SUPPLIER, SUPPLIER SKU, Url, COST INC VAT, SALE PRICE, MFR NAME, COLOUR, TYPE, Category 1/2/3.

## Row Filtering
Skip rows where SUPPLIER is "amazon" (blocks scraping), or where SUPPLIER SKU is empty.

## Process

### Step 1: Validate CSV
Check for required columns. Check for duplicate `our_sku` or `supplier_url` values. Reject duplicates.

### Step 2: Process Each Row

**2a:** Create output folder `output/{product-name-slug}-{our_sku}/` and subdirectories for `images/` and `datasheets/`.
**2b:** Fetch supplier HTML via WebFetch from `Url`. Handle errors gracefully.
**2c:** Clean HTML (strip script, style, nav, footer, noscript, comments).
**2d:** Extract into `schemas/raw-product.schema.json`. Factual content only. No rewriting. Keep table data structured. Break out description, bullets, specs, FAQ. Extract hi-res image URLs and assign `alt_text` and positions. Classify and extract datasheets.
**2e:** Download Images: use `curl -sL -o "{output_path}" "{source_url}"`
**2f:** Download Datasheets: use `curl -sL -o "{output_path}" "{source_url}"`
**2g:** Write complete JSON object to `raw.json`.

If any new realistic creative/hero imagery is needed later instead of pure supplier photos, defer to **nano-banana-realism-engine**. 

### Step 3: Summary
Report total successful/failed extractions, downloaded images/datasheets.
