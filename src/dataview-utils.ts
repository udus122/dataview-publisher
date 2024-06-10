import { UnsafeApp } from "./types";
import { DataviewApi, getAPI } from "obsidian-dataview";

export function getDataviewAPI(app?: UnsafeApp | undefined): DataviewApi {
  const api = getAPI(app);

  if (!api) {
    throw new Error("Dataview API not found");
  }

  return api;
}

export async function executeQueryMarkdown(
  query: string,
  app?: UnsafeApp | undefined
): Promise<string> {
  const dv = getDataviewAPI(app);
  return await dv.tryQueryMarkdown(query);
}
