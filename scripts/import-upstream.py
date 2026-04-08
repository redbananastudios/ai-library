#!/usr/bin/env python3
"""
Import an upstream skill/agent into the ai-library source of truth.

Usage:
  python import-upstream.py <item-id>                  # Import a single discovered item
  python import-upstream.py --all                      # Import all discovered items
  python import-upstream.py --list                     # List all discovered items
"""

import sys
import subprocess
import tempfile
import shutil
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from lib import *


# ============================================================
# DISCOVERED ITEMS REGISTRY
# ============================================================
# This is the master list of all discovered upstream items.
# Each entry defines how to import the item.

DISCOVERED = [
    # --- A. FOUNDATION / META ---
    {
        "id": "browser-use",
        "name": "Browser Use",
        "type": "skill",
        "source_url": "https://github.com/browser-use/browser-use",
        "source_kind": "github",
        "description": "Browser automation, dynamic site interaction, live QA, scraping, workflow automation",
        "import_method": "github_inspect",
    },
    {
        "id": "frontend-design",
        "name": "Frontend Design",
        "type": "skill",
        "source_url": "https://github.com/anthropics/claude-code",
        "source_kind": "github",
        "description": "Production-grade UI generation and better frontend aesthetic output",
        "import_method": "github_subpath",
        "subpath": "skills/frontend-design",
    },
    {
        "id": "simplify",
        "name": "Simplify",
        "type": "skill",
        "source_url": "https://github.com/anthropics/claude-code",
        "source_kind": "github",
        "description": "Code simplification, review, and cleanup",
        "import_method": "github_subpath",
        "subpath": "skills/simplify",
    },
    {
        "id": "upload-post",
        "name": "Upload Post",
        "type": "skill",
        "source_url": "https://github.com/Upload-Post/upload-post-skill",
        "source_kind": "github",
        "description": "Social publishing to multiple platforms",
        "import_method": "github_inspect",
    },

    # --- B. SEO / CONTENT / GEO / LOCAL ---
    {
        "id": "claude-seo",
        "name": "Claude SEO Pack",
        "type": "skill",
        "source_url": "https://github.com/AgriciDaniel/claude-seo",
        "source_kind": "github",
        "description": "SEO skill pack - comprehensive SEO capabilities",
        "import_method": "github_inspect",
        "is_pack": True,
    },
    {
        "id": "content-strategy",
        "name": "Content Strategy",
        "type": "skill",
        "source_url": "https://github.com/coreyhaines31/marketingskills",
        "source_kind": "github",
        "description": "Content strategy planning and execution",
        "import_method": "github_subpath",
        "imported_from_pack": "marketingskills",
    },
    {
        "id": "competitor-alternatives",
        "name": "Competitor Alternatives",
        "type": "skill",
        "source_url": "https://github.com/coreyhaines31/marketingskills",
        "source_kind": "github",
        "description": "Competitor analysis and alternative identification",
        "import_method": "github_subpath",
        "imported_from_pack": "marketingskills",
    },
    {
        "id": "copywriter",
        "name": "Copywriter",
        "type": "skill",
        "source_url": "https://github.com/coreyhaines31/marketingskills",
        "source_kind": "github",
        "description": "Professional copywriting skill",
        "import_method": "github_subpath",
        "imported_from_pack": "marketingskills",
    },
    {
        "id": "ai-seo",
        "name": "AI SEO",
        "type": "skill",
        "source_url": "https://github.com/coreyhaines31/marketingskills",
        "source_kind": "github",
        "description": "AI-powered SEO optimization",
        "import_method": "github_subpath",
        "imported_from_pack": "marketingskills",
    },
    {
        "id": "seo-audit",
        "name": "SEO Audit",
        "type": "skill",
        "source_url": "https://github.com/coreyhaines31/marketingskills",
        "source_kind": "github",
        "description": "Comprehensive SEO auditing",
        "import_method": "github_subpath",
        "imported_from_pack": "marketingskills",
    },
    {
        "id": "paid-ads",
        "name": "Paid Ads",
        "type": "skill",
        "source_url": "https://github.com/coreyhaines31/marketingskills",
        "source_kind": "github",
        "description": "Paid advertising campaign management",
        "import_method": "github_subpath",
        "imported_from_pack": "marketingskills",
    },
    {
        "id": "social-content",
        "name": "Social Content",
        "type": "skill",
        "source_url": "https://github.com/coreyhaines31/marketingskills",
        "source_kind": "github",
        "description": "Social media content creation",
        "import_method": "github_subpath",
        "imported_from_pack": "marketingskills",
    },
    {
        "id": "seo-geo-optimizer",
        "name": "SEO GEO Optimizer",
        "type": "skill",
        "source_url": "",
        "source_kind": "community",
        "description": "SEO + GEO optimization for Google, Bing, AI Overviews, ChatGPT, Perplexity",
        "import_method": "manual",
    },
    {
        "id": "localrank-agent",
        "name": "LocalRank Agent",
        "type": "skill",
        "source_url": "",
        "source_kind": "community",
        "description": "Google Business Profile rankings, audits, citations, local SEO workflows",
        "import_method": "manual",
    },
    {
        "id": "local-visibility",
        "name": "Local Visibility",
        "type": "skill",
        "source_url": "",
        "source_kind": "community",
        "description": "AI visibility + local SEO + map pack + Google Business Profile guidance",
        "import_method": "manual",
    },
    {
        "id": "backlink-analyzer",
        "name": "Backlink Analyzer",
        "type": "skill",
        "source_url": "",
        "source_kind": "community",
        "description": "Backlink audits, toxic links, opportunities, competitor backlink analysis",
        "import_method": "manual",
    },
    {
        "id": "backlink-outreach",
        "name": "Backlink Outreach",
        "type": "skill",
        "source_url": "https://github.com/danpoletaev/backlink-outreach-js",
        "source_kind": "github",
        "description": "Backlink outreach and prospecting",
        "import_method": "github_inspect",
    },
    {
        "id": "ai-discoverability-audit",
        "name": "AI Discoverability Audit",
        "type": "skill",
        "source_url": "https://github.com/BrianRWagner/ai-marketing-claude-code-skills",
        "source_kind": "github",
        "description": "Audit AI discoverability across platforms",
        "import_method": "github_subpath",
        "imported_from_pack": "ai-marketing-claude-code-skills",
    },
    {
        "id": "positioning-basics",
        "name": "Positioning Basics",
        "type": "skill",
        "source_url": "https://github.com/BrianRWagner/ai-marketing-claude-code-skills",
        "source_kind": "github",
        "description": "Marketing positioning fundamentals",
        "import_method": "github_subpath",
        "imported_from_pack": "ai-marketing-claude-code-skills",
    },
    {
        "id": "marketing-principles",
        "name": "Marketing Principles",
        "type": "skill",
        "source_url": "https://github.com/BrianRWagner/ai-marketing-claude-code-skills",
        "source_kind": "github",
        "description": "Core marketing principles and frameworks",
        "import_method": "github_subpath",
        "imported_from_pack": "ai-marketing-claude-code-skills",
    },
    {
        "id": "linkedin-authority-builder",
        "name": "LinkedIn Authority Builder",
        "type": "skill",
        "source_url": "https://github.com/BrianRWagner/ai-marketing-claude-code-skills",
        "source_kind": "github",
        "description": "Build LinkedIn thought leadership and authority",
        "import_method": "github_subpath",
        "imported_from_pack": "ai-marketing-claude-code-skills",
    },
    {
        "id": "content-idea-generator",
        "name": "Content Idea Generator",
        "type": "skill",
        "source_url": "https://github.com/BrianRWagner/ai-marketing-claude-code-skills",
        "source_kind": "github",
        "description": "Generate content ideas across channels",
        "import_method": "github_subpath",
        "imported_from_pack": "ai-marketing-claude-code-skills",
    },
    {
        "id": "voice-extractor",
        "name": "Voice Extractor",
        "type": "skill",
        "source_url": "https://github.com/BrianRWagner/ai-marketing-claude-code-skills",
        "source_kind": "github",
        "description": "Extract brand voice patterns from content",
        "import_method": "github_subpath",
        "imported_from_pack": "ai-marketing-claude-code-skills",
    },
    {
        "id": "de-ai-ify",
        "name": "De-AI-ify",
        "type": "skill",
        "source_url": "https://github.com/BrianRWagner/ai-marketing-claude-code-skills",
        "source_kind": "github",
        "description": "Remove AI-sounding patterns from content",
        "import_method": "github_subpath",
        "imported_from_pack": "ai-marketing-claude-code-skills",
    },
    {
        "id": "social-card-gen",
        "name": "Social Card Generator",
        "type": "skill",
        "source_url": "https://github.com/BrianRWagner/ai-marketing-claude-code-skills",
        "source_kind": "github",
        "description": "Generate social media card images",
        "import_method": "github_subpath",
        "imported_from_pack": "ai-marketing-claude-code-skills",
    },
    {
        "id": "last30days",
        "name": "Last 30 Days",
        "type": "skill",
        "source_url": "https://github.com/BrianRWagner/ai-marketing-claude-code-skills",
        "source_kind": "github",
        "description": "Analyze last 30 days of activity/performance",
        "import_method": "github_subpath",
        "imported_from_pack": "ai-marketing-claude-code-skills",
    },
    {
        "id": "reddit-insights",
        "name": "Reddit Insights",
        "type": "skill",
        "source_url": "https://github.com/BrianRWagner/ai-marketing-claude-code-skills",
        "source_kind": "github",
        "description": "Extract insights from Reddit discussions",
        "import_method": "github_subpath",
        "imported_from_pack": "ai-marketing-claude-code-skills",
    },
    {
        "id": "youtube-summarizer",
        "name": "YouTube Summarizer",
        "type": "skill",
        "source_url": "https://github.com/BrianRWagner/ai-marketing-claude-code-skills",
        "source_kind": "github",
        "description": "Summarize YouTube video content",
        "import_method": "github_subpath",
        "imported_from_pack": "ai-marketing-claude-code-skills",
    },

    # --- C. CODING / FULLSTACK / QA ---
    {
        "id": "fullstack-developer",
        "name": "Fullstack Developer",
        "type": "agent",
        "source_url": "https://github.com/AiDA-Agents/awesome-claude-code-subagents",
        "source_kind": "github",
        "description": "Full-stack development agent (VoltAgent)",
        "import_method": "github_inspect",
    },
    {
        "id": "frontend-developer",
        "name": "Frontend Developer",
        "type": "agent",
        "source_url": "https://github.com/AiDA-Agents/awesome-claude-code-subagents",
        "source_kind": "github",
        "description": "Frontend development agent (VoltAgent)",
        "import_method": "github_inspect",
    },
    {
        "id": "backend-developer",
        "name": "Backend Developer",
        "type": "agent",
        "source_url": "https://github.com/AiDA-Agents/awesome-claude-code-subagents",
        "source_kind": "github",
        "description": "Backend development agent (VoltAgent)",
        "import_method": "github_inspect",
    },
    {
        "id": "investigate",
        "name": "Investigate",
        "type": "skill",
        "source_url": "https://github.com/garrytan/gstack",
        "source_kind": "github",
        "description": "Debugging and root-cause analysis workflow",
        "import_method": "github_inspect",
    },
    {
        "id": "qa",
        "name": "QA",
        "type": "skill",
        "source_url": "https://github.com/garrytan/gstack",
        "source_kind": "github",
        "description": "QA workflow",
        "import_method": "github_inspect",
    },
    {
        "id": "review",
        "name": "Review",
        "type": "skill",
        "source_url": "https://github.com/garrytan/gstack",
        "source_kind": "github",
        "description": "Senior code review workflow",
        "import_method": "github_inspect",
    },
    {
        "id": "qa-only",
        "name": "QA Only",
        "type": "skill",
        "source_url": "https://github.com/garrytan/gstack",
        "source_kind": "github",
        "description": "Focused QA-only workflow",
        "import_method": "github_inspect",
    },
    {
        "id": "code-reviewer",
        "name": "Code Reviewer",
        "type": "skill",
        "source_url": "",
        "source_kind": "community",
        "description": "Structured code review (maps to simplify if unavailable upstream)",
        "import_method": "manual",
    },

    # --- D. SHOPIFY / WORDPRESS / CMS ---
    {
        "id": "shopify-setup",
        "name": "Shopify Setup",
        "type": "skill",
        "source_url": "https://github.com/jezweb/claude-skills",
        "source_kind": "github",
        "description": "Shopify store setup and configuration",
        "import_method": "github_subpath",
        "imported_from_pack": "jezweb-claude-skills",
    },
    {
        "id": "shopify-products",
        "name": "Shopify Products",
        "type": "skill",
        "source_url": "https://github.com/jezweb/claude-skills",
        "source_kind": "github",
        "description": "Shopify product management",
        "import_method": "github_subpath",
        "imported_from_pack": "jezweb-claude-skills",
    },
    {
        "id": "shopify-content",
        "name": "Shopify Content",
        "type": "skill",
        "source_url": "https://github.com/jezweb/claude-skills",
        "source_kind": "github",
        "description": "Shopify content management",
        "import_method": "github_subpath",
        "imported_from_pack": "jezweb-claude-skills",
    },
    {
        "id": "wordpress-setup",
        "name": "WordPress Setup",
        "type": "skill",
        "source_url": "https://github.com/jezweb/claude-skills",
        "source_kind": "github",
        "description": "WordPress site setup and configuration",
        "import_method": "github_subpath",
        "imported_from_pack": "jezweb-claude-skills",
    },
    {
        "id": "wordpress-content",
        "name": "WordPress Content",
        "type": "skill",
        "source_url": "https://github.com/jezweb/claude-skills",
        "source_kind": "github",
        "description": "WordPress content management",
        "import_method": "github_subpath",
        "imported_from_pack": "jezweb-claude-skills",
    },
    {
        "id": "wordpress-elementor",
        "name": "WordPress Elementor",
        "type": "skill",
        "source_url": "https://github.com/jezweb/claude-skills",
        "source_kind": "github",
        "description": "WordPress Elementor page builder workflows",
        "import_method": "github_subpath",
        "imported_from_pack": "jezweb-claude-skills",
    },
    {
        "id": "design-assets",
        "name": "Design Assets",
        "type": "skill",
        "source_url": "https://github.com/jezweb/claude-skills",
        "source_kind": "github",
        "description": "Color palettes, icons, images, design asset workflows",
        "import_method": "github_subpath",
        "imported_from_pack": "jezweb-claude-skills",
    },
    {
        "id": "project-health",
        "name": "Project Health",
        "type": "skill",
        "source_url": "https://github.com/jezweb/claude-skills",
        "source_kind": "github",
        "description": "Project health monitoring",
        "import_method": "github_subpath",
        "imported_from_pack": "jezweb-claude-skills",
    },
    {
        "id": "deep-research",
        "name": "Deep Research",
        "type": "skill",
        "source_url": "https://github.com/jezweb/claude-skills",
        "source_kind": "github",
        "description": "Deep research workflows",
        "import_method": "github_subpath",
        "imported_from_pack": "jezweb-claude-skills",
    },
    {
        "id": "ux-audit",
        "name": "UX Audit",
        "type": "skill",
        "source_url": "https://github.com/jezweb/claude-skills",
        "source_kind": "github",
        "description": "UX auditing and analysis",
        "import_method": "github_subpath",
        "imported_from_pack": "jezweb-claude-skills",
    },
    # Shopify agent skills
    {
        "id": "shopify-theme-development",
        "name": "Shopify Theme Development",
        "type": "skill",
        "source_url": "https://github.com/dragnoir/Shopify-agent-skills",
        "source_kind": "github",
        "description": "Shopify theme development workflows",
        "import_method": "github_inspect",
        "imported_from_pack": "shopify-agent-skills",
    },
    {
        "id": "shopify-liquid-templating",
        "name": "Shopify Liquid Templating",
        "type": "skill",
        "source_url": "https://github.com/dragnoir/Shopify-agent-skills",
        "source_kind": "github",
        "description": "Shopify Liquid template development",
        "import_method": "github_inspect",
        "imported_from_pack": "shopify-agent-skills",
    },
    {
        "id": "shopify-app-development",
        "name": "Shopify App Development",
        "type": "skill",
        "source_url": "https://github.com/dragnoir/Shopify-agent-skills",
        "source_kind": "github",
        "description": "Shopify app development",
        "import_method": "github_inspect",
        "imported_from_pack": "shopify-agent-skills",
    },
    {
        "id": "shopify-hydrogen",
        "name": "Shopify Hydrogen",
        "type": "skill",
        "source_url": "https://github.com/dragnoir/Shopify-agent-skills",
        "source_kind": "github",
        "description": "Shopify headless/Hydrogen development",
        "import_method": "github_inspect",
        "imported_from_pack": "shopify-agent-skills",
    },
    {
        "id": "shopify-checkout",
        "name": "Shopify Checkout",
        "type": "skill",
        "source_url": "https://github.com/dragnoir/Shopify-agent-skills",
        "source_kind": "github",
        "description": "Shopify checkout customization",
        "import_method": "github_inspect",
        "imported_from_pack": "shopify-agent-skills",
    },
    {
        "id": "shopify-functions",
        "name": "Shopify Functions",
        "type": "skill",
        "source_url": "https://github.com/dragnoir/Shopify-agent-skills",
        "source_kind": "github",
        "description": "Shopify functions development",
        "import_method": "github_inspect",
        "imported_from_pack": "shopify-agent-skills",
    },
    {
        "id": "shopify-graphql",
        "name": "Shopify GraphQL",
        "type": "skill",
        "source_url": "https://github.com/dragnoir/Shopify-agent-skills",
        "source_kind": "github",
        "description": "Shopify GraphQL API usage",
        "import_method": "github_inspect",
        "imported_from_pack": "shopify-agent-skills",
    },
    {
        "id": "shopify-cli",
        "name": "Shopify CLI",
        "type": "skill",
        "source_url": "https://github.com/dragnoir/Shopify-agent-skills",
        "source_kind": "github",
        "description": "Shopify CLI tools",
        "import_method": "github_inspect",
        "imported_from_pack": "shopify-agent-skills",
    },
    {
        "id": "wordpress-agent",
        "name": "WordPress Agent",
        "type": "skill",
        "source_url": "https://github.com/Automattic/wordpress-agent-skills",
        "source_kind": "github",
        "description": "WordPress site/theme creation (Automattic early prototypes)",
        "import_method": "github_inspect",
    },

    # --- E. ADS / PAID MEDIA / SOCIAL ---
    {
        "id": "claude-ads",
        "name": "Claude Ads Pack",
        "type": "skill",
        "source_url": "https://github.com/AgriciDaniel/claude-ads",
        "source_kind": "github",
        "description": "Google Ads, Meta Ads, YouTube Ads, LinkedIn Ads, TikTok Ads, Microsoft Ads, Apple Search Ads",
        "import_method": "github_inspect",
        "is_pack": True,
    },
    {
        "id": "facebook-ads-optimizer",
        "name": "Facebook Ads Optimizer",
        "type": "skill",
        "source_url": "",
        "source_kind": "placeholder",
        "description": "Facebook/Meta Ads optimization (placeholder - no trusted source found)",
        "import_method": "placeholder",
        "status": "placeholder",
    },
    {
        "id": "personal-brand-builder",
        "name": "Personal Brand Builder",
        "type": "skill",
        "source_url": "",
        "source_kind": "community",
        "description": "Personal brand development strategy and execution",
        "import_method": "manual",
    },
    {
        "id": "creative-director",
        "name": "Creative Director",
        "type": "skill",
        "source_url": "",
        "source_kind": "community",
        "description": "Brand ideation, creative direction, concept development",
        "import_method": "manual",
    },

    # --- F. IMAGE / MEDIA ---
    {
        "id": "nano-banana-pro",
        "name": "Nano Banana Pro",
        "type": "skill",
        "source_url": "",
        "source_kind": "community",
        "description": "Gemini 3 Pro Image / Nano Banana Pro image generation",
        "import_method": "manual",
    },
    {
        "id": "nano-banana-ppt",
        "name": "Nano Banana PPT",
        "type": "skill",
        "source_url": "https://github.com/op7418/NanoBanana-PPT-Skills",
        "source_kind": "github",
        "description": "Presentation image generation and PPT/media workflows",
        "import_method": "github_inspect",
    },

    # --- G. DIRECTORY METADATA ---
    {
        "id": "awesome-agent-skills",
        "name": "Awesome Agent Skills Directory",
        "type": "metadata",
        "source_url": "https://github.com/AiDA-Agents/awesome-agent-skills",
        "source_kind": "github",
        "description": "Directory metadata source - ecosystem skills index",
        "import_method": "metadata_only",
    },
    {
        "id": "awesome-claude-code-subagents",
        "name": "Awesome Claude Code Subagents Directory",
        "type": "metadata",
        "source_url": "https://github.com/AiDA-Agents/awesome-claude-code-subagents",
        "source_kind": "github",
        "description": "Directory metadata source - subagents index",
        "import_method": "metadata_only",
    },
]


