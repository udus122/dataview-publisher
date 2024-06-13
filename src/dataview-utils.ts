import { UnsafeApp } from "./types";
import { DataviewApi, getAPI } from "obsidian-dataview";

export function getDataviewAPI(app?: UnsafeApp | undefined): DataviewApi {
  const api = getAPI(app);

  if (!api) {
    throw new Error("Dataview API not found");
  }

  return api;
}
