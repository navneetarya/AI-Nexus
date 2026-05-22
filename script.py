tools = [
    ("Grammarly", "AI writing assistant used by 40 million people"),
    ("Writesonic", "SEO-optimised AI writing for blogs and ads"),
    ("Rytr", "Fast, affordable AI writing for everyone"),
    ("QuillBot", "Paraphrase, summarise & improve your writing instantly"),
    ("Ocoya", "AI social media manager for teams and agencies"),
    ("Replit", "Build and deploy full apps with AI in your browser"),
    ("Notion AI", "AI built directly inside your notes and workspace"),
    ("Taskade", "AI-powered tasks, projects and team collaboration"),
    ("Canva AI", "AI design tools built into the world's most popular design platform"),
]
AUTHOR = "Navneet Arya"
template = "{name} review — independently researched. {tagline}. Honest verdict by {author}. No sponsored reviews."
lengths = []
for name, tagline in tools:
    desc = template.format(name=name, tagline=tagline, author=AUTHOR)
    lengths.append(len(desc))
    print(f"{name:15} {len(desc):4}")

print(f"\nAverage: {sum(lengths)/len(lengths):.1f}")
print(f"Min: {min(lengths)}, Max: {max(lengths)}")
