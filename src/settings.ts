import { App, PluginSettingTab, Setting } from "obsidian";
import Main from "./main";

export interface Settings {
  source: string;
  updateOnSave: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  source: "",
  updateOnSave: false,
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
      .setDesc("Dataview source to search for target files.")
      .addTextArea((text) =>
        text
          .setPlaceholder("#dataview-publisher")
          .setValue(this.plugin.settings.source)
          .onChange(async (value) => {
            this.plugin.settings.source = value;
            await this.plugin.saveSettings();
          })
      );

    const desc = containerEl.createEl("p", {
      text: "Dataview source ref: ",
    });
    desc.createEl("a", {
      text: "https://blacksmithgu.github.io/obsidian-dataview/reference/sources",
      href: "https://blacksmithgu.github.io/obsidian-dataview/reference/sources",
    });

    new Setting(containerEl)
      .setName("Update on save")
      .setDesc(
        "Automatically update dataview publisher block when saving a file. (Target file is the active file only)"
      )
      .addToggle((tc) => {
        tc.setValue(this.plugin.settings.updateOnSave).onChange(
          async (value) => {
            this.plugin.settings.updateOnSave = value;
            await this.plugin.saveSettings();
          }
        );
      });
  }
}
