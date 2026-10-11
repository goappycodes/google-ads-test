import type React from "react";

export function blockClipboard(event: React.SyntheticEvent) { event.preventDefault(); }

export function blockExamShortcut(event: React.KeyboardEvent) {
  const key = event.key.toLowerCase();
  if (((event.ctrlKey || event.metaKey) && ["c", "v", "x", "p", "insert"].includes(key)) ||
    (event.shiftKey && ["insert", "delete"].includes(key)) || key === "printscreen") {
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
