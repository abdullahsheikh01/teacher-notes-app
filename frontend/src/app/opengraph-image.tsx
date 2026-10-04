import { ImageResponse } from "next/og";

export const alt = "Teacher Notes Agent: generate, organize, and summarize class notes with AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#fafafa",
          color: "#18181b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ fontSize: 120 }}>✏️</div>
          <div style={{ fontSize: 88, fontWeight: 700 }}>NotesAgent</div>
        </div>
        <div style={{ marginTop: 36, fontSize: 40, color: "#52525b", lineHeight: 1.4 }}>
          Generate, organize, and summarize class notes with AI agents.
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 56 }}>
          {["Generate", "Organize", "Summarize", "Lesson Plan"].map((label) => (
            <div
              key={label}
              style={{
                padding: "12px 28px",
                borderRadius: 999,
                border: "2px solid #e4e4e7",
                background: "#ffffff",
                fontSize: 30,
                color: "#3f3f46",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
