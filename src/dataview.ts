import { getAPI } from "obsidian-dataview";

export function getFilePaths(source: string): Array<string> {
  const dv = getAPI();
  const files = dv?.pagePaths(source).array() ?? [];
  return files;
}

export async function executeQueryMarkdown(query: string): Promise<string> {
  const dv = getAPI();
  const result = await dv?.tryQueryMarkdown(query);
  return result ?? "";
}
