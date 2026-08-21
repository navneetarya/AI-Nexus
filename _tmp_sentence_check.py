import re

content = open('blog/best-ai-receptionist-small-business-2026.ts', encoding='utf-8').read()
m = re.search(r'content: `(.*?)`,\n\n  faqs', content, re.S)
html = m.group(1)


def strip_tags(s):
    return re.sub(r'<[^>]+>', '', s)


text = strip_tags(html)
text = re.sub(r'\s+', ' ', text).strip()
sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
scored = []
for s in sentences:
    words = re.findall(r"\b[\w']+\b", s)
    scored.append((len(words), s))
scored.sort(reverse=True)
for w, s in scored[:20]:
    print(w, '::', s[:200])
