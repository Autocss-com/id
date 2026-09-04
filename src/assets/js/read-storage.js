// MARK: READ-STORAGE
// Read one state machine's last selection. Returns "" when absent.
// Key is the state machine's group name ("nav", "color-scheme", ...).

export function readStorage(key = "") {
  if (!key) return "";

  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}
