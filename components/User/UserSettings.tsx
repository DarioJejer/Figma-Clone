"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/user";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUserChange?: (name: string, color: string) => void;
};

const AVATAR_COLOR_PALETTE = [
  "hsl(0 75% 50%)",     // red
  "hsl(30 75% 50%)",    // orange
  "hsl(60 75% 50%)",    // yellow
  "hsl(120 75% 50%)",   // green
  "hsl(180 75% 50%)",   // cyan
  "hsl(240 75% 50%)",   // blue
  "hsl(270 75% 50%)",   // purple
  "hsl(300 75% 50%)",   // magenta
];

export default function UserSettings({ isOpen, onClose, onUserChange }: Props) {
  const user = getCurrentUser();
  const [name, setName] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setColor(user.avatarColor);
    }
  }, []);

  const handleSave = () => {
    onUserChange?.(name, color);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">User Settings</h2>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your display name"
          />
        </div>

        {/* Avatar Color Picker */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Avatar Color
          </label>
          <div className="grid grid-cols-4 gap-3">
            {AVATAR_COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-12 h-12 rounded-full transition-transform ${
                  color === c ? "ring-2 ring-offset-2 ring-gray-800 scale-110" : ""
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Button Group */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
