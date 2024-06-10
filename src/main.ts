import { Plugin } from "obsidian";

import { DEFAULT_SETTINGS, SettingTab, Settings } from "./settings";
import { createCommands } from "./commands";
import { Operator } from "./operations";

import type { UnsafeApp } from "./types";

export default class Main extends Plugin {
  settings: Settings;
  private originalSaveCallback: () => void;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SettingTab(this.app, this));

    createCommands(this.app as UnsafeApp, this.settings).forEach((command) => {
      this.addCommand(command);
    });

    // Source for save setting
    // https://github.com/hipstersmoothie/obsidian-plugin-prettier/blob/main/src/main.ts
    // NOTE: To avoid type errors, we need to cast the command definition to the correct type
    const saveCommandDefinition = this.getSaveCommandDefinition();
    this.originalSaveCallback = saveCommandDefinition.callback;

    if (typeof saveCommandDefinition.callback === "function") {
      saveCommandDefinition.callback = () => {
        this.originalSaveCallback();

        if (this.settings.updateOnSave) {
          const operator = new Operator(this.app as UnsafeApp);
          operator.updateActiveFile();
        }
      };
    }
  }

  onunload() {
    const saveCommandDefinition = this.getSaveCommandDefinition();
    if (
      saveCommandDefinition &&
      saveCommandDefinition.callback &&
      this.originalSaveCallback
    ) {
      saveCommandDefinition.callback = this.originalSaveCallback;
    }
  }

  private getSaveCommandDefinition() {
    const app = this.app as UnsafeApp;
    const saveCommandDefinition = app.commands.commands["editor:save-file"] as {
      callback: () => void | undefined;
    };
    return saveCommandDefinition;
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
