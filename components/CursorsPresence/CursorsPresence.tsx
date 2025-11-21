
import React, { useEffect, useRef, useState } from "react";

type RemoteCursor = {
  id: string;
  x: number;
  y: number;
  color?: string;
  name?: string;
};

export default function PresenceCursors() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const tickingRef = useRef(false);

  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({});

  useEffect(() => {
    const container = document.getElementById("canvas-window");
    if (!container) return;
    containerRef.current = container as HTMLDivElement;

    // connect to WS server
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080");
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ type: "join"}));
    });

    ws.addEventListener("message", (ev) => {
      try {
        const data = JSON.parse(ev.data as string);
        if (data.type === "presence") {
          setRemoteCursors((prev) => ({
            ...prev,
            [data.id]: { id: data.id, x: data.cursor.x, y: data.cursor.y, color: data.color, name: data.name },
          }));
        }
        if (data.type === "user:left") {
          setRemoteCursors((prev) => {
            const copy = { ...prev };
            delete copy[data.id];
            return copy;
          });
        }
      } catch (err) {
        // ignore
      }
    });

    // pointer tracking
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const nx = Math.max(0, Math.min(1, x));
      const ny = Math.max(0, Math.min(1, y));

      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "presence", cursor: { x: nx, y: ny } }));
          }
          tickingRef.current = false;
        });
      }
    };

    const onLeave = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "leave" }));
      }
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onLeave);

    return () => {
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onLeave);
      if (wsRef.current) {
        try {
          wsRef.current.send(JSON.stringify({ type: "leave" }));
        } catch (e) {}
        wsRef.current.close();
      }
    };
  }, []);

  // render remote cursors
  return (
    <div className="pointer-events-none absolute inset-0">
      {Object.values(remoteCursors).map((cursor) => {
        const container = containerRef.current ?? document.getElementById("canvas-window");
        let left = 0;
        let top = 0;
        if (container) {
          const rect = container.getBoundingClientRect();
          left = cursor.x * rect.width;
          top = cursor.y * rect.height;
        }

        return (
          <div
            key={cursor.id}
            style={{
              position: "absolute",
              transform: `translate(calc(${left}px - 8px), calc(${top}px - 8px))`,
              left: 0,
              top: 0,
              zIndex: 50,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 9999,
                  background: cursor.color ?? "#111827",
                  boxShadow: "0 0 0 2px rgba(0,0,0,0.06)",
                }}
              />
              <div
                style={{
                  background: "rgba(255,255,255,0.9)",
                  padding: "2px 6px",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "#111827",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                }}
              >
                {cursor.name ?? cursor.id}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}