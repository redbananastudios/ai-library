---
name: google-tag-manager
description: Manage Google Tag Manager containers via the API and build robust dataLayer + trigger + variable configurations. Use for deploying GA4 events, conversion tracking, Meta/LinkedIn/TikTok pixels, custom events, and managing versioned workspaces safely.
---
# Google Tag Manager

You are an expert at deploying and managing tracking through Google Tag Manager (GTM).

## What GTM Is For

- Centralised **tag management** without deploying code changes
- **Conversion tracking** (GA4 events, Google Ads conversions, Meta pixel, LinkedIn Insight Tag, TikTok pixel, etc.)
- **Custom event firing** based on page actions (clicks, form submits, scroll, visibility, custom JS)
- **dataLayer** as the canonical event/attribute contract between site and tags
- **Consent Mode v2** orchestration

## Setup

### Install the container

GTM snippets go in two places on the site:
- `<head>` — the main script
- Immediately after `<body>` — the noscript fallback

For WordPress, install via: **Site Kit**, **GTM4WP plugin**, or direct theme edit. Prefer GTM4WP because it bundles dataLayer helpers for WooCommerce and posts.

### API access

```bash
npm install googleapis
# or
pip install google-api-python-client
```

```javascript
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  scopes: [
    'https://www.googleapis.com/auth/tagmanager.readonly',
    'https://www.googleapis.com/auth/tagmanager.edit.containers',
    'https://www.googleapis.com/auth/tagmanager.publish',
  ],
});
const tagmanager = google.tagmanager({ version: 'v2', auth });
```

Auth identities (service account or user) need appropriate GTM roles: `Read`, `Edit`, `Approve`, `Publish`.

## Core Hierarchy

```
Account
 └─ Container (GTM-XXXXXXX)
    └─ Workspace (Default Workspace, or branches)
       ├─ Tags (what fires — GA4 event, Meta pixel, custom HTML, etc.)
       ├─ Triggers (when it fires — page view, click, form submit, custom event)
       ├─ Variables (values available — page URL, click text, dataLayer variables)
       └─ Version (snapshot of the workspace, can be published)
```

## Core Capabilities

### 1. List containers

```javascript
const res = await tagmanager.accounts.containers.list({
  parent: `accounts/${ACCOUNT_ID}`,
});
```

### 2. Create a workspace (branch)

```javascript
await tagmanager.accounts.containers.workspaces.create({
  parent: `accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}`,
  requestBody: {
    name: 'add-form-submit-tracking',
    description: 'Fires GA4 generate_lead on contact form submit',
  },
});
```

### 3. Create a GA4 event tag

```javascript
const workspacePath = `accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${WORKSPACE_ID}`;

// Trigger: Custom event 'form_submit'
const trigger = await tagmanager.accounts.containers.workspaces.triggers.create({
  parent: workspacePath,
  requestBody: {
    name: 'Form Submit - Contact',
    type: 'customEvent',
    customEventFilter: [{
      type: 'equals',
      parameter: [
        { type: 'template', key: 'arg0', value: '{{_event}}' },
        { type: 'template', key: 'arg1', value: 'form_submit' },
      ],
    }],
  },
});

// Tag: GA4 Event
await tagmanager.accounts.containers.workspaces.tags.create({
  parent: workspacePath,
  requestBody: {
    name: 'GA4 Event - generate_lead',
    type: 'gaawe', // GA4 Event tag
    parameter: [
      { type: 'template', key: 'measurementId', value: '{{GA4 Measurement ID}}' },
      { type: 'template', key: 'eventName', value: 'generate_lead' },
      {
        type: 'list',
        key: 'eventParameters',
        list: [
          { type: 'map', map: [
            { type: 'template', key: 'name', value: 'form_name' },
            { type: 'template', key: 'value', value: '{{DLV - form_name}}' },
          ]},
        ],
      },
    ],
    firingTriggerId: [trigger.data.triggerId],
  },
});
```

### 4. Create a version and publish

```javascript
// Snapshot the workspace
const version = await tagmanager.accounts.containers.workspaces.create_version({
  path: workspacePath,
  requestBody: {
    name: 'v2026.04.14 — add form submit tracking',
    notes: 'Adds generate_lead event on contact form submit',
  },
});

// Publish the version live
await tagmanager.accounts.containers.versions.publish({
  path: `accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/versions/${version.data.containerVersion.containerVersionId}`,
});
```

### 5. Preview changes before publishing

Use the GTM UI preview mode (Tag Assistant) before programmatic publish. Never publish directly to production without preview validation — broken tags silently break your analytics for hours before anyone notices.

## dataLayer Best Practices

### Structure

```javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'form_submit',
  form_name: 'contact',
  form_id: 'contact-form-home',
  form_destination: '/thank-you',
});
```

### Naming conventions

- `event` — always snake_case, matches GA4 event naming (`page_view`, `form_submit`, `add_to_cart`, `purchase`)
- Event parameters — snake_case, descriptive (`form_name`, not `fn`)
- Do not push PII. Email, phone, name, address — never in dataLayer. Use hashed identifiers or omit.
- Push **before** the tag needs to fire. For form submits, push in the submit handler, not after the redirect.

### Common events to instrument

