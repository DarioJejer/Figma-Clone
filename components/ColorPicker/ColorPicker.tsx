"use client";

import { useState } from "react";

type Props = {
  onColorSelect?: (color: string) => void;
};

export default function ColorPicker({ onColorSelect }: Props) {
  const colors = [
    "#DC2626", // red
    "#D97706", // orange
    "#059669", // green
    "#7C3AED", // purple
    "#DB2777", // pink
    "#0891B2", // cyan
    "#000000", // black (default)
    "#FCD34D", // yellow
  ];
  const nameMap: Record<string, string> = {
            "#DC2626": "Red",
            "#D97706": "Orange",
            "#059669": "Green",
            "#7C3AED": "Purple",
            "#DB2777": "Pink",
            "#0891B2": "Cyan",
            "#000000": "Black",
            "#FCD34D": "Yellow",
          };

  const [selected, setSelected] = useState<string>("#000000");

  function handleSelect(color: string) {
    setSelected(color);
    if (onColorSelect) onColorSelect(color);
  }

  return (
    <div
      className="fixed left-8 top-1/2 -translate-y-1/2 bg-white shadow-xl rounded-xl p-3 z-50"
    >
      <div className="flex flex-col space-y-2">
        {colors.map((color) => {
          const isSelected = selected.toLowerCase() === color.toLowerCase();          
          const label = nameMap[color.toUpperCase()] ?? color;
          return (
            <button
              key={color}
              onClick={() => handleSelect(color)}
              aria-pressed={isSelected}
              aria-label={label}
              className={
                "w-8 h-8 rounded-lg transition-all flex items-center justify-center " +
                (isSelected
                  ? "ring-2 ring-offset-1 ring-black border-2 border-black"
                  : "border-2 border-gray-300 hover:border-gray-400")
              }
              style={{ backgroundColor: color }}
              title={label}
            />
          );
        })}
      </div>
    </div>
  );
}
