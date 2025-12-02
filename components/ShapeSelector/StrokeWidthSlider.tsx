import React from "react";

type Props = {
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
};

export default function StrokeWidthSlider({ value, onChange, min = 1, max = 40 }: Props) {
    return (
    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-5 bg-white p-2 rounded shadow-lg">
        <input
        aria-label="stroke-width"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-32 cursor-pointer"
        />    
    </div >
  );
}
