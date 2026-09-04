// MARK: FETCH-JSON
// GET one JSON file. Returns parsed data, or null on any failure.
// Transport only. Knows no element, no state machine, no route name.

export async function fetchJson(path = "") {
  if (!path) return null;

  try {
    const response = await fetch(path);
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}
