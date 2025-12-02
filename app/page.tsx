"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import ShapeSelector from "@/components/ShapeSelector/ShapeSelector";
import { printShape } from "@/lib/canvas";
import PresenceCursors from "@/components/CursorsPresence/CursorsPresence";

export default function Home() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // We're using refs here because we want to access these variables inside the event listeners
  const selectedShape = useRef<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);


  const isCreating = { current: false } as { current: boolean };
  const creatingShape: { current: fabric.Object | null } = { current: null };
  const startPoint: { current: { x: number; y: number } | null } = { current: null };

  // perform the actual reset (clear canvas + notify server)
  const performReset = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.renderAll();

    try {
      wsRef.current?.send(JSON.stringify({ type: "element:delete_all" }));
    } catch (e) {
      console.error("Failed to send element:delete_all message", e);
    }
  };

  useEffect(() => {

    // create websocket connection for presence + element sync
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080");
    wsRef.current = ws;
    setWs(ws);


    const onOpen = () => {
      try {
        ws.send(JSON.stringify({ type: "join" }));
      } catch (e) { }
    };
    ws.addEventListener("open", onOpen);


    const onMessage = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data as string);
        switch (data.type) {
          case "elements:init":
            getStorageElementes(data, canvas);
            break;

          case "element:created":
            elementCreatedHandler(data, canvas);
            break;

          case "element:modified":
            elementModifiedHandler(data, canvas);
            break;

          case "element:deleted":
            elementDeletedHandler(data, canvas);
            break;

          case "elements:cleared":
            elementClearedHandler(data, canvas);
            break;

          default:
            break;
        }

      } catch (err) {
        console.error("Failed to process ws message", err);
      }
    };
    ws.addEventListener("message", onMessage);


    const canvasElement = document.getElementById("canvas-window");
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasElement?.clientWidth,
      height: canvasElement?.clientHeight,
    });

    // store fabric canvas instance for external handlers
    fabricCanvasRef.current = canvas;

    canvas.on("mouse:down", (options: any) => {
      const target = options.target;
      const currentTool = selectedShape.current;

      // If an object was clicked
      if (target) {
        // If delete tool is active, remove the clicked object
        if (currentTool === "delete") {
          canvas.remove(target);
          canvas.discardActiveObject();
          canvas.renderAll();
          try {
            wsRef.current?.send(JSON.stringify({ type: "element:delete", payload: { objectId: target.objectId } }));
          } catch (e) {
            console.error("Failed to send element:delete message", e);
          }
        } else {
          // let fabric handle selection when other tools are active
        }
      }
      // If no object was clicked
      else {
        // If delete tool is active, clicking empty area does nothing
        if (currentTool === "delete") return;

        // otherwise create a new shape at the pointer location
        const created = createShape(canvas, options, selectedShape, creatingShape, isCreating, startPoint);
        // publish created element to WS server
        try {
          publishCreatedShape(wsRef, created);
        } catch (e) {
          console.error("Failed to send element:create message", e);
        }
      }
    });

    canvas.on("mouse:move", (options: any) => {
      // You can implement hover effects or other interactions here
      if (!isCreating.current || !creatingShape.current || !startPoint.current) return;

      const { left, top, width, height, sx, pointer, sy } = calculateNewShapeValues(canvas, options, startPoint);

      if (creatingShape.current instanceof fabric.Rect || creatingShape.current instanceof fabric.Triangle) {
        creatingShape.current.set({ left, top, width, height });
      } else if (creatingShape.current instanceof fabric.Circle) {
        setCircle(width, height, sx, pointer, sy, creatingShape);
      }
      creatingShape.current.setCoords();
      syncShapeToStorage(wsRef, creatingShape.current);
      canvas.renderAll();
    });

    canvas.on("mouse:up", (options: any) => {
      if (!isCreating.current) return;
      creatingShape.current.set({ selectable: true });
      creatingShape.current.setCoords();
      syncShapeToStorage(wsRef, creatingShape.current);
      creatingShape.current = null;
      isCreating.current = false;
      startPoint.current = null;
    });

    canvas.on("object:modified", (options: any) => {
      const element = options.target;
      syncShapeToStorage(wsRef, element);
    });

    canvas.on("object:scaling", (options: any) => {
      const element = options.target;
      syncShapeToStorage(wsRef, element);
    });

    canvas.on("object:moving", (options: any) => {
      const element = options.target;
      syncShapeToStorage(wsRef, element);
    });

    // Handle Delete key to remove selected object
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete") {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach((activeObject: any) => {
            canvas.remove(activeObject);
            try {
              wsRef.current?.send(JSON.stringify({
                type: "element:delete",
                payload: { objectId: activeObject.objectId }
              }));
            } catch (e) {
              console.error("Failed to send element:delete message for element", activeObject.objectId, e);
            }
          });
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // cleanup on unmount
    const cleanupWs = () => {
      const socketNow = wsRef.current;
      try {
        socketNow?.send(JSON.stringify({ type: "leave" }));
      } catch (e) { }
      try {
        socketNow?.close();
      } catch (e) { }
      setWs(null);
      wsRef.current = null;
    };

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas.dispose();
      cleanupWs();
    };
  }, []);

  return (
    <main className="flex flex-col h-screen ">
      <h1 className="text-4xl font-bold h-16 flex justify-center items-center">Figma Clone</h1>
      <ShapeSelector canvasSelectedShape={selectedShape} onReset={performReset} />
      <div id="canvas-window" className="flex-1 relative bg-gray-100">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <PresenceCursors ws={ws} />
      </div>
    </main>
  );
}