def clone_or_fetch_repo(url: str, dest: Path) -> bool:
    """Shallow clone a repo. Returns True on success."""
    if not url:
        return False
    try:
        if dest.exists():
            shutil.rmtree(dest)
        result = subprocess.run(
            ["git", "clone", "--depth=1", url, str(dest)],
            capture_output=True, text=True, timeout=60
        )
        return result.returncode == 0
    except Exception as e:
        log(f"Clone failed for {url}: {e}", "ERROR")
        return False


def find_skill_file(repo_dir: Path, skill_name: str) -> Optional[Path]:
    """Try to find a skill file in a cloned repo."""
    # Common patterns
    candidates = [
        repo_dir / f"{skill_name}" / "SKILL.md",
        repo_dir / "skills" / f"{skill_name}" / "SKILL.md",
        repo_dir / f".claude" / "skills" / f"{skill_name}" / "SKILL.md",
        repo_dir / f"{skill_name}.md",
        repo_dir / "skills" / f"{skill_name}.md",
    ]
    for c in candidates:
        if c.exists():
            return c

    # Glob for any SKILL.md
    for p in repo_dir.rglob("SKILL.md"):
        if skill_name.lower() in str(p).lower():
            return p

    # Glob for matching .md
    for p in repo_dir.rglob("*.md"):
        if p.stem.lower() == skill_name.lower() or skill_name.lower().replace("-", "") in p.stem.lower().replace("-", ""):
            return p

    return None


