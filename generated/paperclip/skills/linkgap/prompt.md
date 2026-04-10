---
name: linkgap
description: Analyse backlink gaps between your domain and a competitor using linkgap.io. Identifies directory gaps, directory opportunities and backlink gaps. Free, no login required, browser-automated.
---

# LinkGap Backlink Gap Analyzer

Analyse backlink gaps between your domain and a competitor using linkgap.io through browser automation. The tool compares two domains and identifies directories and backlinks the competitor has that you do not.

## What It Finds

| Category | Tag | Description |
|----------|-----|-------------|
| **Directory Gaps** | Red | Directories where the competitor has a listing but you do not |
| **Directory Opportunities** | Green | Directories worth listing on (neither site is listed) |
| **Backlink Gaps** | Orange | Backlinks the competitor has that you lack |

## Prerequisites

- `browser-use` CLI installed (`browser-use doctor` to verify)
- No login or account required — the tool is free and anonymous
- **An email address is required to receive the full report** — only 3 results are visible without one. Ask the user for their email before starting, or confirm they are happy with just the top 3 results.

## Limits

- 3 analyses per hour per IP address (resets automatically)
- Results are cached for 30 days (repeat searches return cached results)
- Only 3 results are shown in the browser — the full report requires an email address

## Workflow

### Step 1: Ensure Browser Session

```bash
browser-use connect
```

Or launch a fresh session:

```bash
browser-use open https://linkgap.io/
```

### Step 2: Navigate to LinkGap

```bash
browser-use open https://linkgap.io/
```

### Step 3: Enter Domains

```bash
browser-use state
```

Find the two input fields:
- **Your Website** — `input[name="user_domain"]`
- **Competitor Website** — `input[name="competitor_domain"]`

```bash
browser-use input <your_domain_index> "yourdomain.com"
browser-use input <competitor_domain_index> "competitor.com"
```

Enter clean domains without `https://` or trailing slashes.

### Step 4: Submit the Analysis

```bash
browser-use state                          # Find the "Analyze Backlink Gap" button
browser-use click <submit_button_index>    # Click it
```

The page redirects to `/status/{uuid}` and shows a progress indicator.

### Step 5: Wait for Results

The analysis takes 10-60 seconds. Wait for completion:

```bash
browser-use wait text "Opportunities Found" --timeout 120000
```

If `wait` is unavailable, poll with screenshots every 10 seconds:

```bash
browser-use screenshot
```

Look for the results page showing opportunity cards and stats. The URL stays at `/status/{uuid}` — the page re-renders in place when done.

### Step 6: Extract Results

Once results are visible:

```bash
browser-use state
```

Extract the following data from the page:

1. **Total opportunities count** — the large number in the stats card
2. **Breakdown counts** — Directory Gaps (red), Directory Opportunities (green), Backlink Gaps (orange)
3. **3 unlocked results** — each showing:
   - Directory/site name
   - Domain
   - Category tag (Gap or Opportunity)
   - Link to the directory

For more detail on the visible cards:

```bash
browser-use get text <card_index>
browser-use get attributes <link_index>
```

Or extract all visible data via JavaScript:

```bash
browser-use eval "JSON.stringify([...document.querySelectorAll('.gap-card')].map(c => ({ name: c.querySelector('h3,h4,.font-semibold')?.textContent?.trim(), domain: c.querySelector('a')?.textContent?.trim(), url: c.querySelector('a')?.href, tag: c.querySelector('.badge,.tag,[class*=gap],[class*=opportunity]')?.textContent?.trim() })))"
```

### Step 7: Get Full Report

Only 3 results are shown in the browser. To get the full report (all opportunities) as a PDF via email, **you must complete this step**. Ask the user for their email address if not already provided.

```bash
browser-use state    # Find the email form in the unlock section
```

Look for the unlock form with fields: name (optional), email (required), and consent checkbox.

```bash
browser-use input <name_index> "Your Name"
browser-use input <email_index> "your@email.com"
browser-use click <consent_checkbox_index>
browser-use click <send_report_button_index>
```

Wait for confirmation:

```bash
browser-use wait text "Check Your Email" --timeout 10000
```

The full PDF report will be emailed with all opportunities.

### Step 8: Report Findings

Present results to the user:

1. **Summary** — total opportunities found, broken down by category
2. **Top 3 visible results** — directory name, domain, gap type, link
3. **Recommendation** — whether to request the full PDF report for remaining opportunities
4. **Next steps** — suggest using the **backlink-outreach** skill to act on the gaps found

## Visual Mode

When using Playwright or Chrome DevTools MCP tools instead of browser-use CLI:

1. **Navigate**: `mcp__playwright__browser_navigate` to `https://linkgap.io/`
2. **Snapshot**: `mcp__playwright__browser_snapshot` to find form elements
3. **Fill**: `mcp__playwright__browser_fill_form` with the two domain fields
4. **Click**: `mcp__playwright__browser_click` on the submit button
5. **Wait**: `mcp__playwright__browser_wait_for` text "Opportunities Found"
6. **Extract**: `mcp__playwright__browser_evaluate` to run JS extraction
7. **Screenshot**: `mcp__playwright__browser_take_screenshot` for visual confirmation

## Running Multiple Analyses

To compare against multiple competitors:

1. Run the first analysis following the full workflow
2. After extracting results, navigate back: `browser-use open https://linkgap.io/`
3. Enter your domain again with the next competitor
4. Repeat — note the 3 analyses per hour rate limit

Compile results across all competitors to find the most common gaps.

## Integration with Other Skills

After running a LinkGap analysis:

- Use **backlink-analyzer** for deeper analysis of specific opportunities found
- Use **backlink-outreach** to draft outreach emails for directory listings
- Use **humanizer** to ensure outreach emails sound natural before sending
- Use **deep-research** to investigate high-value directories before submitting listings

## Error Handling

- **Rate limited**: If you see an error about too many requests, wait 1 hour and retry
- **Invalid domain**: Ensure domains are entered without `https://` or paths
- **Analysis stuck**: If the status page does not complete after 2 minutes, screenshot and report to the user. Navigate back to `/` and retry.
- **No results**: Some domain pairs may have few gaps — this is a valid result, not an error
