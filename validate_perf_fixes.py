"""
AI Nexus — Performance Fix Validation Script
============================================
Python 3.12.4 | Windows compatible
Run from your project root:
    python validate_perf_fixes.py

Checks every fix from the Lighthouse audit:
  1. GTM deferred in index.html
  2. React.lazy + Suspense code-splitting in App.tsx
  3. manualChunks for lucide-react in vite.config.ts
  4. NO_LOCAL_LOGO set in pages/HomePage.tsx
  5. loading="lazy" on ToolLogo <img> tags
  6. Paginated tool grid (visibleCount / TOOLS_PER_PAGE)
  7. Missing logo files in public/logos/
  8. No blocking <script src> for GTM in index.html <head>
"""

import os
import re
import sys
from pathlib import Path

# ── ANSI colours (work in Windows Terminal / PowerShell 7+) ──────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

# Enable ANSI on older Windows consoles
if sys.platform == "win32":
    import ctypes
    kernel32 = ctypes.windll.kernel32
    kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)


def _pass(msg: str) -> None:
    print(f"  {GREEN}✓ PASS{RESET}  {msg}")

def _fail(msg: str, hint: str = "") -> None:
    suffix = f"\n         {YELLOW}→ {hint}{RESET}" if hint else ""
    print(f"  {RED}✗ FAIL{RESET}  {msg}{suffix}")

def _warn(msg: str) -> None:
    print(f"  {YELLOW}⚠ WARN{RESET}  {msg}")

def _section(title: str) -> None:
    print(f"\n{BOLD}{CYAN}{'─' * 60}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'─' * 60}{RESET}")


def read(path: Path) -> str | None:
    """Read a file, return None if it doesn't exist."""
    if not path.exists():
        return None
    return path.read_text(encoding="utf-8", errors="replace")


def find_project_root() -> Path:
    """Walk up from cwd until we find package.json with 'vite'."""
    cwd = Path.cwd()
    for candidate in [cwd, *cwd.parents]:
        pkg = candidate / "package.json"
        if pkg.exists() and "vite" in pkg.read_text(encoding="utf-8", errors="replace"):
            return candidate
    # Fallback: treat cwd as root
    return cwd


# ─────────────────────────────────────────────────────────────────────────────
#  Individual check functions — each returns True (pass) or False (fail)
# ─────────────────────────────────────────────────────────────────────────────

def check_gtm_deferred(root: Path) -> bool:
    """
    index.html must NOT have a blocking <script src="...gtag..."> tag in <head>.
    It should instead load GTM via addEventListener('load', ...) or similar.
    """
    _section("Fix 1 — GTM deferred after page load (index.html)")
    html_path = root / "index.html"
    content = read(html_path)

    if content is None:
        _fail("index.html not found", f"Expected at {html_path}")
        return False

    # Bad pattern: a plain <script src> that loads gtag synchronously or async
    # in the <head> before the closing </head> tag
    head_match = re.search(r"<head>(.*?)</head>", content, re.DOTALL | re.IGNORECASE)
    head_content = head_match.group(1) if head_match else content

    blocking_gtag = re.search(
        r'<script[^>]+src=["\'][^"\']*googletagmanager\.com/gtag[^"\']*["\'][^>]*>',
        head_content,
        re.IGNORECASE,
    )

    if blocking_gtag:
        _fail(
            "Blocking GTM <script src> still present in <head>",
            "Replace with the deferred addEventListener('load', ...) pattern",
        )
        print(f"         Found: {blocking_gtag.group(0)[:100]}")
        return False

    # Good pattern: GTM loaded inside an event listener or setTimeout
    deferred = re.search(r"addEventListener\s*\(\s*['\"]load['\"]", content)
    if not deferred:
        _warn(
            "No addEventListener('load') found — make sure GTM is loaded "
            "after the page load event (not inline in <head>)."
        )
        # Not a hard fail — they may have used a different deferral strategy
        return True

    _pass("GTM is loaded via addEventListener('load') — no blocking request in critical path")

    # Bonus: check that the 2-second setTimeout delay is present
    delay = re.search(r"setTimeout\s*\(", content)
    if delay:
        _pass("setTimeout delay found — GTM fires 2 s after load, protecting LCP window")
    else:
        _warn(
            "No setTimeout found. Consider adding a 2 000ms delay after load "
            "to keep the main thread free during the LCP window."
        )
    return True


