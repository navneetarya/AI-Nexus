"""Verify all required fields appear within 4000 chars of their slug: position."""
with open('constants.ts', encoding='utf-8') as f:
    raw = f.read()
content = raw.replace('\r\n', '\n')

cp = content.find("slug: 'cursor', id: 'c2'")
cb = content[cp:cp+4100]
lp = content.find("slug: 'lovable', id: 'c3'")
lb = content[lp:lp+4100]

fields = ['setupSteps:', 'dailyUseCases', 'realOutputExample', 'notForYou', 'researchSources',
          'indiaPricing', 'reviewType', 'lastTestedISO', 'updateLog', 'features', 'pros', 'cons', 'pricingBreakdown']

print("CURSOR offsets from slug: 'cursor':")
for f in fields:
    off = cb.find(f)
    status = 'PASS' if 0 < off < 4000 else 'FAIL'
    print(f"  {status} {f}: {off}")

print("\nLOVABLE offsets from slug: 'lovable':")
for f in fields:
    off = lb.find(f)
    status = 'PASS' if 0 < off < 4000 else 'FAIL'
    print(f"  {status} {f}: {off}")
