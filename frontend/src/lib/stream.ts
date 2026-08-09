export type StreamHandlers = {
  onToken: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
};

export function streamFromBackend(
  url: string,
  body: BodyInit,
  headers: Record<string, string>,
  handlers: StreamHandlers,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve) => {
    fetch(url, {
      method: "POST",
      headers,
      body,
      signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          let msg = `Request failed (${res.status})`;
          try {
            const data = await res.json();
            if (data?.detail) msg = data.detail;
          } catch {
            /* ignore */
          }
          handlers.onError(msg);
          resolve();
          return;
        }
        if (!res.body) {
          handlers.onError("No response body received.");
          resolve();
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const processLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) return;
          const json = trimmed.slice(5).trim();
          if (!json) return;
          try {
            const evt = JSON.parse(json);
            if (evt.type === "token") handlers.onToken(evt.text ?? "");
            else if (evt.type === "done") handlers.onDone();
            else if (evt.type === "error") handlers.onError(evt.message ?? "Unknown error");
          } catch {
            /* ignore malformed events */
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const chunk = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            for (const line of chunk.split("\n")) processLine(line);
          }
        }
        if (buffer.trim()) processLine(buffer);
        resolve();
      })
      .catch((err: unknown) => {
        if (err && typeof err === "object" && "name" in err && err.name === "AbortError") {
          resolve();
          return;
        }
        handlers.onError(
          err && typeof err === "object" && "message" in err && typeof err.message === "string"
            ? err.message
            : "Network error"
        );
        resolve();
      });
  });
}
