import { Notice, type TFile } from "obsidian";
import { UnsafeApp } from "./types";
import { createReplacerFromContent } from "./dataview-publisher";
import { DataviewApi } from "obsidian-dataview";
import { getDataviewAPI } from "./dataview-utils";

export class Operator {
  app: UnsafeApp;
  dv: DataviewApi;

  constructor(app: UnsafeApp) {
    this.app = app;
    this.dv = getDataviewAPI(app);
  }

  updateActiveFile() {
    const currentFile = this.getActiveFile();
    this.updateDataviewPublisherOutput(currentFile);

    const targetTfiles = this.retrieveTfilesFromSource(`"${currentFile.path}"`);

    targetTfiles.forEach(async (tfile) => {
      await this.updateDataviewPublisherOutput(tfile);
    });
  }

  updateFromSource(source: string) {
    const targetTfiles = this.retrieveTfilesFromSource(source);

    targetTfiles.forEach(async (tfile) => {
      await this.updateDataviewPublisherOutput(tfile);
    });
  }

  private getActiveFile(): TFile {
    const currentFile = this.app.workspace.getActiveFile();

    if (!currentFile) {
      new Notice("No active file");
      throw new Error("getActiveFile() returned null");
    }

    return currentFile;
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
    const replacer = await createReplacerFromContent(content);

    const updatedContent = replacer.reduce(
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

    this.app.vault.process(tfile, () => updatedContent);
  }
}
