"use client";

import { useEffect, useRef } from "react";
import { fabric } from "fabric";

export default function Home() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {

    const canvasElement = document.getElementById("canvas-window");
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasElement?.clientWidth,
      height: canvasElement?.clientHeight,
    });

    canvas.on("mouse:down", (options) => {
      
      // Check if an object was clicked
      if (options.target) {
        console.log("an object was clicked! ", options.target);
      }
      // Implement logic to add selected shapes on canvas click
      else {
        const pointer = canvas.getPointer(options.e);
        const circle = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 20,
          fill: "blue",
        });
        canvas.add(circle);
      }
    });

    // set canvas reference to fabricRef so we can use it later anywhere outside canvas listener
    fabricRef.current = canvas;
    
    return () => {
      canvas.dispose();
    };
  }, []);

  return (
    <main className="flex flex-col h-screen ">
      <h1 className="text-4xl font-bold h-1/6 flex justify-center items-center">Figma Clone</h1>
      <div id="canvas-window" className="flex-1 relative bg-gray-100">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
    </main>
  );
}
