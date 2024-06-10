import { executeQueryMarkdown } from "./dataview-utils";
import { BlockInfo, Replacer } from "./types";

const START_BLOCK_REGEX = /\s*%%\s*DATAVIEW_PUBLISH:\s*start\s*[\s\S]*?%%\s*/;
const END_BLOCK_REGEX = /\s*%%\s*DATAVIEW_PUBLISH:\s*end\s*%%\s*/;
const BLOCK_REGEX = new RegExp(
  START_BLOCK_REGEX.source +
    /(?<serialized>[\s\S]*?)/.source +
    END_BLOCK_REGEX.source,
  "gm"
);

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
    content: composeBlockContent({
      ...block,
      serialized: executionResult,
    }),
  };
}

export async function executeBlock(block: BlockInfo): Promise<string> {
  // TODO: block.languageに応じて、DQLとJSのコード両方を実行できるようにする
  if (["dataviewjs", "javascript", "js"].includes(block.language ?? "")) {
    throw new Error("Dataviewjs is not supported yet.");
    // return await executeJavaScriptBlock(block);
  }
  // languageが指定されていない場合は、DQLとして実行する
  const result = await executeQueryMarkdown(block.query);

  return result.trim();
}

export function extractBlock(content: string): Array<string> {
  // NOTE: initialize regex to reset lastIndex
  const regex = new RegExp(BLOCK_REGEX);
  const blocks = content.match(regex) ?? [];
  return blocks.map((block) => block.trim());
}

export function extractBlocks(file: string) {
  const blocks = extractBlock(file);
  return blocks.map((block) => parseBlock(block));
}

export function parseBlock(block: string): BlockInfo {
  const startBlock = extractStartBlock(block);
  const { language, query } = extractMarkdownCodeBlock(startBlock);

  const serialized = extractSerialized(block);

  return {
    content: block,
    startBlock,
    language,
    query,
    serialized,
    endBlock: extractEndBlock(block),
  };
}

export function extractStartBlock(text: string) {
  const regex = new RegExp(START_BLOCK_REGEX.source, "m");

  const match = text.match(regex);

  if (!match) {
    throw new Error("start block is not found");
  }

  return match[0].trim();
}

export function extractEndBlock(text: string) {
  const regex = new RegExp(END_BLOCK_REGEX.source, "m");

  const match = text.match(regex);

  if (!match) {
    throw new Error("end block is not found");
  }
  return match[0].trim();
}

export function extractMarkdownCodeBlock(text: string) {
  const CODEBLOCK_REGEX = /```(?<language>\S+)?\n(?<query>[\s\S]*?)```/m;

  const match = text.match(CODEBLOCK_REGEX);

  if (!match) {
    throw new Error("query block is not found");
  }

  const language = match.groups?.language.trim() ?? "";
  const query = match.groups?.query.trim() ?? "";

  return { language, query };
}

export function extractSerialized(text: string) {
  // NOTE: initialize regex to reset lastIndex
  const regex = new RegExp(BLOCK_REGEX.source);

  // 正規表現でマッチング
  const match = text.match(regex);

  if (!match || !match.groups) {
    throw new Error("replaced text is not found");
  }
  // マッチが見つかった場合は、トリミングして返す
  return match.groups.serialized.trim();
}

export function composeBlockContent(blocks: BlockInfo): string {
  const { startBlock, serialized, endBlock } = blocks;
  return startBlock + "\n" + serialized + "\n" + endBlock;
}