| Event | When | Parameters |
|-------|------|------------|
| `page_view` | Automatic via GA4 config tag | page_location, page_title |
| `scroll` | Built-in trigger (25/50/75/90%) | percent_scrolled |
| `view_item` | Product page | item_id, item_name, price |
| `add_to_cart` | Cart button | items[], value, currency |
| `begin_checkout` | Checkout init | items[], value |
| `purchase` | Order confirmation | transaction_id, value, currency, items[] |
| `form_submit` | Form submission | form_name, form_id |
| `generate_lead` | Conversion | lead_type, value |
| `file_download` | Download click | file_name, file_extension |
| `video_start/_progress/_complete` | YouTube/Vimeo | video_title, video_percent |
| `login/sign_up` | Auth success | method |
| `search` | Internal search | search_term, results_count |

## Common Deployments

### A. GA4 base configuration

1. Create a **GA4 Configuration** tag with your Measurement ID.
2. Trigger: **All Pages**.
3. This fires `page_view` automatically. Do NOT create a separate page_view tag — duplicates inflate metrics.

### B. Meta (Facebook) Pixel

1. Add the base pixel via **Custom HTML** tag or the Meta community template.
2. Base tag fires on All Pages.
3. Event tags (PageView, ViewContent, AddToCart, Purchase) fire on matching triggers using Conversions API recommended in parallel.

### C. LinkedIn Insight Tag

1. Use the **LinkedIn Insight Tag** community template.
2. Fires on All Pages.
3. For conversions, configure in LinkedIn Campaign Manager — they match based on the base tag plus URL rules.

### D. TikTok Pixel

1. Use the TikTok Pixel community template.
2. Base tag + event tags for `CompletePayment`, `ViewContent`, `ClickButton`.
3. Server-side Events API recommended for iOS attribution.

### E. Google Ads conversion

1. Create a **Google Ads Conversion Tracking** tag with conversion ID and label from Google Ads.
2. Trigger: custom event (e.g. `purchase` or a conversion-specific event).
3. Pass conversion value and currency from dataLayer.

## Consent Mode v2

If the site operates in the EU or serves EU visitors, Consent Mode v2 is mandatory (as of March 2024). It signals to Google tags whether the user has consented to ads/analytics storage.

- Use a CMP (Consent Management Platform) — OneTrust, Cookiebot, Complianz, Iubenda, etc.
- The CMP must push `gtag('consent', 'default', { ... })` BEFORE any GTM tag fires.
- After the user consents, the CMP pushes `gtag('consent', 'update', { ... })`.
- Without this, GA4 and Ads conversions will be underreported for EU traffic and ads personalisation will be disabled.

## Workspace Hygiene

- **One workspace per change** — don't mix "add purchase tracking" and "update Meta pixel" in one workspace. Easier to revert.
- **Name versions descriptively** — "v2026.04.14 — add lead form tracking" beats "v15".
- **Use folders** — group tags by platform (GA4, Meta, LinkedIn, Custom).
- **Document triggers with notes** — future-you will thank you.
- **Regularly audit paused tags** — if a tag has been paused for 90+ days, remove it.

## Quotas and Limits

- Tag Manager API: 5 requests per second per user, 50 per 100 seconds per project.
- Max tags per container: 500 (workspace-level). Approaching the cap usually means tag sprawl — consolidate.
- Max workspaces per container: 3 on free tier, unlimited on 360.

## Guardrails

- **Never publish without preview** — broken tags break analytics silently for hours.
- **Never put PII in dataLayer** — names, emails, phone numbers. Use hashed IDs if needed.
- **Never hard-code conversion IDs or pixel IDs in tag bodies** — use Variables so they're swappable per environment.
- **Version every change** — a version gives you a one-click rollback.
- **Do not install the same pixel twice** — duplicate Meta or GA4 pixels cause double-counting. Check the page source before deploying.
- **Respect consent** — if Consent Mode is active, don't override it with unconditional tags.
- **Do not publish on Fridays** unless you're prepared to monitor over the weekend.

## Integration

### With GA4
- GTM fires events; GA4 receives them. Use the **google-analytics** skill to verify events arrive and to mark conversions.
- After adding a new GA4 event via GTM, mark it as a **Conversion** in GA4 Admin → Events if it's a business-meaningful conversion.

### With GSC
- GTM has no GSC tags. GSC is independent — no GTM role in SEO performance measurement.

### With WordPress
- If using the **GTM4WP plugin**, it auto-pushes rich dataLayer for WooCommerce (products, cart, orders) and posts (categories, tags, author). Use those dataLayer keys directly.
- For custom page-builders (Elementor, Divi, Bricks), wrap submit handlers to push custom events.

## Output Format

When delivering work, provide:

1. **Workspace summary** — what was added/changed
2. **Tags created** — name, type, measurement/pixel ID
3. **Triggers created** — name, type, firing condition
4. **Variables created** — name, type, default value
5. **dataLayer contract** — what events the site must push and what parameters they must include
6. **Preview checklist** — what to verify in Tag Assistant before publishing
7. **Version name + notes** — what the version is called and what it changes

## Related Skills

- Pair with **google-analytics** to verify events arrive and mark conversions
- Pair with **google-search-console** for organic funnel analysis post-tracking
- Pair with **claude-ads** / **ads-manager** for paid conversion tracking
- Pair with **wordpress-setup** / **wordpress-content** for WordPress-specific installs
