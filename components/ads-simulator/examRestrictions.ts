import type React from "react";

export function blockClipboard(event: React.SyntheticEvent) { event.preventDefault(); }

export function isCaptureShortcut(event: { key: string; code?: string; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }): boolean {
  const key = event.key.toLowerCase();
  return key === "printscreen" || !!(event.shiftKey &&
    ((event.metaKey && (["3", "4", "5", "#", "$", "%", "s"].includes(key) || ["Digit3", "Digit4", "Digit5"].includes(event.code || ""))) ||
      (event.ctrlKey && key === "s")));
}

export function blockExamShortcut(event: React.KeyboardEvent) {
  const key = event.key.toLowerCase();
  if (((event.ctrlKey || event.metaKey) && ["c", "v", "x", "p", "s", "u", "insert"].includes(key)) ||
    (event.shiftKey && ["insert", "delete"].includes(key)) || key === "f12" || isCaptureShortcut(event) || ((event.ctrlKey || event.metaKey) && event.shiftKey && ["i", "j"].includes(key))) {
    event.preventDefault();
    event.stopPropagation();
  }
}

export function blockTextDrop(event: React.DragEvent) {
  if (event.dataTransfer.types.some(type => type === "text/plain" || type === "text/html")) event.preventDefault();
}

export const examRestrictions = {
  onCopyCapture: blockClipboard,
  onCutCapture: blockClipboard,
  onPasteCapture: blockClipboard,
  onContextMenu: blockClipboard,
  onDragStartCapture: blockClipboard,
  onDropCapture: blockTextDrop,
  onDragOverCapture: blockTextDrop,
  onKeyDownCapture: blockExamShortcut,
};
