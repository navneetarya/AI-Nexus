#!/usr/bin/env python3
"""
validate_vendor_facts.py  (Phase 1, task 1.12)

Checks lib/vendor-facts.data.json, the single source of truth for verified
vendor prices and limits, and checks that the `pricing:` line in constants.ts
for each verified tool agrees with it.

Exit code 0 = pass (warnings allowed), 1 = at least one error.
Works on Windows, macOS and Linux. Needs only the Python standard library.

Usage:
    python validate_vendor_facts.py
    python validate_vendor_facts.py --strict     # treat warnings as errors
"""

import json
import re
import sys
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "lib" / "vendor-facts.data.json"
CONSTANTS = ROOT / "constants.ts"

ALLOWED_UNITS = {
    "characters", "credits", "minutes", "hours", "words", "tasks", "operations",
    "prompts", "images", "videos", "slides", "seats", "other",
}
ALLOWED_PERIODS = {"day", "month", "year", "one-time"}
ALLOWED_FREE_ACCESS = {"free-plan", "trial-only", "none"}
ISO = re.compile(r"^\d{4}-\d{2}-\d{2}$")

# Hosts that are never an official vendor source for a price or a limit.
THIRD_PARTY_HOSTS = (
    "g2.com", "capterra.com", "trustpilot.com", "reddit.com", "youtube.com",
    "medium.com", "getapp.com", "softwareadvice.com", "producthunt.com",
    "aivoicereview.com", "fish.audio", "costbench.com", "eesel.ai",
    "anygen.io", "layer3labs.io", "lorphic.com", "creatify.ai",
)

errors = []
warnings = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def words(text):
    return len([w for w in text.strip().split() if w])


def host_of(url):
    try:
        return (urlparse(url).hostname or "").lower()
    except ValueError:
        return ""


def check_url(label, url, where):
    if not isinstance(url, str) or not url.startswith("https://"):
        err(f"{where}: {label} must be an https URL (got {url!r})")
        return
    host = host_of(url)
    if not host:
        err(f"{where}: {label} has no host ({url!r})")
        return
    for bad in THIRD_PARTY_HOSTS:
        if host == bad or host.endswith("." + bad):
            err(f"{where}: {label} points at a third-party site ({host})")


def number_or_none(v):
    return v is None or (isinstance(v, (int, float)) and not isinstance(v, bool) and v >= 0)


def check_plan(slug, plan, today):
    where = f"{slug}/plan:{plan.get('id')}"
    for key in ("id", "name", "isFree", "priceMonthly", "priceMonthlyBilledAnnually",
                "oneTimePrice", "customPricing", "allowance", "commercialUse",
                "highlights", "notes"):
        if key not in plan:
            err(f"{where}: missing field {key}")
    for key in ("priceMonthly", "priceMonthlyBilledAnnually", "oneTimePrice"):
        if not number_or_none(plan.get(key)):
            err(f"{where}: {key} must be a non-negative number or null")
    if plan.get("isFree") and plan.get("priceMonthly") not in (0, None):
        err(f"{where}: free plan has a non-zero monthly price")
    if (not plan.get("isFree")) and plan.get("priceMonthly") == 0:
        err(f"{where}: paid plan priced at 0")
    m, a = plan.get("priceMonthly"), plan.get("priceMonthlyBilledAnnually")
    if isinstance(m, (int, float)) and isinstance(a, (int, float)) and a > m:
        err(f"{where}: annual-billing price ({a}) is higher than monthly ({m})")
    if plan.get("customPricing") and (m or a):
        warn(f"{where}: customPricing is true but a price is also set")
    cu = plan.get("commercialUse")
    if cu not in (True, False, None):
        err(f"{where}: commercialUse must be true, false or null")
    al = plan.get("allowance")
    if al is not None:
        if al.get("unit") not in ALLOWED_UNITS:
            err(f"{where}: allowance.unit {al.get('unit')!r} not allowed")
        if al.get("period") not in ALLOWED_PERIODS:
            err(f"{where}: allowance.period {al.get('period')!r} not allowed")
        if not isinstance(al.get("label"), str) or not al["label"].strip():
            err(f"{where}: allowance.label missing")
        amt = al.get("amount")
        if amt is not None and not (isinstance(amt, (int, float)) and amt >= 0):
            err(f"{where}: allowance.amount must be a number or null")
    if not isinstance(plan.get("highlights"), list):
        err(f"{where}: highlights must be a list")


