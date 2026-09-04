// MARK: TO-TAG-NAME
// JSON key -> element tag name. Pure. No DOM, no imports.
// "itemName" -> "item-name"   "app-banner" -> "app-banner"   "h1" -> "h1"
// Native tags pass through unchanged; only camelCase and underscores convert.

export function toTagName(key = "") {
  const name = String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return /^[a-z]/.test(name) ? name : `x-${name}`;
}