def find_agent_file(repo_dir: Path, agent_name: str) -> Optional[Path]:
    """Try to find an agent file in a cloned repo."""
    candidates = [
        repo_dir / f"{agent_name}.md",
        repo_dir / "agents" / f"{agent_name}.md",
        repo_dir / ".claude" / "agents" / f"{agent_name}.md",
        repo_dir / "subagents" / f"{agent_name}.md",
    ]
    for c in candidates:
        if c.exists():
            return c

    for p in repo_dir.rglob("*.md"):
        if agent_name.lower().replace("-", "") in p.stem.lower().replace("-", ""):
            return p

    return None


def normalize_item(item: dict, content: str = "", source_files: dict = None):
    """Create the normalized source-of-truth entry."""
    item_id = item["id"]
    item_type = item.get("type", "skill")

    if item_type in ("agent", "subagent"):
        item_dir = AGENTS_DIR / item_id
    elif item_type == "metadata":
        # Metadata items go in a special location
        item_dir = SKILLS_DIR / item_id
    else:
        item_dir = SKILLS_DIR / item_id

    item_dir.mkdir(parents=True, exist_ok=True)
    for subdir in ("references", "templates", "scripts"):
        (item_dir / subdir).mkdir(exist_ok=True)

    # spec.yaml
    spec = default_spec(item_id, item_type)
    spec.update({
        "name": item.get("name", item_id),
        "description": item.get("description", ""),
        "source_url": item.get("source_url", ""),
        "source_kind": item.get("source_kind", "github"),
        "imported_from_pack": item.get("imported_from_pack", ""),
        "status": item.get("status", "imported"),
    })
    save_spec(item_dir, spec)

    # prompt.md
    if content:
        write_text(item_dir / "prompt.md", content)
    elif not (item_dir / "prompt.md").exists():
        write_text(item_dir / "prompt.md", generate_prompt(item))

    # source.json
    source = {
        "id": item_id,
        "source_url": item.get("source_url", ""),
        "source_kind": item.get("source_kind", ""),
        "import_method": item.get("import_method", ""),
        "imported_from_pack": item.get("imported_from_pack", ""),
        "imported_at": datetime.datetime.now().isoformat(),
        "is_pack": item.get("is_pack", False),
        "notes": item.get("notes", ""),
    }
    write_json(item_dir / "source.json", source)

    # CHANGELOG.md
    if not (item_dir / "CHANGELOG.md").exists():
        write_text(item_dir / "CHANGELOG.md",
                    f"# Changelog - {item.get('name', item_id)}\n\n"
                    f"## 0.1.0 ({datetime.date.today().isoformat()})\n"
                    f"- Initial import from {item.get('source_url', 'unknown')}\n")

    # Copy any extra source files
    if source_files:
        for name, file_content in source_files.items():
            write_text(item_dir / "references" / name, file_content)

    log(f"Normalized: {item_id}")
    return item_dir