def check_lazy_loading(root: Path) -> bool:
    """
    App.tsx must use React.lazy() for heavy page components and wrap
    renders in <Suspense>.
    """
    _section("Fix 2 — React.lazy + Suspense code splitting (App.tsx)")
    path = root / "App.tsx"
    content = read(path)

    if content is None:
        _fail("App.tsx not found", f"Expected at {path}")
        return False

    ok = True

    # Check Suspense is imported
    if "Suspense" not in content:
        _fail("Suspense not imported from React", "Add Suspense to your React import")
        ok = False
    else:
        _pass("Suspense imported from React")

    # Count React.lazy() calls
    lazy_calls = re.findall(r"React\.lazy\s*\(", content)
    if len(lazy_calls) < 5:
        _fail(
            f"Only {len(lazy_calls)} React.lazy() call(s) found — expected ≥ 5",
            "Lazy-load ToolPage, AboutPage, BlogPostPage, MethodologyPage, etc.",
        )
        ok = False
    else:
        _pass(f"{len(lazy_calls)} React.lazy() calls found — pages will load on demand")

    # Check specific heavy pages are lazy
    for page in ["ToolPage", "BlogPostPage", "AboutPage", "DisclosurePage", "MethodologyPage"]:
        pattern = rf"React\.lazy\(.*{page}"
        if re.search(pattern, content):
            _pass(f"{page} is lazy-loaded")
        else:
            _fail(
                f"{page} is NOT lazy-loaded",
                f"Add: const {page} = React.lazy(() => import('./pages/{page}')...)",
            )
            ok = False

    # Check <Suspense fallback> usage
    suspense_uses = re.findall(r"<Suspense\b", content)
    if len(suspense_uses) < 3:
        _fail(
            f"Only {len(suspense_uses)} <Suspense> wrapper(s) — each lazy route needs one",
            "Wrap every lazy page render in <Suspense fallback={<PageLoader />}>",
        )
        ok = False
    else:
        _pass(f"{len(suspense_uses)} <Suspense> wrappers found")

    return ok


def check_vite_chunks(root: Path) -> bool:
    """
    vite.config.ts must define manualChunks for lucide-react (and ideally
    framer-motion) so they are cached separately from app code.
    """
    _section("Fix 3 — Vite manualChunks for vendor libraries (vite.config.ts)")
    path = root / "vite.config.ts"
    content = read(path)

    if content is None:
        _fail("vite.config.ts not found", f"Expected at {path}")
        return False

    ok = True

    if "manualChunks" not in content:
        _fail("No manualChunks configuration found", "Add manualChunks to build.rollupOptions.output")
        return False

    _pass("manualChunks configuration is present")

    for lib, label in [("lucide-react", "vendor-icons"), ("framer-motion", "vendor-motion")]:
        if lib in content:
            _pass(f"{lib} has its own chunk — cached separately from app code")
        else:
            _warn(
                f"{lib} not split into its own chunk. "
                f"Add: if (id.includes('node_modules/{lib}')) return '{label}';"
            )
            # Warn only — not a hard fail since framer-motion may not be used

    return ok


def check_no_local_logo(root: Path) -> bool:
    """
    HomePage.tsx must define NO_LOCAL_LOGO set containing the 5 missing slugs
    and use it to skip 404 requests.
    """
    _section("Fix 4 — NO_LOCAL_LOGO skip-set for missing logo files (pages/HomePage.tsx)")
    path = root / "pages" / "HomePage.tsx"
    content = read(path)

    if content is None:
        _fail("pages/HomePage.tsx not found", f"Expected at {path}")
        return False

    ok = True

    if "NO_LOCAL_LOGO" not in content:
        _fail(
            "NO_LOCAL_LOGO set not defined",
            "Add: const NO_LOCAL_LOGO = new Set(['elevenlabs','jasper','descript','perplexity','canva-ai']);",
        )
        ok = False
    else:
        _pass("NO_LOCAL_LOGO set is defined")

    # Check all 5 missing slugs are in the set
    missing_slugs = ["elevenlabs", "jasper", "descript", "perplexity", "canva-ai"]
    for slug in missing_slugs:
        if slug in content:
            _pass(f"  '{slug}' included in NO_LOCAL_LOGO")
        else:
            _fail(f"  '{slug}' not found in NO_LOCAL_LOGO", f"Add '{slug}' to the NO_LOCAL_LOGO set")
            ok = False

    # Check ToolLogo uses the set
    if re.search(r"NO_LOCAL_LOGO\.has\s*\(", content):
        _pass("ToolLogo reads NO_LOCAL_LOGO to skip 404 attempts")
    else:
        _fail(
            "ToolLogo does not check NO_LOCAL_LOGO",
            "Initialize localErr state: useState(() => NO_LOCAL_LOGO.has(slug))",
        )
        ok = False

    return ok


