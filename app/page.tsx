"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import ShapeSelector from "@/components/ShapeSelector/ShapeSelector";
import { printShape } from "@/lib/canvas";

export default function Home() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);


  // We're using refs here because we want to access these variables inside the event listeners
  const selectedShape = useRef<string>("");

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
      // If no object was clicked, add a new shape at the pointer location
      else {
        const pointer = canvas.getPointer(options.e);
        printShape(canvas, pointer, selectedShape.current);
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
      <h1 className="text-4xl font-bold h-16 flex justify-center items-center">Figma Clone</h1>
      <ShapeSelector canvasSelectedShape={selectedShape} />
      <div id="canvas-window" className="flex-1 relative bg-gray-100">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
    </main>
  );
}
