import io
from pathlib import Path


def parse_file(filename: str, content: bytes) -> str:
    ext = Path(filename).suffix.lower()
    if ext in (".txt", ".md", ".markdown"):
        return content.decode("utf-8", errors="replace")
    if ext == ".docx":
        import mammoth

        result = mammoth.extract_raw_text(io.BytesIO(content))
        return result.value.strip()
    if ext == ".pdf":
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(content))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages).strip()
    raise ValueError(
        f"Unsupported file type '{ext or '(none)'}'. Upload a .txt, .md, .docx, or .pdf file."
    )
