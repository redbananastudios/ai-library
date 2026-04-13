---
name: shopify-sync
description: Sync enriched product JSON to Shopify store
---
---
name: shopify-sync
description: Sync enriched product JSON to Shopify. Groups colour variants, creates or updates products with variants, matches existing products by SKU.
---

# Shopify Product Sync

You are publishing enriched product data to the current project's Shopify store.

## Input

The user will provide either:
- A path to a single product folder (e.g. `output/fontmell-sku/`)
- The word "all" or "batch" to process all `output/*/enriched.json` files

## Process

### Step 0: Load and group products
Read all `enriched.json` files from the target folders.
**Group products into families by `identity.our_product_name`.**
Products with the same name but different `metadata.colour` values are variants. Products with a unique name are standalone.
Designate the primary variant as the first when sorted alphabetically by SKU. Product-level fields come from the primary. 

### Step 1: For each product family

#### 1a: Render HTML description
Use the primary variant's enriched JSON to render enabled sections as formatted HTML (`<h2>` for sections, `<p>`, `<ul>`, `<table>` where appropriate).

#### 1b: Check for existing product by SKU
1. For each variant, use `get-products` matching the title.
2. Check if any existing product matches the SKU `shopify.sku`.
3. If found, use the existing product GID to update. 
4. If `shopify.shopify_gid` is already inside `enriched.json`, use that directly!
5. If no match is found, create a new product.
**SKU is the authoritative match key.**

#### 1c: Create or update product
New: `create-product` with title (stripped of variant colours), HTML description, type, vendor, tags (merged from variants), handle (slugified), status="draft", seo objects.
Update: `update-product` with existing GID and same fields.

#### 1d: Set variant details
For each variant, use `manage-product-variants` to set price, sku, taxable=false, and optionValues (e.g. Colour).
(Note: Handle Cost Per Item manually if MCP doesn't support it).

#### 1e: Handle images
Attempt to set images via MCP tools. Upload all images. If MCP tool doesn't support variant-level association, upload at product level.
If MCP has no image support, report it needs manual upload.
If any new lifestyle/aesthetic images are requested by the user separately, use the **nano-banana-realism-engine** skill to generate concepts.

#### 1f: Store GID
Write the Shopify product GID back to EVERY variant's `enriched.json` in the `shopify.shopify_gid` field.

### Step 2: Summary
Report total processed, created, updated, total variants, skipped.
Remind user products are in DRAFT status.
