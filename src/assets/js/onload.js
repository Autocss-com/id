// MARK: ONLOAD
// The one sanctioned programmatic entry. Fills the shell, then selects a
// state machine so its OWN oninput fires the lifecycle. Never calls the
// lifecycle directly.

import { fetchJson } from "./fetch-json.js";
import { inject } from "./inject.js";
import { readStorage } from "./read-storage.js";

export async function onload() {
  inject(await fetchJson("assets/data/shell.json"), document.body);

  const group = "nav";
  const saved = readStorage(group);

  const controls = [...document.querySelectorAll(`input[name="${group}"]`)];
  const control =
    controls.find(
      (input) =>
        input.closest("label")?.textContent.trim().toLowerCase() === saved
    ) ?? controls[0];

  control ? (control.checked = true) : null;
  control?.dispatchEvent(new Event("input", { bubbles: true }));
}
