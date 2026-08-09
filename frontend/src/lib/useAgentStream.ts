"use client";

import { useCallback, useRef, useState } from "react";
import { streamFromBackend } from "@/lib/stream";

export function useAgentStream() {
  const [streaming, setStreaming] = useState(false);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(
    (url: string, body: BodyInit, headers: Record<string, string>) => {
      abortRef.current = new AbortController();
      setStreaming(true);
      setText("");
      setDone(false);
      setError(null);
      return streamFromBackend(
        url,
        body,
        headers,
        {
          onToken: (t) => setText((prev) => prev + t),
          onDone: () => setDone(true),
          onError: (m) => setError(m),
        },
        abortRef.current.signal
      ).finally(() => setStreaming(false));
    },
    []
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { text, setText, streaming, done, error, start, stop };
}
