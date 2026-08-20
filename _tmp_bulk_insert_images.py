import re, sys
sys.path.insert(0, '.')
import validate_blog_quality as v

BLOG_DIR = v.BLOG_DIR

# slug -> (photo_id, alt_text)
ASSIGNMENTS = {
    "ai-contract-analysis-tools-2026": ("1574717024653-61fd2cf4d44d", "A video editing timeline with blue and purple clips on a dark screen, representing document analysis workflows"),
    "ai-tools-cost-roi-calculator-2026": ("1528109966604-5a6a4a964e8d", "A person working on a MacBook Pro at a desk, tracking AI tool costs"),
    "ai-tools-for-students-free-2026": ("1574717025058-2f8737d2e2b7", "A black laptop computer open on a desk, used for free AI study tools"),
    "ai-tools-for-teachers-2026": ("1614963326505-843868e1d83a", "A teacher's computer screen showing lesson-planning software"),
    "best-ai-ad-creative-generator-tools-2026": ("1551302175-952301267d19", "A digital video editing timeline with colored clips, representing ad creative production"),
    "best-ai-agents-customer-service-2026": ("1609619385002-f40f1df9b7eb", "A customer service dashboard shown on a workstation"),
    "best-ai-coding-agents-2026": ("1502209877429-d7c6df9eb3f9", "A developer's iMac with Apple Magic Keyboard and mouse"),
    "best-ai-coding-tools-2026": ("1579109652910-99b9be06aaec", "A silver iMac turned on at a developer's workstation"),
    "best-ai-headshot-tools-linkedin-2026": ("1574717024239-25253f4ef40a", "A flat screen monitor displaying a photo editing timeline"),
    "best-ai-marketing-tools-2026": ("1618329027137-a520b57c6606", "A black flat screen computer monitor on a marketer's desk"),
    "best-ai-meeting-tools-2026": ("1568992687947-868a62a9f521", "A collaborative team meeting around a table with laptops"),
    "best-ai-photo-upscaler-tools-2026": ("1492619375914-88005aa9e8fb", "A turned-on iMac with Apple Magic Keyboard and mouse on a table"),
    "best-ai-receptionist-small-business-2026": ("1606836591695-4d58a73eba1e", "Colleagues having a business meeting in an office room"),
    "best-ai-recruitment-tools-2026": ("1568992688065-536aad8a12f6", "People talking while sitting beside a table during a hiring discussion"),
    "best-ai-tools-for-automation-engineers-2026": ("1596725858508-70543890c732", "A black flat screen computer monitor showing a testing workspace"),
    "best-ai-tools-for-social-media-2026": ("1522202176988-66273c2fd55f", "Three colleagues laughing together while planning social content"),
    "best-ai-tools-for-startups-2026": ("1511376979163-f804dff7ad7b", "A founder in an office meeting with a colleague"),
    "best-ai-tools-for-youtube-creators-2026": ("1478737270239-2f02b77fc618", "A silver and black studio condenser microphone used for narration"),
    "best-ai-tools-for-youtubers-2026": ("1531651008558-ed1740375b39", "A condenser microphone beside a pop filter for voiceover recording"),
    "best-ai-video-generators-2026": ("1590602847861-f357a9332bbc", "A black microphone mounted on an arm, part of a video production setup"),
    "best-ai-voice-dictation-tools-2026": ("1660631228116-b3643559f611", "A condenser microphone in a shock mount on an adjustable boom arm"),
    "best-free-ai-tool-plans-2026": ("1619490287893-862fd1808407", "A black and silver microphone against a wall"),
    "best-free-ai-writing-tools-2026": ("1556761175-129418cb2dfe", "Two black headphones resting on a wooden table"),
    "best-grammarly-alternatives": ("1615458318132-1f151a3d18f4", "A black and silver audio mixer board on a desk"),
    "best-invideo-alternatives-2026": ("1668605335684-c97ce92cbd76", "A person wearing headphones discussing a video project on a laptop"),
    "best-nano-banana-pro-alternatives-2026": ("1590602846989-e99596d2a6ee", "A black and silver microphone against a white background"),
    "best-no-code-ai-automation-tools-2026": ("1581547848545-a75a2634ba23", "A person holding a microphone on a stand while presenting a workflow"),
    "best-vibe-coding-tools-2026": ("1659083725992-9d88c12e719c", "A condenser microphone on a boom arm in a developer's studio setup"),
    "chatgpt-alternatives-free-2026": ("1517048676732-d65bc937f952", "People sitting at a table holding pens during a comparison discussion"),
    "chatgpt-atlas-vs-perplexity-comet-vs-dia-2026": ("1573167507387-6b4b98cb7c13", "People at a conference table listening to a colleague present browser options"),
    "claude-code-alternatives-2026": ("1557804506-669a67965ba0", "Three colleagues sitting with laptops watching a presentation on coding tools"),
    "claude-code-vs-github-copilot-vs-replit-2026": ("1522071820081-009f0129c71c", "A group of developers using a laptop together to compare coding tools"),
    "fastest-growing-ai-startups-2026": ("1556761175-b413da4baf72", "Three founders sitting near a table discussing startup growth"),
    "gpt-5-5-vs-claude-opus-4-8-vs-grok-4-2026": ("1560472354-b33ff0c44a43", "A monitor displaying a model comparison dashboard"),
    "jasper-ai-alternatives": ("1526628953301-3e589a6a8b74", "A data reporting dashboard shown on a laptop screen"),
    "perplexity-ai-review-2026": ("1686061594225-3e92c0cd51b0", "A computer screen displaying a search analytics dashboard"),
}

used_before = set()
inserted, skipped = [], []

for slug, (photo_id, alt) in ASSIGNMENTS.items():
    path = BLOG_DIR / f"{slug}.ts"
    if not path.exists():
        skipped.append((slug, "file not found"))
        continue
    raw = path.read_text(encoding="utf-8")
    m = v.CONTENT_RE.search(raw)
    if not m:
        skipped.append((slug, "no content field"))
        continue
    html = m.group(1)
    if photo_id in html:
        skipped.append((slug, "photo id already present in this file"))
        continue

    img_tag = (
        f'<img src="https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w=1200&h=675&q=80&crop=entropy" '
        f'alt="{alt}" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin:8px 0 24px;" loading="lazy" />\n'
    )

    # Insert right after the first </h2> tag's following content start (before the next <p>)
    h2_match = re.search(r"</h2>\s*", html)
    if not h2_match:
        skipped.append((slug, "no h2 found"))
        continue
    insert_pos = h2_match.end()
    new_html = html[:insert_pos] + img_tag + html[insert_pos:]
    new_raw = raw[:m.start(1)] + new_html + raw[m.end(1):]
    path.write_text(new_raw, encoding="utf-8")
    inserted.append(slug)

print(f"Inserted images into {len(inserted)} files")
for s in inserted:
    print(" +", s)
if skipped:
    print(f"\nSkipped {len(skipped)}:")
    for s, reason in skipped:
        print(" -", s, "|", reason)