def generate_prompt(item: dict) -> str:
    """Generate a useful prompt.md for an item based on its metadata."""
    item_id = item["id"]
    name = item.get("name", item_id)
    desc = item.get("description", "")
    item_type = item.get("type", "skill")

    if item_type == "metadata":
        return (
            f"# {name}\n\n"
            f"This is a directory/metadata reference, not an executable skill.\n\n"
            f"Source: {item.get('source_url', 'unknown')}\n\n"
            f"## Purpose\n{desc}\n\n"
            f"## Usage\nUse this as a reference for discovering additional skills and agents.\n"
        )

    if item_type in ("agent", "subagent"):
        return (
            f"# {name}\n\n"
            f"You are the {name} agent.\n\n"
            f"## Role\n{desc}\n\n"
            f"## Instructions\n"
            f"- Focus on your specialized domain\n"
            f"- Produce high-quality, production-ready output\n"
            f"- Follow best practices for your area of expertise\n"
            f"- Communicate clearly about trade-offs and decisions\n"
        )

    # Skill prompt
    return (
        f"# {name}\n\n"
        f"{desc}\n\n"
        f"## When to Use\n"
        f"Use this skill when the user needs help with: {desc.lower()}\n\n"
        f"## Workflow\n"
        f"1. Understand the user's specific requirements\n"
        f"2. Gather necessary context and constraints\n"
        f"3. Execute the core {name.lower()} workflow\n"
        f"4. Validate output quality\n"
        f"5. Present results with actionable next steps\n\n"
        f"## Source\n"
        f"Upstream: {item.get('source_url', 'N/A')}\n"
    )


