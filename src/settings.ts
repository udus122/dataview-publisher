import { App, PluginSettingTab, Setting } from "obsidian";
import Main from "./main";

export interface Settings {
  source: string;
  serializeOnSave: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  source: "",
  serializeOnSave: false,
};

export class SettingTab extends PluginSettingTab {
  plugin: Main;

  constructor(app: App, plugin: Main) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Source")
      .setDesc(
        "Dataview source to search for target files. ref. https://blacksmithgu.github.io/obsidian-dataview/reference/sources/"
      )
      .addText((text) =>
        text
          .setPlaceholder("#dataview-publish")
          .setValue(this.plugin.settings.source)
          .onChange(async (value) => {
            this.plugin.settings.source = value;
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName("Serialize on save")
      .setDesc(
        "Automatically serialize dataview when saving a file. (Target file is the active file only)"
      )
      .addToggle((tc) => {
        tc.setValue(this.plugin.settings.serializeOnSave).onChange(
          async (value) => {
            this.plugin.settings.serializeOnSave = value;
            await this.plugin.saveSettings();
          }
        );
      });
  }
}
