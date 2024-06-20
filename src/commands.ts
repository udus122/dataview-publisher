import { Notice, type Command } from "obsidian";
import { Settings } from "./settings";

import type { UnsafeApp } from "./types";
import { Operator } from "./operations";

export function createCommands(app: UnsafeApp, settings: Settings): Command[] {
  return [
    {
      id: "insert-block",
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
    {
      id: "update-blocks",
      name: "Update dataview publish blocks",
      callback: () => {
        try {
          const operator = new Operator(app);
          operator.updateFromSource(settings.source);
        } catch (err) {
          new Notice(err.message);
          throw err;
        }
      },
    },
    {
      id: "update-blocks-and-publish",
      name: "Update dataview publish blocks and open publish panel",
      callback: () => {
        try {
          const operator = new Operator(app);
          operator.updateFromSource(settings.source);
        } catch (err) {
          new Notice(err.message);
          throw err;
        }
        // Open Obsidian Publish
        app.commands.executeCommandById("publish:view-changes");
      },
    },
  ];
}
