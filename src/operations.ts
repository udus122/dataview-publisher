import { executeQueryMarkdown } from "./dataview";

type BlockInfo = {
  content: string;
  language?: string;
  code: string;
  serialized: string;
};

const START_BLOCK_REGEX =
  /^\s*%%\s*DATAVIEW_PUBLISH:\s*start\s*(?:[\s\S])*%%\s*$/;
const END_BLOCK_REGEX = /^\s*%%\s*DATAVIEW_PUBLISH:\s*end\s*%%\s*$/;

export async function updateFile(file: string) {
  const blocks = parseBlocks(file);

  const updatedContent = blocks.reduce(async (contentPromise, block) => {
    const content = await contentPromise;
    const updated = await updateBlock(block);
    return content.replace(block.content, updated.content);
  }, Promise.resolve(file));
  return updatedContent;
}

export async function updateBlock(block: BlockInfo): Promise<BlockInfo> {
  const executionResult = await executeQueryMarkdown(block.code);

  return {
    ...block,
    content: block.content.replace(block.serialized, executionResult),
  };
}

export function parseBlocks(file: string) {
  const blocks = extractBlock(file);
  return blocks.map((block) => parseBlock(block));
}

export function parseBlock(block: string): BlockInfo {
  const startBlock = extractStartBlock(block);
  const { language, code } = parseMarkdownCodeBlock(startBlock);

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

export function parseMarkdownCodeBlock(text: string) {
  const regex = /```(?<language>\S+)?\n(?<code>[\s\S]*?)```/m;

  const match = text.match(regex);

  if (!match) {
    throw new Error("code block is not found");
  }

  const language = match.groups?.language.trim();
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
  return match.groups.serialized;
}

export function extractBlock(content: string): Array<string> {
  const BLOCK_REGEX =
    /\s*%%\s*DATAVIEW_PUBLISH:\s*start\s*\n[\s\S]+?\n\s*%%\s*DATAVIEW_PUBLISH:\s*end\s*%%\s*/gm;

  const blocks = content.match(BLOCK_REGEX) ?? [];
  return blocks.map((block) => block.trim());
}