def import_item(item: dict, temp_dir: Path) -> bool:
    """Import a single item from upstream."""
    item_id = item["id"]
    method = item.get("import_method", "manual")
    source_url = item.get("source_url", "")

    log(f"Importing: {item_id} (method={method})")

    if method == "placeholder":
        normalize_item(item)
        log(f"Created placeholder: {item_id}")
        return True

    if method == "metadata_only":
        normalize_item(item)
        log(f"Created metadata entry: {item_id}")
        return True

    if method == "manual":
        normalize_item(item)
        log(f"Created manual entry: {item_id} (needs manual content)")
        return True

    if method in ("github_inspect", "github_subpath") and source_url:
        # Clone the repo
        repo_name = source_url.rstrip("/").split("/")[-1]
        repo_dir = temp_dir / repo_name

        if not repo_dir.exists():
            ok = clone_or_fetch_repo(source_url, repo_dir)
            if not ok:
                log(f"Clone failed for {item_id}, creating placeholder", "WARN")
                item["notes"] = f"Clone failed for {source_url}"
                item["status"] = "clone_failed"
                normalize_item(item)
                return False

        # Try to find the actual content
        item_type = item.get("type", "skill")
        content = ""
        source_files = {}

        if item_type in ("agent", "subagent"):
            found = find_agent_file(repo_dir, item_id)
        else:
            found = find_skill_file(repo_dir, item_id)

        if found and found.exists():
            content = read_text(found)
            log(f"Found upstream content: {found}")
            # Also grab any siblings
            parent = found.parent
            for f in parent.iterdir():
                if f.is_file() and f != found and f.suffix in (".md", ".json", ".yaml", ".yml", ".txt"):
                    source_files[f.name] = read_text(f)
        else:
            # Try README for pack-level items
            readme = repo_dir / "README.md"
            if readme.exists():
                source_files["upstream-README.md"] = read_text(readme)
            log(f"No specific file found for {item_id} in {repo_dir}, using generated prompt", "WARN")

        normalize_item(item, content, source_files)
        return True

    # Fallback
    normalize_item(item)
    return True


