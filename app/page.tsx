"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import ShapeSelector from "@/components/ShapeSelector/ShapeSelector";
import { printShape } from "@/lib/canvas";
import PresenceCursors from "@/components/CursorsPresence/CursorsPresence";

export default function Home() {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // We're using refs here because we want to access these variables inside the event listeners
  const selectedShape = useRef<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    // create websocket connection for presence + element sync
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080");
    const onOpen = () => {
      try {
        ws.send(JSON.stringify({ type: "join" }));
      } catch (e) {}
    };
    ws.addEventListener("open", onOpen);
    wsRef.current = ws;
    
    // cleanup on unmount
    const cleanupWs = () => {
      try {
        ws.send(JSON.stringify({ type: "leave" }));
      } catch (e) {}
      try {
        ws.close();
      } catch (e) {}
    };
    
    const canvasElement = document.getElementById("canvas-window");
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasElement?.clientWidth,
      height: canvasElement?.clientHeight,
    });

    canvas.on("mouse:down", (options: any) => {

      // Check if an object was clicked
      if (options.target) {
        console.log("an object was clicked! ", options.target);
      }
      // If no object was clicked, add a new shape at the pointer location
      else {
        const pointer = canvas.getPointer(options.e);
        const created = printShape(canvas, pointer, selectedShape.current);

        // publish created element to WS server
        try {
          if (ws && ws.readyState === WebSocket.OPEN && created) {
            const payload = { type: created.type, objectId: created.objectId, props: created.toObject() };
            ws.send(JSON.stringify({ type: "element:create", payload: payload }));
          }
        } catch (e) {
          // ignore publish failures
        }
      }
    });
    
    return () => {
      canvas.dispose();
      cleanupWs();
    };
  }, []);

  return (
    <main className="flex flex-col h-screen ">
      <h1 className="text-4xl font-bold h-16 flex justify-center items-center">Figma Clone</h1>
      <ShapeSelector canvasSelectedShape={selectedShape} />
      <div id="canvas-window" className="flex-1 relative bg-gray-100">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <PresenceCursors ws={wsRef.current} />
      </div>
    </main>
  );
}
