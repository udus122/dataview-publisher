import { Notice, type Command } from "obsidian";
import { Settings } from "./settings";

import type { UnsafeApp } from "./types";
import { Operator } from "./operations";

export function createCommands(app: UnsafeApp, settings: Settings): Command[] {
  return [
    {
      id: "dataview-publisher-update-blocks",
      name: "Update dataview blocks",
      callback: () => {
        const operator = new Operator(app);
        operator.updateFromSource(settings.source);
      },
    },
    {
      id: "dataview-publisher-update-blocks-and-publish",
      name: "Update dataview blocks and publish",
      callback: () => {
        const operator = new Operator(app);
        operator.updateFromSource(settings.source);
        // Open Obsidian Publish
        app.commands.executeCommandById("publish:view-changes");
      },
    },
    {
      id: "dataview-publisher-insert-block",
      name: "Insert dataview publish block",
      editorCallback: (editor) => {
        const { line, ch } = editor.getCursor();
        const lineContent = editor.getLine(line);

        try {
          editor.replaceRange(
            `
%% DATAVIEW_PUBLISHER: start
\`\`\`dataview
\`\`\`
%%
%% DATAVIEW_PUBLISHER: end %%`,
            {
              line,
              ch: lineContent.length,
            }
          );
          editor.setCursor(line, ch);
        } catch (e) {
          new Notice(e.message);
        }
      },
    },
  ];
}
