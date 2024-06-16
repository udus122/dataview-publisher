import {
  composeBlockContent,
  extractBlock,
  parseBlock,
} from "./dataview-publisher";

const TEST_TEXT = `
Necessitatibus quisquam veritatis eos dolor hic totam sapiente necessitatibus est. Eaque maxime nisi velit fugiat sint. Non natus nam illo. Dolorum earum esse quod vitae autem.

%% DATAVIEW_PUBLISHER: start
\`\`\`dataview
LIST
FROM #🏷️/dataview-publish
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象
%% DATAVIEW_PUBLISHER: end %%

Necessitatibus quisquam veritatis eos dolor hic totam sapiente necessitatibus est. Eaque maxime nisi velit fugiat sint. Non natus nam illo. Dolorum earum esse quod vitae autem.

Necessitatibus quisquam veritatis eos dolor hic totam sapiente necessitatibus est. Eaque maxime nisi velit fugiat sint. Non natus nam illo. Dolorum earum esse quod vitae autem.

%% DATAVIEW_PUBLISHER: start
\`\`\`dataview
LIST
FROM #🏷️/index
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象
%% DATAVIEW_PUBLISHER: end %%

Necessitatibus quisquam veritatis eos dolor hic totam sapiente necessitatibus est. Eaque maxime nisi velit fugiat sint. Non natus nam illo. Dolorum earum esse quod vitae autem.
`;

const TEST_BLOCK = `%% DATAVIEW_PUBLISHER: start
\`\`\`dataview
LIST
FROM #🏷️/dataview-publish 
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象
%% DATAVIEW_PUBLISHER: end %%`;

describe("operations", () => {
  it("parseBlock", () => {
    const parsed = parseBlock(TEST_BLOCK);
    expect(parsed).toEqual({
      content: TEST_BLOCK,
      startBlock: `%% DATAVIEW_PUBLISHER: start
\`\`\`dataview
LIST
FROM #🏷️/dataview-publish 
\`\`\`
%%`,
      query: "LIST\nFROM #🏷️/dataview-publish",
      language: "dataview",
      serialized: `DATAVIEWの結果をシリアライズした結果であり、置換対象`,
      endBlock: "%% DATAVIEW_PUBLISHER: end %%",
    });
  });

  it("extractBlock", () => {
    const blocks = extractBlock(TEST_TEXT);
    expect(blocks.length).toBe(2);
    expect(blocks).toEqual([
      `%% DATAVIEW_PUBLISHER: start
\`\`\`dataview
LIST
FROM #🏷️/dataview-publish
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象
%% DATAVIEW_PUBLISHER: end %%`,
      `%% DATAVIEW_PUBLISHER: start
\`\`\`dataview
LIST
FROM #🏷️/index
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象
%% DATAVIEW_PUBLISHER: end %%`,
    ]);
  });

  it("extractBlocks", () => {
    const blocks = extractBlock(TEST_TEXT);
    const parsed = blocks.map((block) => parseBlock(block));
    expect(parsed).toEqual([
      {
        content: `%% DATAVIEW_PUBLISHER: start
\`\`\`dataview
LIST
FROM #🏷️/dataview-publish
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象
%% DATAVIEW_PUBLISHER: end %%`,
        language: "dataview",
        query: "LIST\nFROM #🏷️/dataview-publish",
        serialized: `DATAVIEWの結果をシリアライズした結果であり、置換対象`,
        startBlock: `%% DATAVIEW_PUBLISHER: start
\`\`\`dataview
LIST
FROM #🏷️/dataview-publish
\`\`\`
%%`,
        endBlock: "%% DATAVIEW_PUBLISHER: end %%",
      },
      {
        content: `%% DATAVIEW_PUBLISHER: start
\`\`\`dataview
LIST
FROM #🏷️/index
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象
%% DATAVIEW_PUBLISHER: end %%`,
        language: "dataview",
        query: "LIST\nFROM #🏷️/index",
        serialized: `DATAVIEWの結果をシリアライズした結果であり、置換対象`,
        startBlock: `%% DATAVIEW_PUBLISHER: start
\`\`\`dataview
LIST
FROM #🏷️/index
\`\`\`
%%`,
        endBlock: "%% DATAVIEW_PUBLISHER: end %%",
      },
    ]);
  });
  it("should return the composed block", () => {
    const blocks = {
      content:
        "%% DATAVIEW_PUBLISHER: start\n```dataview\nLIST\nFROM #🏷️/dataview-publish\n```\n%%\nDATAVIEWの結果をシリアライズした結果であり、置換対象\n%% DATAVIEW_PUBLISHER: end %%",
      startBlock:
        "%% DATAVIEW_PUBLISHER: start\n```dataview\nLIST\nFROM #🏷️/dataview-publish\n```\n%%",
      query: "LIST\nFROM #🏷️/dataview-publish",
      language: "dataview",
      serialized: "DATAVIEWの結果をシリアライズした結果であり、置換対象",
      endBlock: "%% DATAVIEW_PUBLISHER: end %%",
    };

    const composedBlock = composeBlockContent(blocks);

    const expectedBlock = `%% DATAVIEW_PUBLISHER: start
\`\`\`dataview
LIST
FROM #🏷️/dataview-publish
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象

%% DATAVIEW_PUBLISHER: end %%`;

    expect(composedBlock).toEqual(expectedBlock);
  });
});
