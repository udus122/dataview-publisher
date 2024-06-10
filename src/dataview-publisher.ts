import { executeQueryMarkdown } from "./dataview-utils";
import { BlockInfo, Replacer } from "./types";

const START_BLOCK_REGEX =
  /^\s*%%\s*DATAVIEW_PUBLISH:\s*start\s*(?:[\s\S])*%%\s*$/;
const END_BLOCK_REGEX = /^\s*%%\s*DATAVIEW_PUBLISH:\s*end\s*%%\s*$/;

export async function createReplacerFromContent(
  content: string
): Promise<Array<Replacer>> {
  const blocks = extractBlocks(content);
  const updatedBlocks = await updateBlocks(blocks);
  const replacer = createReplacer(blocks, updatedBlocks);
  return replacer;
}

export function createReplacer(
  existing: Array<BlockInfo>,
  updated: Array<BlockInfo>
): Array<Replacer> {
  return existing.map((e, i) => ({
    searchValue: e.content,
    replaceValue: updated[i].content,
  }));
}

export async function updateBlocks(blocks: Array<BlockInfo>) {
  return await Promise.all(
    blocks.map((block) => {
      return updateBlock(block);
    })
  );
}

export async function updateBlock(block: BlockInfo): Promise<BlockInfo> {
  const executionResult = await executeBlock(block);

  return {
    ...block,
    content: block.content.replace(block.serialized, executionResult),
  };
}

export async function executeBlock(block: BlockInfo): Promise<string> {
  // TODO: block.languageに応じて、DQLとJSのコード両方を実行できるようにする
  if (["dataviewjs", "javascript", "js"].includes(block.language ?? "")) {
    throw new Error("Dataviewjs is not supported yet.");
    // return await executeJavaScriptBlock(block);
  }
  // languageが指定されていない場合は、DQLとして実行する
  const result = await executeQueryMarkdown(block.code);
  // 体裁を整えるために前後に改行を追加して返す
  return result;
}

export function extractBlock(content: string): Array<string> {
  const BLOCK_REGEX =
    /\s*%%\s*DATAVIEW_PUBLISH:\s*start\s*[\s\S]+?\n\s*%%\s*DATAVIEW_PUBLISH:\s*end\s*%%\s*/gm;

  const blocks = content.match(BLOCK_REGEX) ?? [];
  return blocks.map((block) => block.trim());
}

export function extractBlocks(file: string) {
  const blocks = extractBlock(file);
  return blocks.map((block) => parseBlock(block));
}

export function parseBlock(block: string): BlockInfo {
  const startBlock = extractStartBlock(block);
  const { language, code } = extractMarkdownCodeBlock(startBlock);

  const serialized = extractSerialized(block);

  return {
    content: block,
    language,
    code,
    serialized,
  };
}

export function extractStartBlock(text: string) {
  const regex = new RegExp(START_BLOCK_REGEX.source, "m");

  const match = text.match(regex);

  if (!match) {
    throw new Error("start block is not found");
  }

  return match[0];
}

export function extractEndBlock(text: string) {
  const regex = new RegExp(END_BLOCK_REGEX.source, "m");

  const match = text.match(regex);

  if (!match) {
    throw new Error("end block is not found");
  }
  return match[0];
}

export function extractMarkdownCodeBlock(text: string) {
  const regex = /```(?<language>\S+)?\n(?<code>[\s\S]*?)```/m;

  const match = text.match(regex);

  if (!match) {
    throw new Error("code block is not found");
  }

  const language = match.groups?.language.trim() ?? "";
  const code = match.groups?.code.trim() ?? "";

  return { language, code };
}

export function extractSerialized(text: string) {
  const regex = new RegExp(
    // "%% DATAVIEW_PUBLISH: start"に続く、2番目の"%%"の後ろからキャプチャを開始する
    /^\s*%%\s*DATAVIEW_PUBLISH:\s*start\s*(?:[\s\S])*%%\s*$/.source +
      // 任意の複数行文字列をキャプチャ
      /(?<serialized>[\s\S]*?)/.source +
      // "%% DATAVIEW_PUBLISH: end"が出現したらキャプチャを終了
      /%%\s*DATAVIEW_PUBLISH:\s*end\s*%%/.source,
    "m"
  );

  // 正規表現でマッチング
  const match = text.match(regex);

  if (!match || !match.groups) {
    throw new Error("replaced text is not found");
  }
  // マッチが見つかった場合は、トリミングして返す
  return match.groups.serialized.trim();
}
