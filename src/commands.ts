import { type Command } from "obsidian";
import { Settings } from "./settings";
// import { serializeDataview } from "./operations";

import type { UnsafeApp } from "./types";

export function createCommands(app: UnsafeApp, settings: Settings): Command[] {
  return [
    {
      id: "update-dataview-embed",
      name: "Update dataview embed",
      callback: () => {
        // serializeDataview(settings.source);
      },
    },
    {
      id: "update-dataview-embed-and-publish",
      name: "Update dataview embed and publish",
      callback: () => {
        // serializeDataview(settings.source);

        // Open Obsidian Publish
        app.commands.executeCommandById("publish:view-changes");
      },
    },
  ];
}
