import { type App } from "obsidian";

export type UnsafeApp = App & {
  commands: {
    commands: { [commandId: string]: unknown };
    executeCommandById(commandId: string): boolean;
    removeCommand(id: string): void;
  };
};
