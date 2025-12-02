

import { shapeElements } from "@/lib/shapes"
import { useState } from "react";
import Image from "next/image";

type Props = {
  canvasSelectedShape: React.MutableRefObject<string>;
  onReset: () => void;
};

export default function ShapeSelector({ canvasSelectedShape, onReset }: Props) {
  const [selectedShape, setSelectedShape] =  useState<string>("");

  return (
    <div 
      className="fixed left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-xl p-3 flex space-x-4 z-50"
      style={{ top: "calc(64px + (100vh - 64px) * 0.05)" }}  
    >
    {shapeElements.map(shape => (
      <button 
        key={shape.value} 
        className={`
          p-2 rounded-lg 
          ` + (addSelectedStyles(shape))} 
        onClick={() => {
          if (shape.value === "reset") {
            onReset();
            return;
          }
          setSelectedShape(shape.value)
          canvasSelectedShape.current = shape.value;
        }}
      >
        <div className="relative w-6 h-6">
          <Image src={shape.icon} alt={shape.name} fill />
        </div>
      </button>
    ))}
    </div>
  )

  function addSelectedStyles(shape: { icon: string; name: string; value: string; }) {
    return selectedShape === shape.value ? " bg-gray-200" : "hover:bg-gray-100";
  }
}
