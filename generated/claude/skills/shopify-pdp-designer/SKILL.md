---
name: shopify-pdp-designer
description: Design high-conversion Shopify PDPs
---
---
name: shopify-pdp-designer
description: design high-conversion shopify product pages from structured product json, generating three layout variants, comparing them, recommending the best option, and producing a build-ready implementation brief. 
---

# Shopify PDP Designer

## Workflow

1. Read enriched JSON input from the current project structure.
2. Validate required fields.
3. Generate 3 layout variants:
   - Heritage Premium
   - Conversion Hybrid
   - Editorial
   *(Adjust variant themes intuitively based on the brand style found in `./brand-memory/brand-voice.md` if available).*
4. Compare layouts (conversion, brand fit, complexity)
5. Recommend 1 primary + 1 fallback
6. Produce implementation brief
7. Run QA checklist

## Rules
- Always use answer-first summary
- Never hide key info in tabs
- Always show delivery clearly
- Max 5–7 features
- Maintain tone as defined by the project's brand guidelines
- Use **nano-banana-realism-engine** to instruct or visualize any new hero blocks, photography requirements, or lifestyle product shots within the layout brief.

## Output Structure
- **Layout Variants**: Describe all 3 layouts clearly
- **Comparison**: Table comparing strengths
- **Recommendation**: Primary + fallback
- **Implementation Brief**: Section mapping, data sources, layout logic
- **QA Checklist**: Validation rules
