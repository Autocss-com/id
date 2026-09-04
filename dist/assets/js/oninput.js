// MARK: ONINPUT
// The single lifecycle. Every state machine enters here and nowhere else.
// The control's own label text names its data file. No index, no list,
// no lookup — the association is the name itself.

import { fetchJson } from "./fetch-json.js";
import { inject } from "./inject.js";
import { writeStorage } from "./write-storage.js";

export async function oninput(event) {
  const control = event.target;
  const group = control.name;
  const route = control.closest("label")?.textContent.trim().toLowerCase();

  if (!group || !route) return;

  writeStorage(group, route);

  inject(
    await fetchJson(`assets/data/${route}.json`),
    document.querySelector("main")
  );
}
