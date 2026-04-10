---
name: google-business-profile-optimizer
description: Fully optimise a Google Business Profile for a UK business. Use this skill whenever the user asks to optimise, improve, complete, or set up a Google Business Profile (GBP) for any brand or business. Covers two phases - interview the user and generate all profile copy ready to paste, and optionally use the browser agent to fill the GBP dashboard fields automatically. Always use this skill for any GBP-related optimisation task, even if the user just says "do the GBP for X" or "sort out the Google listing".
---

# GBP Optimise Skill

Produces a fully optimised Google Business Profile for a single UK business across two distinct phases. Run once per brand.

---

## PHASE 1 — Interview & Copy Generation

Work through the five question groups below **one group at a time**. Wait for answers before proceeding. Do not guess or fill in gaps — ask if anything is unclear.

---

### GROUP 1 — Business Basics
- What is the exact business name as it should appear on Google?
- What is the full business address? (or is it service-area only with no public-facing address?)
- Primary phone number?
- Website URL?
- Opening hours for each day of the week? (include if closed on any day)
- Is this profile already created and verified on Google, or being built from scratch?

### GROUP 2 — Category & Audience
- In one sentence, what does this business do?
- Who are the target customers? (consumers, businesses, local area, regional, national?)
- What is the geographic service area? (town, county, radius?)
- Are there secondary services that should be listed separately?

### GROUP 3 — Differentiators & Trust Signals
- What makes this business better or different from competitors?
- Any accreditations, awards, years trading, or notable credentials?
- What do customers most commonly praise or return for?
- Any guarantees, policies, or trust signals worth highlighting?

### GROUP 4 — Content Assets
- Do you have existing photos, or should I produce a photo checklist?
- Is there existing marketing copy (website, leaflets, social) I should align tone with?
- Any keywords or search phrases you know customers use to find you?

### GROUP 5 — Q&A & Edge Cases
- What questions do customers regularly ask before booking or buying?
- Any questions you want to control the public answer to?
- Anything sensitive or worth pre-empting (parking, pricing, accessibility)?

---

### PHASE 1 OUTPUT

Once all groups are answered, produce the following — clearly labelled, UK English throughout, ready to copy-paste directly into GBP:

**1. BUSINESS DESCRIPTION**
750 characters max. Keyword-rich, natural tone. Lead with what the business does and where. Weave in 3–5 search terms organically. End with a call to action.

**2. SHORT DESCRIPTION**
250 characters. Punchy summary for condensed views.

**3. PRIMARY CATEGORY**
Must be from Google's official GBP category taxonomy. State the exact category string.

**4. SECONDARY CATEGORIES**
Up to 9. List each with a one-line rationale.

**5. SERVICES LIST**
For each service: name + description (300 chars max each). Cover all core and secondary services.

**6. ATTRIBUTES CHECKLIST**
Group by type (accessibility, amenities, payments, highlights etc). List every attribute worth enabling with a tick or cross recommendation and a brief reason where non-obvious.

**7. Q&A SEEDS**
8–12 pre-written questions with ideal owner answers. These should be posted by the owner to pre-populate the Q&A section. Include questions that contain natural search terms.

**8. PHOTO CHECKLIST**
Prioritised list of photos to upload. Include: cover photo spec, logo spec, interior/exterior, team, product/service shots, before/after if relevant. Note Google's recommended dimensions.

**9. OPENING POST**
First GBP Update post. 300 words max. Introduce the business, mention key services, include a clear CTA, and end with a link prompt (website or phone).

**10. OPTIMISATION NOTES**
Flag anything specific to this business type: category gotchas, verification risks, attributes that unlock features (e.g. booking button), fields Google may auto-populate incorrectly.

---

## PHASE 2 — Browser Agent Fill

Only proceed to Phase 2 if the user confirms they want the browser agent to fill the dashboard. The user must have the GBP dashboard open and be logged in.

### Pre-flight checks

Before touching anything, confirm:
- User is logged into the correct Google account
- The correct business profile is open in the GBP dashboard
- Phase 1 output has been approved and is in context

### Browser connection

Connect to the user's browser session to preserve their Google login:

```bash
browser-use connect
```

Or if using visual mode, use `mcp__playwright__browser_navigate` or `mcp__chrome-devtools__navigate_page`.

### Fill sequence

Work through fields in this order. After each field, confirm it saved before moving to the next. If a field is greyed out or restricted, note it and skip — do not force it.

1. **Business name** — verify it matches exactly, do not change unless instructed
2. **Business description** — paste the 750-char description from Phase 1
3. **Short description** — if field exists, paste 250-char version
4. **Primary category** — select from dropdown, confirm exact match
5. **Secondary categories** — add each one, confirm each saves
6. **Phone number** — verify or update
7. **Website URL** — verify or update
8. **Opening hours** — set each day, confirm special hours field is noted for later
9. **Service area** — set towns/postcodes/radius as appropriate
10. **Services** — add each service with name and description
11. **Attributes** — work through the attributes checklist, enabling recommended ones
12. **Photos** — skip automated upload; present the photo checklist to the user for manual upload

### Q&A seeding

Navigate to the Q&A section of the live profile (not dashboard). Post each Q&A seed as the business owner. Pause between posts (5 seconds) to avoid rate limiting.

### Post-fill verification

Once all fields are set, do a final pass:
- Screenshot or summarise what was filled
- List any fields skipped and why
- Flag any fields that need manual attention (e.g. primary category verification trigger, photo upload)

### Known restrictions

- Primary category changes can trigger re-verification — warn the user before changing
- Some attributes only appear for specific categories — if an attribute from the checklist is missing, note it
- Google may auto-populate services and descriptions with AI suggestions — review these after saving and correct any inaccuracies
- Q&A must be posted from a live profile view, not the dashboard editor

---

## Running this skill per brand

Each brand is independent — do not carry over copy or assumptions from a previous run. Start fresh for each business.
