// MARK: INJECT
// JSON → DOM. The JSON key is the element tag. The JSON shape is the
// destination. This file names no element and knows no route.
//   string        → text of every matching element
//   array         → one entry per matching element, in order
//   object        → recurse, scoped to that element
//   allow-listed key → attribute on the current element
// Surplus elements are emptied, never removed: CSS :empty hides them.
// The <template> is the allow-list for what may be created.

import { toTagName } from "./to-tag-name.js";

// The ONLY attributes data may write. Every other key is a tag name.
const ATTRIBUTES = ["src", "alt"];

// Set visible text without disturbing nested elements — state-machine
// inputs live inside labels and must survive every injection.
function setText(el, text = "") {
  for (const node of [...el.childNodes]) {
    node.nodeType === Node.TEXT_NODE ? el.removeChild(node) : null;
  }
  text ? el.prepend(document.createTextNode(text)) : null;
}

// Clone extra elements from the <template> pool when data outruns the DOM.
function slots(scope, tag, needed) {
  const found = [...scope.querySelectorAll(tag)];
  const proto = document.querySelector("template")?.content?.querySelector(tag);
  const parent = found.at(-1)?.parentNode ?? scope;

  while (proto && found.length < needed) {
    found.push(parent.appendChild(proto.cloneNode(true)));
  }

  return found;
}

export function inject(data, scope = document) {
  if (!data || typeof data !== "object" || !scope) return;

  for (const [key, value] of Object.entries(data)) {
    if (ATTRIBUTES.includes(key)) {
      scope.setAttribute(key, value ?? "");
      continue;
    }

    const tag = toTagName(key);

    if (Array.isArray(value)) {
      const targets = slots(scope, tag, value.length);

      targets.forEach((el, i) => {
        const entry = value[i];
        entry !== null && typeof entry === "object"
          ? inject(entry, el)
          : setText(el, entry ?? "");
      });

      [...scope.querySelectorAll(tag)]
        .slice(value.length)
        .forEach((el) => setText(el, ""));

      continue;
    }

    if (value !== null && typeof value === "object") {
      const el = scope.querySelector(tag);
      el ? inject(value, el) : null;
      continue;
    }

    scope.querySelectorAll(tag).forEach((el) => setText(el, value ?? ""));
  }
}
