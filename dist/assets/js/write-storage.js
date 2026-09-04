// MARK: WRITE-STORAGE
// Save one state machine's current selection. Silent on failure —
// storage is unavailable in some privacy modes and must never break the UI.

export function writeStorage(key = "", value = "") {
  if (!key) return;

  try {
    localStorage.setItem(key, value);
  } catch {}
}
