#!/usr/bin/env python3
"""
validate_deals.py  (C6a, Nov 2026)

Checks data/deals.json, the source of truth for verified, time-limited affiliate
discounts shown by components/DealBox.tsx. Mirrors validate_vendor_facts.py's
style and exit-code convention.

Enforced as errors (fail the build):
  - the file is valid JSON with a top-level "deals" array
  - every deal has a non-empty "tool", "discount" and "source"
  - "source" is an https URL (the vendor's own page, not a third-party listing)
  - "verifiedISO" / "expiresISO" (when present) are real YYYY-MM-DD dates
  - "verifiedISO" is not in the future
  - "expiresISO" is not already in the past (an expired entry must be removed,
    not left in the file for the build to quietly hide via lib/deals.ts)
  - "tool" matches a slug that actually exists in constants.ts TOOLS
  - "code" is a non-empty string or null — never an empty string placeholder

Warnings (do not fail the build):
  - "verifiedISO" is more than 30 days old (lib/deals.ts already hides a stale
    deal from readers; this is just an early heads-up to re-verify or remove it)

Exit code 0 = pass (warnings allowed), 1 = at least one error.
Works on Windows, macOS and Linux. Needs only the Python standard library.

Usage:
    python validate_deals.py
    python validate_deals.py --strict     # treat warnings as errors
"""

import json
import re
import sys
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "deals.json"
CONSTANTS = ROOT / "constants.ts"

ISO = re.compile(r"^\d{4}-\d{2}-\d{2}$")
STALE_AFTER_DAYS = 30

errors = []
warnings = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def host_of(url):
    try:
        return (urlparse(url).hostname or "").lower()
    except ValueError:
        return ""


def check_iso(label, where, value, *, allow_none=False, today=None):
    if value is None:
        if not allow_none:
            err(f"{where}: {label} is required")
        return None
    if not isinstance(value, str) or not ISO.match(value):
        err(f"{where}: {label} must be YYYY-MM-DD (got {value!r})")
        return None
    try:
        d = datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        err(f"{where}: {label} {value!r} is not a real date")
        return None
    if today and label == "verifiedISO" and d > today:
        err(f"{where}: verifiedISO {value} is in the future")
    return d


def tool_slugs_in_constants():
    if not CONSTANTS.exists():
        return None
    text = CONSTANTS.read_text(encoding="utf-8")
    return set(re.findall(r"slug:\s*'([a-z0-9\-]+)'", text))


def check_deal(deal, today, slugs):
    tool = deal.get("tool")
    where = f"deal/tool:{tool!r}"
    for key in ("tool", "code", "discount", "source", "verifiedISO", "expiresISO"):
        if key not in deal:
            err(f"{where}: missing field {key}")

    if not isinstance(tool, str) or not tool.strip():
        err(f"{where}: tool must be a non-empty string")
    elif slugs is not None and tool not in slugs:
        err(f"{where}: tool {tool!r} does not match any slug in constants.ts (must be an AFFILIATE_LINKS key)")

    if not isinstance(deal.get("discount"), str) or not deal["discount"].strip():
        err(f"{where}: discount must be a non-empty string")

    code = deal.get("code")
    if code is not None and (not isinstance(code, str) or not code.strip()):
        err(f"{where}: code must be a non-empty string or null (never an empty-string placeholder)")

    source = deal.get("source")
    if not isinstance(source, str) or not source.startswith("https://"):
        err(f"{where}: source must be an https URL (got {source!r})")
    elif not host_of(source):
        err(f"{where}: source has no host ({source!r})")

    verified = check_iso("verifiedISO", where, deal.get("verifiedISO"), today=today)
    expires = check_iso("expiresISO", where, deal.get("expiresISO"), allow_none=True)

    if expires is not None and expires < today:
        err(f"{where}: expiresISO {deal.get('expiresISO')} is in the past — remove this entry instead of "
            f"leaving an expired deal in the file")

    if verified is not None:
        age = (today - verified).days
        if age > STALE_AFTER_DAYS:
            warn(f"{where}: verified {age} days ago (DealBox hides it after {STALE_AFTER_DAYS} days) — "
                 f"re-verify and bump verifiedISO, or remove the entry")


def main():
    strict = "--strict" in sys.argv
    today = date.today()

    if not DATA.exists():
        print(f"FAIL: {DATA} not found")
        return 1
    try:
        raw = json.loads(DATA.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"FAIL: deals.json is not valid JSON: {e}")
        return 1

    deals = raw.get("deals")
    if not isinstance(deals, list):
        err("top-level 'deals' must be a list")
        return report(strict)

    slugs = tool_slugs_in_constants()
    if slugs is None:
        warn("constants.ts not found; skipped tool-slug check")

    seen = set()
    for d in deals:
        tool = d.get("tool") if isinstance(d, dict) else None
        if tool in seen:
            err(f"duplicate deal entry for tool {tool!r}")
        seen.add(tool)
        if isinstance(d, dict):
            check_deal(d, today, slugs)
        else:
            err("each entry in 'deals' must be an object")

    return report(strict)


def report(strict):
    for w in warnings:
        print(f"WARN: {w}")
    for e in errors:
        print(f"ERROR: {e}")
    if errors:
        print(f"\nFAIL: {len(errors)} error(s), {len(warnings)} warning(s)")
        return 1
    if strict and warnings:
        print(f"\nFAIL (--strict): {len(warnings)} warning(s)")
        return 1
    print(f"OK: {len(warnings)} warning(s), 0 errors")
    return 0


if __name__ == "__main__":
    sys.exit(main())
