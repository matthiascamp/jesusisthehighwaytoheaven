"""
remove_blank_pages.py
---------------------
Removes blank pages from scanned PDFs without touching any page that has content.
A page is considered blank if 99% or more of its pixels are white (or near-white).

Usage:
  python remove_blank_pages.py                  # processes all PDFs in current folder
  python remove_blank_pages.py path/to/file.pdf # processes a single file
  python remove_blank_pages.py path/to/folder   # processes all PDFs in a folder

Output: saves cleaned files as  original_name_cleaned.pdf  in the same folder.
The originals are never modified.
"""

import sys
import os
import fitz  # PyMuPDF

# A page is blank if this fraction of pixels are at or above the white threshold.
BLANK_THRESHOLD = 0.99
# Pixels at or above this brightness (0-255) count as white.
WHITE_LEVEL = 245
# Render DPI — low enough to be fast, high enough to catch faint marks.
DPI = 72


def is_blank(page):
    mat = fitz.Matrix(DPI / 72, DPI / 72)
    pix = page.get_pixmap(matrix=mat, colorspace=fitz.csGRAY)
    samples = pix.samples  # bytes, one byte per pixel in greyscale
    total = len(samples)
    white = sum(1 for b in samples if b >= WHITE_LEVEL)
    return (white / total) >= BLANK_THRESHOLD


def process_pdf(path):
    src = fitz.open(path)
    total = len(src)
    kept = []
    removed = []

    for i in range(total):
        if is_blank(src[i]):
            removed.append(i + 1)
        else:
            kept.append(i)

    if not removed:
        print(f"  {os.path.basename(path)}: no blank pages found ({total} pages).")
        src.close()
        return

    print(f"  {os.path.basename(path)}: {len(removed)} blank page(s) removed "
          f"(pages {removed}) — {len(kept)} pages kept.")

    out = fitz.open()
    out.insert_pdf(src, from_page=kept[0], to_page=kept[0])  # initialise
    out.delete_page(0)
    for idx in kept:
        out.insert_pdf(src, from_page=idx, to_page=idx)

    base, ext = os.path.splitext(path)
    out_path = base + "_cleaned" + ext
    out.save(out_path, garbage=4, deflate=True)
    out.close()
    src.close()
    print(f"  Saved: {os.path.basename(out_path)}")


def collect_pdfs(target):
    if os.path.isfile(target):
        return [target] if target.lower().endswith(".pdf") else []
    return [
        os.path.join(target, f)
        for f in os.listdir(target)
        if f.lower().endswith(".pdf") and "_cleaned" not in f
    ]


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    pdfs = collect_pdfs(target)

    if not pdfs:
        print("No PDF files found.")
        return

    print(f"Processing {len(pdfs)} PDF(s)...\n")
    for path in sorted(pdfs):
        try:
            process_pdf(path)
        except Exception as e:
            print(f"  ERROR on {os.path.basename(path)}: {e}")

    print("\nDone.")


if __name__ == "__main__":
    main()
