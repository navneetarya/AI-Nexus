from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

for path in (ROOT / "blog").glob("*.ts"):
    text = path.read_text(encoding="utf-8-sig")
    lines = text.splitlines(keepends=True)
    changed = False
    output = []
    for line in lines:
        updated = line
        if "Ocoya" in line or "ocoya" in line:
            updated = updated.replace("$15/month", "$29/month")
            updated = updated.replace("$15/mo", "$29/mo")
            updated = updated.replace("$19/month", "$29/month")
            updated = updated.replace("$19/mo", "$29/mo")
        if "Jasper" in line or "jasper" in line:
            updated = updated.replace("$39/month", "$59/month billed annually ($69 monthly)")
            updated = updated.replace("$39/mo", "$59/mo billed annually ($69 monthly)")
            updated = updated.replace("$49/month", "$59/month billed annually ($69 monthly)")
            updated = updated.replace("$49/mo", "$59/mo billed annually ($69 monthly)")
        changed = changed or updated != line
        output.append(updated)
    if changed:
        path.write_text("".join(output), encoding="utf-8")