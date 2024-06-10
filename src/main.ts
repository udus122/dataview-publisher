import { Plugin } from "obsidian";

import { DEFAULT_SETTINGS, SettingTab, Settings } from "./settings";
import { createCommands } from "./commands";
import { Operator } from "./operations";

import type { UnsafeApp } from "./types";

export default class Main extends Plugin {
  settings: Settings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SettingTab(this.app, this));

    createCommands(this.app as UnsafeApp, this.settings).forEach((command) => {
      this.addCommand(command);
    });

    // Source for save setting
    // https://github.com/hipstersmoothie/obsidian-plugin-prettier/blob/main/src/main.ts
    // NOTE: To avoid type errors, we need to cast the command definition to the correct type
    const app = this.app as UnsafeApp;
    const saveCommandDefinition = app.commands.commands["editor:save-file"] as {
      callback: () => void | undefined;
    };

    if (typeof saveCommandDefinition.callback === "function") {
      saveCommandDefinition.callback = () => {
        if (this.settings.updateOnSave) {
          const operator = new Operator(app);
          operator.updateActiveFile();
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
