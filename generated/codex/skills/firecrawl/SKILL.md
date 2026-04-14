---
name: firecrawl
description: Scrape, crawl, and extract structured data from websites using the Firecrawl API. Supports single-page scrape, full-site crawl, batch scrape, URL mapping, web search, and AI-powered structured extraction.
---
# Firecrawl Web Scraper

You are an expert at using the Firecrawl SDK to scrape, crawl, and extract structured data from websites.

## Setup

Firecrawl requires an API key. Set it as an environment variable:

```bash
export FIRECRAWL_API_KEY=fc-YOUR_API_KEY
```

The npm package is `@mendable/firecrawl-js`. Install if not already available:

```bash
npm install @mendable/firecrawl-js
```

## Initialize the Client

```javascript
import Firecrawl from '@mendable/firecrawl-js';

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
```

## Core Capabilities

### 1. Scrape a Single Page

Scrape one URL and get back markdown, HTML, or both:

```javascript
const result = await firecrawl.scrape('https://example.com', {
  formats: ['markdown', 'html'],
});
console.log(result.markdown);
```

### 2. Crawl an Entire Website

Crawl a site recursively, following links up to a configurable limit:

```javascript
const result = await firecrawl.crawl('https://example.com', {
  limit: 100,
  scrapeOptions: {
    formats: ['markdown', 'html'],
  }
});
console.log(result);
```

### 3. Batch Scrape Multiple URLs

Scrape many URLs in one async job:

```javascript
const result = await firecrawl.batchScrape([
  'https://example.com/page1',
  'https://example.com/page2',
], {
  formats: ['markdown'],
  pollInterval: 2,
  timeout: 120
});
console.log(result);
```

### 4. Extract Structured Data (JSON Schema)

Scrape a page and extract data into a defined JSON schema:

```javascript
import { z } from 'zod';

const schema = z.object({
  title: z.string(),
  price: z.string(),
  rating: z.number(),
  features: z.array(z.string())
});

const result = await firecrawl.scrape('https://example.com/product', {
  formats: [{
    type: 'json',
    schema: z.toJSONSchema(schema)
  }],
});
console.log(result.json);
```

### 5. Extract from Multiple URLs

Use the extract endpoint for AI-powered extraction across URLs:

```javascript
const result = await firecrawl.extract({
  urls: ['https://example.com'],
  prompt: 'Extract the company name and description',
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' }
    },
    required: ['name', 'description']
  }
});
console.log(result.data);
```

### 6. Map URLs on a Website

Discover all URLs on a site without scraping content:

```javascript
const result = await firecrawl.map('https://example.com');
console.log(result); // Array of URLs
```

### 7. Search the Web

Search the web and optionally scrape the results:

```javascript
const results = await firecrawl.search('firecrawl web scraping', {
  limit: 5,
  scrapeOptions: { formats: ['markdown'] }
});
console.log(results);
```

## Best Practices

- **Always use environment variables** for the API key, never hardcode it
- **Set reasonable limits** when crawling to avoid excessive API usage (`limit: 50-100` is a good default)
- **Use `formats: ['markdown']`** for LLM-ready output; add `'html'` only when you need raw structure
- **Use Zod schemas** (JS) for type-safe structured extraction with validation
- **Use batch scrape** instead of looping single scrapes when processing multiple URLs
- **Use map** first to discover URLs before deciding what to crawl/scrape
- **Set timeouts** on long-running crawl and batch operations (`timeout: 120`)
- **Poll interval**: for async jobs use `pollInterval: 2` (seconds) to check status

## When to Use Each Method

| Method | Use Case |
|--------|----------|
| `scrape()` | Get content from a single known URL |
| `crawl()` | Get content from an entire site (follows links) |
| `batchScrape()` | Get content from a specific list of URLs |
| `extract()` | AI-powered structured data extraction |
| `map()` | Discover all URLs on a site (no content) |
| `search()` | Find and scrape web search results |

## Output Formats

- `markdown` - Clean markdown, ideal for LLM consumption
- `html` - Raw HTML content
- `{ type: 'json', schema: ... }` - Structured data matching a JSON/Zod schema

## Error Handling

```javascript
try {
  const result = await firecrawl.scrape(url, { formats: ['markdown'] });
  if (result.success) {
    console.log(result.markdown);
  }
} catch (error) {
  console.error('Firecrawl error:', error.message);
}
```
