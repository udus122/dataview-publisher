import { Notice, Plugin } from "obsidian";

import { DEFAULT_SETTINGS, SettingTab, Settings } from "./settings";
import { updateFile } from "./operations";
import { createCommands } from "./commands";

import type { UnsafeApp } from "./types";
import { getFilePaths } from "./dataview";

export default class Main extends Plugin {
  settings: Settings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SettingTab(this.app, this));

    createCommands(this.app as UnsafeApp, this.settings).forEach((command) => {
      this.addCommand(command);
    });

    this.addRibbonIcon("send", "Serialize dataview", (evt: MouseEvent) => {});

    // Source for save setting
    // https://github.com/hipstersmoothie/obsidian-plugin-prettier/blob/main/src/main.ts
    // NOTE: To avoid type errors, we need to cast the command definition to the correct type
    const app = this.app as UnsafeApp;
    const saveCommandDefinition = app.commands.commands["editor:save-file"] as {
      callback: () => void | undefined;
    };

    if (typeof saveCommandDefinition.callback === "function") {
      saveCommandDefinition.callback = () => {
        if (this.settings.serializeOnSave) {
          const currentFile = app.workspace.getActiveFile();

          if (!currentFile) {
            new Notice("No active file");
            throw new Error("getActiveFile() returned null");
          }

          const targetPaths = getFilePaths(`"${currentFile.path}"`);

          targetPaths.forEach(async (path) => {
            const tf = this.app.vault.getFileByPath(path);

            if (!tf) {
              new Notice("File not found");
              throw new Error("getFileByPath() returned null");
            }

            const content = await this.app.vault.read(tf);
            const updated = await updateFile(content);

            this.app.vault.modify(tf, updated);
          });
        }
      };
    }
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