def main():
    if "--list" in sys.argv:
        print(f"{'ID':<35} {'Type':<10} {'Method':<15} {'Source'}")
        print("-" * 100)
        for item in DISCOVERED:
            print(f"{item['id']:<35} {item.get('type','skill'):<10} "
                  f"{item.get('import_method','?'):<15} {item.get('source_url','')[:50]}")
        print(f"\nTotal: {len(DISCOVERED)} items")
        return

    # Determine what to import
    if "--all" in sys.argv:
        to_import = DISCOVERED
    elif len(sys.argv) > 1 and not sys.argv[1].startswith("-"):
        target_id = sys.argv[1]
        to_import = [i for i in DISCOVERED if i["id"] == target_id]
        if not to_import:
            print(f"Item not found: {target_id}")
            print("Use --list to see available items")
            sys.exit(1)
    else:
        print(__doc__)
        sys.exit(1)

    print(f"Importing {len(to_import)} items...\n")

    # Use a shared temp dir for clones
    temp_dir = ROOT / ".tmp-imports"
    temp_dir.mkdir(exist_ok=True)

    success = 0
    failed = 0

    for item in to_import:
        try:
            ok = import_item(item, temp_dir)
            if ok:
                print(f"  OK    {item['id']}")
                success += 1
            else:
                print(f"  WARN  {item['id']} (partial)")
                success += 1  # Still created entry
        except Exception as e:
            print(f"  FAIL  {item['id']}: {e}")
            failed += 1

    # Cleanup temp
    if temp_dir.exists():
        try:
            shutil.rmtree(temp_dir)
        except:
            pass

    print(f"\n{'='*50}")
    print(f"Imported: {success}, Failed: {failed}")
    print(f"Run `python scripts/build-all.py` to build targets")


if __name__ == "__main__":
    main()
