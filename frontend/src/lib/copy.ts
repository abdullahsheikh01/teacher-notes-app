// Copy a rendered element as readable text (not markdown source). Rich HTML
// goes along so pasting into Word / Docs keeps headings, bold and tables.
export async function copyRendered(el: HTMLElement): Promise<void> {
  const plain = el.innerText.replace(/\n{3,}/g, "\n\n").trim();
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([plain], { type: "text/plain" }),
        "text/html": new Blob([el.innerHTML], { type: "text/html" }),
      }),
    ]);
  } else {
    await navigator.clipboard.writeText(plain);
  }
}