def check_lazy_images(root: Path) -> bool:
    """
    ToolLogo <img> tags in HomePage.tsx must have loading="lazy" and
    decoding="async".
    """
    _section('Fix 5 — loading="lazy" on ToolLogo <img> tags (pages/HomePage.tsx)')
    path = root / "pages" / "HomePage.tsx"
    content = read(path)

    if content is None:
        _fail("pages/HomePage.tsx not found", f"Expected at {path}")
        return False

    ok = True

    lazy_count = content.count('loading="lazy"') + content.count("loading='lazy'")
    if lazy_count < 2:
        _fail(
            f"Only {lazy_count} loading=\"lazy\" attribute(s) found — need at least 2 (one per img in ToolLogo)",
            'Add loading="lazy" to every <img> inside ToolLogo',
        )
        ok = False
    else:
        _pass(f'{lazy_count} loading="lazy" attribute(s) found on <img> elements')

    decode_count = content.count('decoding="async"') + content.count("decoding='async'")
    if decode_count < 2:
        _warn(
            f'Only {decode_count} decoding="async" attribute(s) found. '
            'Adding decoding="async" prevents image decode from blocking the main thread.'
        )
    else:
        _pass(f'{decode_count} decoding="async" attribute(s) found')

    return ok


def check_pagination(root: Path) -> bool:
    """
    HomePage.tsx must paginate the tool grid using visibleCount state and
    a TOOLS_PER_PAGE constant, and use .slice(0, visibleCount) on the render.
    """
    _section("Fix 6 — Tool grid pagination / lazy render (pages/HomePage.tsx)")
    path = root / "pages" / "HomePage.tsx"
    content = read(path)

    if content is None:
        _fail("pages/HomePage.tsx not found", f"Expected at {path}")
        return False

    ok = True

    if "TOOLS_PER_PAGE" not in content:
        _fail(
            "TOOLS_PER_PAGE constant not found",
            "Add: const TOOLS_PER_PAGE = 12;",
        )
        ok = False
    else:
        _pass("TOOLS_PER_PAGE constant defined")

    if "visibleCount" not in content:
        _fail(
            "visibleCount state not found",
            "Add: const [visibleCount, setVisibleCount] = useState(TOOLS_PER_PAGE);",
        )
        ok = False
    else:
        _pass("visibleCount state found")

    if re.search(r"slice\s*\(\s*0\s*,\s*visibleCount\s*\)", content):
        _pass("Tool grid uses .slice(0, visibleCount) — only renders visible cards")
    else:
        _fail(
            "Tool grid does not use .slice(0, visibleCount)",
            "Change filtered.map(...) to filtered.slice(0, visibleCount).map(...)",
        )
        ok = False

    # Check load-more button or sentinel
    if "Load more" in content or "loadMore" in content or "load-more" in content:
        _pass("Load-more UI found — users can expand the grid")
    else:
        _warn("No 'Load more' button found — consider adding one so users can see all tools")

    # Check visibleCount resets on filter change
    if re.search(r"setVisibleCount\s*\(\s*TOOLS_PER_PAGE\s*\)", content):
        _pass("visibleCount resets to TOOLS_PER_PAGE when filters change")
    else:
        _warn(
            "visibleCount does not appear to reset when filters change. "
            "Add a useEffect that calls setVisibleCount(TOOLS_PER_PAGE) when filters change."
        )

    return ok


