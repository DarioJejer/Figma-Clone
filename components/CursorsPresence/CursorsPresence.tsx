"use client";

import React, { useEffect, useRef, useState } from "react";

type RemoteCursor = {
  id: string;
  x: number;
  y: number;
  color?: string;
  name?: string;
};

type Props = {
  ws: WebSocket | null;
};

export default function PresenceCursors({ ws }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tickingRef = useRef(false);

  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({});

  useEffect(() => {

    const container = document.getElementById("canvas-window");
    if (!container) return;
    containerRef.current = container as HTMLDivElement;

    if (!ws) return;

    const onMessage = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data as string);
        if (data.type === "presence" && data.cursor) {
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
    };
    ws.addEventListener("message", onMessage);

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
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "presence", cursor: { x: nx, y: ny } }));
          }
          tickingRef.current = false;
        });
      }
    };
    container.addEventListener("pointermove", onPointerMove);
    
    const onLeave = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "leave"}));
      }
    };
    container.addEventListener("pointerleave", onLeave);


    return () => {
      ws.removeEventListener("message", onMessage);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, [ws]);

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