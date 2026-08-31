from pathlib import Path
from pypdf import PdfReader

pdf_path = Path(r'd:\AI-Nexus\AI-Nexus\Free GEO Audit Tool_AINexus_Optimize Your Site for AI Search _ ToolsPivot.pdf')
print(f'PDF_PATH={pdf_path}')
print(f'EXISTS={pdf_path.exists()}')
if not pdf_path.exists():
    raise SystemExit(1)
reader = PdfReader(str(pdf_path))
print(f'PAGES={len(reader.pages)}')
for i, page in enumerate(reader.pages, 1):
    text = page.extract_text() or ''
    print(f'--- PAGE {i} START ---')
    print(text[:5000].replace('\x00', ''))
    print(f'--- PAGE {i} END ---')