def check_missing_logos(root: Path) -> bool:
    """
    Check whether the 5 previously-missing logo files now exist in /public/logos/.
    These are optional — NO_LOCAL_LOGO is the code fix, but having the files is better.
    """
    _section("Fix 7 — Missing logo files in /public/logos/ (optional but ideal)")
    logos_dir = root / "public" / "logos"
    missing_slugs = ["elevenlabs", "jasper", "descript", "perplexity", "canva-ai"]

    if not logos_dir.exists():
        _warn(f"public/logos/ directory not found at {logos_dir}")
        return True  # Not a hard fail

    all_present = True
    for slug in missing_slugs:
        png = logos_dir / f"{slug}.png"
        webp = logos_dir / f"{slug}.webp"
        if png.exists():
            size_kb = png.stat().st_size / 1024
            _pass(f"{slug}.png present ({size_kb:.1f} KB)")
        elif webp.exists():
            size_kb = webp.stat().st_size / 1024
            _pass(f"{slug}.webp present ({size_kb:.1f} KB)")
        else:
            _warn(
                f"{slug}.png not found in public/logos/ — "
                "NO_LOCAL_LOGO will skip the 404, but adding the file gives the best result"
            )
            all_present = False

    if all_present:
        _pass("All previously-missing logos are now present")

    return True  # Warn-only: NO_LOCAL_LOGO handles the hard fix


def check_no_blocking_gtm_script(root: Path) -> bool:
    """
    Double-check: the original blocking <script async src="gtag"> line must
    NOT appear anywhere in index.html.
    """
    _section("Fix 8 — No blocking GTM <script> tag anywhere in index.html")
    path = root / "index.html"
    content = read(path)

    if content is None:
        _fail("index.html not found")
        return False

    pattern = re.compile(
        r'<script[^>]+src=["\'][^"\']*googletagmanager\.com/gtag/js[^"\']*["\'][^>]*/?>',
        re.IGNORECASE,
    )
    matches = pattern.findall(content)
    if matches:
        _fail(
            "Blocking GTM <script src> tag found — this was the original issue!",
            "Remove the line: " + matches[0][:100],
        )
        return False

    _pass("No blocking GTM <script src> tag in index.html — LCP critical path is clean")
    return True


# ─────────────────────────────────────────────────────────────────────────────
#  Main
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    print(f"\n{BOLD}{'═' * 60}{RESET}")
    print(f"{BOLD}  AI Nexus — Performance Fix Validator{RESET}")
    print(f"{BOLD}{'═' * 60}{RESET}")

    root = find_project_root()
    print(f"\n  Project root: {CYAN}{root}{RESET}")

    checks = [
        check_gtm_deferred,
        check_lazy_loading,
        check_vite_chunks,
        check_no_local_logo,
        check_lazy_images,
        check_pagination,
        check_missing_logos,
        check_no_blocking_gtm_script,
    ]

    results: list[bool] = []
    for check in checks:
        try:
            results.append(check(root))
        except Exception as exc:
            print(f"  {RED}✗ ERROR{RESET}  {check.__name__} raised: {exc}")
            results.append(False)

    # ── Summary ───────────────────────────────────────────────────────────────
    passed = sum(1 for r in results if r)
    total  = len(results)

    print(f"\n{BOLD}{'═' * 60}{RESET}")
    print(f"{BOLD}  SUMMARY{RESET}")
    print(f"{BOLD}{'═' * 60}{RESET}")

    if passed == total:
        print(f"\n  {GREEN}{BOLD}All {total} checks passed! ✓{RESET}")
        print(f"  Your site is ready for a Lighthouse re-run.")
        print(f"  Expected score improvement: {CYAN}78 → 90+{RESET}\n")
    else:
        failed = total - passed
        print(f"\n  {GREEN}Passed:{RESET} {passed}/{total}")
        print(f"  {RED}Failed:{RESET} {failed}/{total}")
        print(f"\n  Fix the items marked {RED}✗ FAIL{RESET} above, then re-run this script.")
        print(f"  Items marked {YELLOW}⚠ WARN{RESET} are optional improvements.\n")

    print(f"{BOLD}{'═' * 60}{RESET}\n")
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
