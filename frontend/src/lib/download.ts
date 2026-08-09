import type { Paragraph as ParagraphType, Table as TableType } from "docx";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadMarkdown(content: string, filename = "notes.md") {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  triggerDownload(blob, filename);
}

type DocxChild =
  | { kind: "heading"; level: number; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "numbered"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "table"; rows: string[][] }
  | { kind: "blank" };

function stripMarkdownInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/[*_~]/g, "")
    .trim();
}

export function markdownToDocxChildren(content: string): DocxChild[] {
  const lines = content.split("\n");
  const children: DocxChild[] = [];
  let tableBuf: string[][] | null = null;

  const flushTable = () => {
    if (tableBuf && tableBuf.length > 0) {
      children.push({ kind: "table", rows: tableBuf });
    }
    tableBuf = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\r$/, "");

    const isTableSep = /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes("-");

    if (/^\s*\|.*\|\s*$/.test(line) && !isTableSep) {
      const cells = line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => stripMarkdownInline(c.trim()));
      if (!tableBuf) tableBuf = [];
      tableBuf.push(cells);
      continue;
    } else {
      flushTable();
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      children.push({
        kind: "heading",
        level: heading[1].length,
        text: stripMarkdownInline(heading[2]),
      });
      continue;
    }

    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    if (bullet) {
      children.push({ kind: "bullet", text: stripMarkdownInline(bullet[1]) });
      continue;
    }

    const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (numbered) {
      children.push({
        kind: "numbered",
        text: stripMarkdownInline(numbered[2]),
      });
      continue;
    }

    if (/^\s*$/.test(line)) {
      children.push({ kind: "blank" });
      continue;
    }

    children.push({ kind: "paragraph", text: stripMarkdownInline(line) });
  }
  flushTable();
  return children;
}

export async function downloadDocx(content: string, filename = "notes.docx") {
  const {
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
  } = await import("docx");
  const children = markdownToDocxChildren(content);

  const render = (child: DocxChild): ParagraphType | TableType => {
    switch (child.kind) {
      case "heading":
        return new Paragraph({
          heading: HeadingLevel[`HEADING_${Math.min(child.level, 6)}` as keyof typeof HeadingLevel],
          children: [new TextRun({ text: child.text, bold: true })],
        });
      case "bullet":
        return new Paragraph({ bullet: { level: 0 }, children: [new TextRun(child.text)] });
      case "numbered":
        return new Paragraph({ numbering: { reference: "num", level: 0 }, children: [new TextRun(child.text)] });
      case "table":
        return new Table({
          rows: child.rows.map(
            (cells) =>
              new TableRow({
                children: cells.map(
                  (c) =>
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: c, bold: child.rows[0] === cells })],
                        }),
                      ],
                      width: { size: Math.floor(100 / Math.max(cells.length, 1)), type: WidthType.PERCENTAGE },
                    })
                ),
              })
          ),
        });
      case "blank":
        return new Paragraph("");
      default:
        return new Paragraph({ children: [new TextRun(child.text)] });
    }
  };

  const doc = new Document({
    numbering: { config: [{ reference: "num", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: "start" }] }] },
    sections: [{ children: children.map(render) }],
  });
  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, filename);
}

export function titleFromMarkdown(content: string, fallback = "Untitled Notes"): string {
  const match = content.match(/^#\s+(.+)$/m);
  const line = match?.[1]?.trim();
  return line || fallback;
}
