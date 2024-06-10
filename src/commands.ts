import { type Command } from "obsidian";
import { Settings } from "./settings";
// import { serializeDataview } from "./operations";

import type { UnsafeApp } from "./types";
import { Operator } from "./operations";

export function createCommands(app: UnsafeApp, settings: Settings): Command[] {
  return [
    {
      id: "update-dataview-blocks",
      name: "Update dataview blocks",
      callback: () => {
        const operator = new Operator(app);
        operator.updateFromSource(settings.source);
      },
    },
    {
      id: "update-dataview-blocks-and-publish",
      name: "Update dataview blocks and publish",
      callback: () => {
        const operator = new Operator(app);
        operator.updateFromSource(settings.source);
        // Open Obsidian Publish
        app.commands.executeCommandById("publish:view-changes");
      },
    },
  ];
}
