import re, sys
sys.path.insert(0, '.')
import validate_blog_quality as v

files = v.get_post_files()
rows = []
for f in files:
    raw = f.read_text(encoding='utf-8')
    r = v.audit_file(f)
    cats = r['categories']
    html_m = v.CONTENT_RE.search(raw)
    html = html_m.group(1) if html_m else ''
    img_count = len(re.findall(r'<img\b', html))
    prose_html = v.strip_tables(html)
    text = v.strip_tags(prose_html)
    word_count = len(re.findall(r"\b[\w']+\b", text))
    target_images = max(1, round(word_count / 400))
    rows.append({
        'slug': f.stem,
        'score': r['score'],
        'seo': cats['seo']['score'],
        'read': cats['readability']['score'],
        'eng': cats['engagement']['score'],
        'trust': cats['trust']['score'],
        'aeo': cats['aeo']['score'],
        'conv': cats['conversion']['score'],
        'links': cats['links']['score'],
        'img_count': img_count,
        'target_images': target_images,
        'word_count': word_count,
    })

rows.sort(key=lambda r: r['score'])
below = [r for r in rows if r['score'] < 95]
print(f"Total posts: {len(rows)}  |  Below 95: {len(below)}\n")
total_needed = 0
for r in below:
    need = max(0, r['target_images'] - r['img_count'])
    total_needed += need
    deficits = []
    if r['img_count'] < r['target_images']:
        deficits.append(f"IMG {r['img_count']}/{r['target_images']} need={need}")
    if r['read'] < 20: deficits.append(f"read={r['read']}")
    if r['eng'] < 20: deficits.append(f"eng={r['eng']}")
    if r['seo'] < 15: deficits.append(f"seo={r['seo']}")
    if r['trust'] < 15: deficits.append(f"trust={r['trust']}")
    if r['aeo'] < 15: deficits.append(f"aeo={r['aeo']}")
    if r['conv'] < 10: deficits.append(f"conv={r['conv']}")
    if r['links'] < 5: deficits.append(f"links={r['links']}")
    print(f"{r['score']:3d}  {r['slug']:55s} wc={r['word_count']:5d}  " + ' '.join(deficits))
print(f"\nTOTAL NEW IMAGES NEEDED: {total_needed}")
