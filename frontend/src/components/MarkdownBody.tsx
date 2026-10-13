"use client";

import { forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

type Parsed = { meta: [string, string][]; body: string };

// Models often wrap the whole answer in ```markdown fences and start with a
// YAML frontmatter block. Both render badly, so strip them before display.
export function parseOutput(content: string): Parsed {
  let body = content.replace(/^\s*```(?:markdown|md)?[ \t]*\n/i, "");
  if (body !== content) body = body.replace(/\n?```\s*$/, "");

  const meta: [string, string][] = [];
  const fm = body.match(/^\s*---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (fm) {
    for (const line of fm[1].split("\n")) {
      const m = line.match(/^\s*([\w -]+?)\s*:\s*(.+?)\s*$/);
      if (m && m[2]) meta.push([m[1], m[2]]);
    }
    body = body.slice(fm[0].length);
  }
  return { meta, body: body.trim() };
}

type Props = { content: string; className?: string };

const MarkdownBody = forwardRef<HTMLDivElement, Props>(function MarkdownBody(
  { content, className = "" },
  ref
) {
  const { meta, body } = parseOutput(content);
  return (
    <div ref={ref} className={`md-body ${className}`}>
      {meta.length > 0 && (
        <div className="md-meta">
          {meta.map(([k, v]) => (
            <span key={k}>
              <b>{k}:</b> {v}
            </span>
          ))}
        </div>
      )}
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{body}</ReactMarkdown>
    </div>
  );
});

export default MarkdownBody;