function setCircle(width: number, height: number, sx: number, pointer: any, sy: number, creatingShape: { current: fabric.Object | null; }) {
  const radius = Math.max(1, Math.max(width, height) / 2);
  // center circle at midpoint
  const cx = (sx + pointer.x) / 2;
  const cy = (sy + pointer.y) / 2;
  creatingShape.current.set({ left: cx - radius, top: cy - radius, radius });
}

function calculateNewShapeValues(canvas: any, options: any, startPoint: { current: { x: number; y: number; } | null; }) {
  const pointer = canvas.getPointer(options.e);

  const sx = startPoint.current.x;
  const sy = startPoint.current.y;

  const left = Math.min(sx, pointer.x);
  const top = Math.min(sy, pointer.y);

  // Calculate dimension while ensuring minimum size
  const width = Math.max(2, Math.abs(pointer.x - sx));
  const height = Math.max(2, Math.abs(pointer.y - sy));
  return { left, top, width, height, sx, pointer, sy };
}

function createShape(canvas: any, options: any, selectedShape: any, creatingShape: { current: fabric.Object | null; }, isCreating: { current: boolean; }, startPoint: { current: { x: number; y: number; } | null; }) {
  const pointer = canvas.getPointer(options.e);
  const created = printShape(canvas, pointer, selectedShape.current);
  creatingShape.current = created;
  isCreating.current = true;
  startPoint.current = { x: pointer.x, y: pointer.y };
  return created;
}

function syncShapeToStorage(wsRef: React.MutableRefObject<WebSocket | null>, element: fabric.Object) {
  const elementId = element.objectId;
  const payload = { type: element.type, objectId: elementId, props: element.toObject() };
  const socketNow = wsRef.current;
  if (socketNow && socketNow.readyState === WebSocket.OPEN) {
    socketNow.send(JSON.stringify({ type: "element:modify", payload: payload }));
  }
};

function publishCreatedShape(wsRef: React.MutableRefObject<WebSocket | null>, created: any) {
  const socketNow = wsRef.current;
  if (socketNow && socketNow.readyState === WebSocket.OPEN && created) {
    const payload = { type: created.type, objectId: created.objectId, props: created.toObject() };
    socketNow.send(JSON.stringify({ type: "element:create", payload: payload }));
  }
}

function elementModifiedHandler(data: any, canvas: any) {
  const element = data.element;
  const obj = canvas.getObjects().find((o: any) => o.objectId === element.objectId);
  if (obj) {
    obj.set(element.props);
    obj.selectable = true;
    obj.evented = true;
    obj.setCoords();
    canvas.renderAll();
  }
}

function elementCreatedHandler(data: any, canvas: any) {
  const element = data.element;
  fabric.util.enlivenObjects([element.props], function (enlivenedObjects: any) {
    enlivenedObjects.forEach(function (obj: any) {
      obj.objectId = element.objectId; // restore objectId
      canvas.add(obj);
    });
    canvas.renderAll();
  });
  return element;
}

function elementDeletedHandler(data: any, canvas: any) {
  const objectId = data.objectId;
  const obj = canvas.getObjects().find((o: any) => o.objectId === objectId);
  if (obj) {
    canvas.remove(obj);
    canvas.renderAll();
  }
}

function elementClearedHandler(_data: any, canvas: any) {
  canvas.clear();
  canvas.renderAll();
}

function getStorageElementes(data: any, canvas: any) {
  data.elements.forEach((element: any) => {
    fabric.util.enlivenObjects([element.props], function (enlivenedObjects: any) {
      enlivenedObjects.forEach(function (obj: any) {
        obj.objectId = element.objectId; // restore objectId
        canvas.add(obj);
      });
      canvas.renderAll();
    });
  });
}

