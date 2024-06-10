import { type App } from "obsidian";

export type UnsafeApp = App & {
  commands: {
    commands: { [commandId: string]: unknown };
    executeCommandById(commandId: string): boolean;
    removeCommand(id: string): void;
  };
};

export type BlockInfo = {
  content: string;
  language: string;
  query: string;
  startBlock: string;
  serialized: string;
  endBlock: string;
};

export type Replacer = {
  searchValue: string;
  replaceValue: string;
};