def check_tool(tool, rules, today, slugs_in_constants):
    slug = tool.get("slug", "<no slug>")
    for key in ("slug", "name", "status", "pricingPageUrl", "verifiedISO", "currency",
                "freeAccess", "trial", "plans", "card", "indiaNote", "sources"):
        if key not in tool:
            err(f"{slug}: missing field {key}")
    if slugs_in_constants is not None and slug not in slugs_in_constants:
        err(f"{slug}: slug does not exist in constants.ts")

    status = tool.get("status")
    if status not in ("pending", "verified"):
        err(f"{slug}: status must be 'pending' or 'verified'")
        return
    if tool.get("freeAccess") not in (None,) + tuple(ALLOWED_FREE_ACCESS):
        err(f"{slug}: freeAccess {tool.get('freeAccess')!r} not allowed")

    plans = tool.get("plans", [])
    ids = [p.get("id") for p in plans]
    if len(ids) != len(set(ids)):
        err(f"{slug}: duplicate plan ids")
    for p in plans:
        check_plan(slug, p, today)

    for s in tool.get("sources", []):
        if not s.get("label"):
            err(f"{slug}: a source has no label")
        check_url("source url", s.get("url"), slug)

    if status == "pending":
        return

    # ---- verified entries only
    check_url("pricingPageUrl", tool.get("pricingPageUrl"), slug)
    iso = tool.get("verifiedISO")
    if not isinstance(iso, str) or not ISO.match(iso):
        err(f"{slug}: verifiedISO must be YYYY-MM-DD")
    else:
        try:
            d = datetime.strptime(iso, "%Y-%m-%d").date()
            if d > today:
                err(f"{slug}: verifiedISO {iso} is in the future")
            age = (today - d).days
            if age > rules["staleAfterDays"]:
                warn(f"{slug}: verified {age} days ago (stale after {rules['staleAfterDays']})")
        except ValueError:
            err(f"{slug}: verifiedISO {iso} is not a real date")
    if not plans:
        err(f"{slug}: verified entry has no plans")

    fa = tool.get("freeAccess")
    has_free = any(p.get("isFree") for p in plans)
    if fa == "free-plan" and not has_free:
        err(f"{slug}: freeAccess is free-plan but no plan has isFree true")
    if fa == "trial-only":
        if has_free:
            err(f"{slug}: freeAccess is trial-only but a free plan exists")
        if not tool.get("trial"):
            err(f"{slug}: freeAccess is trial-only but trial is null")
    if tool.get("trial") is not None:
        t = tool["trial"]
        if t.get("days") is not None and not (isinstance(t["days"], int) and t["days"] > 0):
            err(f"{slug}: trial.days must be a positive integer or null")
        if t.get("cardRequired") not in (True, False, None):
            err(f"{slug}: trial.cardRequired must be true, false or null")

    card = tool.get("card")
    if card is None:
        err(f"{slug}: verified entry has no card text")
    else:
        bf, si = card.get("bestFor", ""), card.get("skipIf", "")
        if not bf.strip():
            err(f"{slug}: card.bestFor is empty")
        elif words(bf) > rules["bestForMaxWords"]:
            err(f"{slug}: card.bestFor is {words(bf)} words (max {rules['bestForMaxWords']})")
        if not si.strip():
            err(f"{slug}: card.skipIf is empty")
        elif words(si) > rules["skipIfMaxWords"]:
            err(f"{slug}: card.skipIf is {words(si)} words (max {rules['skipIfMaxWords']})")


def read_constants_pricing():
    """Map slug -> the `pricing:` string of that tool in constants.ts."""
    if not CONSTANTS.exists():
        return None, {}
    text = CONSTANTS.read_text(encoding="utf-8")
    slugs = set(re.findall(r"slug:\s*'([a-z0-9\-]+)'", text))
    pricing = {}
    starts = [(m.start(), m.group(1)) for m in re.finditer(r"slug:\s*'([a-z0-9\-]+)'", text)]
    for i, (pos, slug) in enumerate(starts):
        end = starts[i + 1][0] if i + 1 < len(starts) else len(text)
        block = text[pos:end]
        m = re.search(r"\bpricing:\s*'((?:[^'\\]|\\.)*)'", block)
        if m:
            pricing[slug] = m.group(1)
    return slugs, pricing


def published_prices(tool):
    """Every monthly-equivalent price the vendor publishes for a paid plan."""
    out = []
    for p in tool.get("plans", []):
        if p.get("isFree"):
            continue
        for key in ("priceMonthly", "priceMonthlyBilledAnnually"):
            v = p.get(key)
            if isinstance(v, (int, float)):
                out.append(float(v))
    return out


def check_copy_drift(tools, pricing):
    """The 'from $X' number in constants.ts must be a price the vendor publishes for the cheapest paid plan."""
    for tool in tools:
        if tool.get("status") != "verified":
            continue
        slug = tool["slug"]
        line = pricing.get(slug)
        if not line:
            continue
        paid = [p for p in tool.get("plans", []) if not p.get("isFree")]
        priced = []
        for p in paid:
            vals = [v for v in (p.get("priceMonthly"), p.get("priceMonthlyBilledAnnually"))
                    if isinstance(v, (int, float))]
            if vals:
                priced.append((min(vals), vals))
        if not priced:
            continue  # nothing verified to compare against, so nothing to enforce
        cheapest_low, cheapest_vals = min(priced, key=lambda x: x[0])
        m = re.search(r"from\s*\$(\d+(?:\.\d+)?)", line, flags=re.IGNORECASE)
        if not m:
            warn(f"{slug}: constants.ts pricing {line!r} has no 'from $X' number to compare")
            continue
        shown = float(m.group(1))
        if not any(abs(shown - v) < 0.005 for v in cheapest_vals):
            err(f"{slug}: constants.ts pricing {line!r} shows ${shown:g}, but the cheapest "
                f"paid plan is published at {sorted(set(cheapest_vals))}")


