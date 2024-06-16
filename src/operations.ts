import { Notice, type Editor, type TFile } from "obsidian";
import { Replacer, UnsafeApp } from "./types";
import { createReplacerFromContent } from "./dataview-publisher";
import { DataviewApi } from "obsidian-dataview";
import { getDataviewAPI } from "./dataview-utils";

export class Operator {
  app: UnsafeApp;
  dv: DataviewApi;

  constructor(app: UnsafeApp) {
    this.app = app;
    try {
      this.dv = getDataviewAPI(app);
    } catch (e) {
      new Notice(e.message);
    }
  }

  private getActiveTFile(): TFile {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      throw new Error("No active file");
    }
    return activeFile;
  }

  async updateActiveFile(editor: Editor) {
    const cursor = editor.getCursor();
    const content = editor.getValue();

    const tfile = this.getActiveTFile();

    const replacer = await createReplacerFromContent(content, this.dv, tfile);
    const updatedContent = this.updateContnet(content, replacer);

    editor.setValue(updatedContent);
    editor.setCursor(cursor);
  }

  updateFromSource(source: string) {
    const targetTfiles = this.retrieveTfilesFromSource(source);

    targetTfiles.forEach(async (tfile) => {
      await this.updateDataviewPublisherOutput(tfile);
    });
  }

  private retrievePathsFromSource(source: string): Array<string> {
    const paths =
      this.dv
        .pagePaths(source)
        .map((path) => this.dv.io.normalize(path))
        .array() ?? [];
    return paths;
  }

  private retrieveTfilesFromSource(source: string): Array<TFile> {
    const paths = this.retrievePathsFromSource(source);
    const tfiles = paths
      .map((path) => this.app.vault.getFileByPath(path))
      .filter((tfile): tfile is TFile => tfile !== null);
    return tfiles;
  }

  private async updateDataviewPublisherOutput(tfile: TFile) {
    const content = await this.app.vault.cachedRead(tfile);

    const replacer = await createReplacerFromContent(content, this.dv, tfile);
    const updatedContent = this.updateContnet(content, replacer);

    this.app.vault.process(tfile, () => updatedContent);
  }

  private updateContnet(content: string, replacer: Replacer[]) {
    return replacer.reduce(
      (
        c: string,
        {
          searchValue,
          replaceValue,
        }: { searchValue: string; replaceValue: string }
      ) => {
        return c.replace(searchValue, replaceValue);
      },
      content
    );
  }
}
