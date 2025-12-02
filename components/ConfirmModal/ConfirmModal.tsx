"use client";

import React from "react";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  const title = "Confirm Reset";
  const message = "This will clear the entire canvas for everyone. This action cannot be undone.";
  const confirmLabel = "Confirm";
  const cancelLabel = "Cancel";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 z-[60]" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-80 z-[70]">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">{cancelLabel}</button>
          <button onClick={onConfirm} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