# ---------------------------------------------------------------------------
# Site-wide stale-claim scan (Phase 1, task 1.13).
# Each rule: (vendor regex, bad-claim regex, message). A line that matches BOTH
# is an error. Only claims already proven wrong against the vendor's own pages
# are listed here. Add a rule whenever a copy correction is made.
# ---------------------------------------------------------------------------
STALE_RULES = [
    (r"eleven\s?labs", r"\d[\d,]*\s+(characters|chars)\b", "ElevenLabs allowance is credits, not characters"),
    (r"eleven\s?labs", r"no credit card", "ElevenLabs pages do not state that no card is needed"),
    (r"eleven\s?labs", r"cheapest commercial licen", "unverified 'cheapest commercial licence' claim"),
    (r"eleven\s?labs", r"all pre-made voices", "unverified 'all pre-made voices' claim"),
    (r"jasper", r"\$39\b", "Jasper Pro is $59/mo annual ($69 monthly); no $39 plan"),
    (r"jasper", r"50\+ templates|seo mode|custom ai model", "feature not on Jasper's current plans"),
    (r"pictory", r"from \$19\b", "Pictory Starter is $25/mo annual ($29 monthly)"),
    (r"descript", r"from \$12\b|hobbyist \(\$12", "Descript Hobbyist is $16/mo annual"),
    (r"murf", r"\bbasic plan\b", "Murf has no 'Basic' plan"),
]
# Claims that cannot be confirmed from an official page yet. Reported as one
# warning per rule so they stay visible without drowning the output.
UNVERIFIED_RULES = [
    (r"gamma", r"\$8\s*/?\s*(month|mo)\b|from \$8\b|free\s*[–-]\s*\$8", "Gamma '$8/month' (third-party sources give $8 to $12)"),
    (r"murf", r"\$19\s*/?\s*(month|mo)\b|from \$19\b", "Murf '$19/month' (Studio prices not shown on murf.ai/pricing)"),
]


def scan_site_copy():
    files = [ROOT / "constants.ts", ROOT / "public" / "llms.txt", ROOT / "public" / "llms-full.txt"]
    for sub in ("pages", "blog"):
        d = ROOT / sub
        if d.is_dir():
            files += sorted(d.glob("*.ts")) + sorted(d.glob("*.tsx"))
    hits = {}
    for f in files:
        if not f.is_file():
            continue
        try:
            lines = f.read_text(encoding="utf-8", errors="replace").splitlines()
        except OSError:
            continue
        for n, line in enumerate(lines, 1):
            low = line.lower()
            for vend, bad, msg in STALE_RULES:
                if re.search(vend, low) and re.search(bad, low):
                    # Allow lines that explain credits vs characters, and API per-1,000-character prices.
                    if "characters" in bad and ("credit" in low or "per 1,000" in low):
                        continue
                    err(f"{f.relative_to(ROOT)}:{n}: {msg}")
            for vend, bad, msg in UNVERIFIED_RULES:
                if re.search(vend, low) and re.search(bad, low):
                    hits.setdefault(msg, set()).add(str(f.relative_to(ROOT)))
    for msg, fs in hits.items():
        warn(f"{msg} appears in {len(fs)} file(s); confirm on the official page, then fix")


def main():
    strict = "--strict" in sys.argv
    today = date.today()

    if not DATA.exists():
        print(f"FAIL: {DATA} not found")
        return 1
    try:
        raw = json.loads(DATA.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"FAIL: vendor-facts.data.json is not valid JSON: {e}")
        return 1

    if raw.get("schemaVersion") != 1:
        err(f"schemaVersion must be 1 (got {raw.get('schemaVersion')!r})")
    rules = raw.get("rules", {})
    for k in ("bestForMaxWords", "skipIfMaxWords", "staleAfterDays"):
        if not isinstance(rules.get(k), int) or rules[k] <= 0:
            err(f"rules.{k} must be a positive integer")
    if errors:
        return report(strict)

    tools = raw.get("tools", [])
    slugs_in_constants, pricing = read_constants_pricing()
    if slugs_in_constants is None:
        warn("constants.ts not found; skipped slug and copy-drift checks")

    seen = set()
    for t in tools:
        s = t.get("slug")
        if s in seen:
            err(f"duplicate tool slug {s}")
        seen.add(s)
        check_tool(t, rules, today, slugs_in_constants)

    if pricing:
        check_copy_drift(tools, pricing)

    scan_site_copy()

    verified = sum(1 for t in tools if t.get("status") == "verified")
    print(f"Checked {len(tools)} tools ({verified} verified, {len(tools) - verified} pending).")
    return report(strict)


def report(strict):
    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    if errors or (strict and warnings):
        print(f"\nFAIL: {len(errors)} error(s), {len(warnings)} warning(s)")
        return 1
    print(f"\nPASS: 0 errors, {len(warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
