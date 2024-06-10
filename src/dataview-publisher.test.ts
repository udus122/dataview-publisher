import { extractBlock, parseBlock } from "./dataview-publisher";

// jest.mock("./dataview");

const TEST_TEXT = `
Necessitatibus quisquam veritatis eos dolor hic totam sapiente necessitatibus est. Eaque maxime nisi velit fugiat sint. Non natus nam illo. Dolorum earum esse quod vitae autem.

%% DATAVIEW_PUBLISH: start
\`\`\`dataview
LIST
FROM #🏷️/dataview-publish 
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象
%% DATAVIEW_PUBLISH: end %%

Necessitatibus quisquam veritatis eos dolor hic totam sapiente necessitatibus est. Eaque maxime nisi velit fugiat sint. Non natus nam illo. Dolorum earum esse quod vitae autem.

Necessitatibus quisquam veritatis eos dolor hic totam sapiente necessitatibus est. Eaque maxime nisi velit fugiat sint. Non natus nam illo. Dolorum earum esse quod vitae autem.

%% DATAVIEW_PUBLISH: start
\`\`\`dataview
LIST
FROM #🏷️/index
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象
%% DATAVIEW_PUBLISH: end %%

Necessitatibus quisquam veritatis eos dolor hic totam sapiente necessitatibus est. Eaque maxime nisi velit fugiat sint. Non natus nam illo. Dolorum earum esse quod vitae autem.
`;

const TEST_BLOCK = `%% DATAVIEW_PUBLISH: start
\`\`\`dataview
LIST
FROM #🏷️/dataview-publish 
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象
%% DATAVIEW_PUBLISH: end %%`;

describe("operations", () => {
  it("parseBlock", () => {
    const parsed = parseBlock(TEST_BLOCK);
    expect(parsed).toEqual({
      content: TEST_BLOCK,
      code: "LIST\nFROM #🏷️/dataview-publish",
      language: "dataview",
      serialized: `DATAVIEWの結果をシリアライズした結果であり、置換対象`,
    });
  });

  it("extractBlock", () => {
    const blocks = extractBlock(TEST_TEXT);
    expect(blocks.length).toBe(2);
    expect(blocks).toEqual([
      `%% DATAVIEW_PUBLISH: start
\`\`\`dataview
LIST
FROM #🏷️/dataview-publish 
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象
%% DATAVIEW_PUBLISH: end %%`,
      `%% DATAVIEW_PUBLISH: start
\`\`\`dataview
LIST
FROM #🏷️/index
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象
%% DATAVIEW_PUBLISH: end %%`,
    ]);
  });

  it("extractBlocks", () => {
    const blocks = extractBlock(TEST_TEXT);
    const parsed = blocks.map((block) => parseBlock(block));
    expect(parsed).toEqual([
      {
        content: `%% DATAVIEW_PUBLISH: start
\`\`\`dataview
LIST
FROM #🏷️/dataview-publish 
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象
%% DATAVIEW_PUBLISH: end %%`,
        language: "dataview",
        code: "LIST\nFROM #🏷️/dataview-publish",
        serialized: `DATAVIEWの結果をシリアライズした結果であり、置換対象`,
      },
      {
        content: `%% DATAVIEW_PUBLISH: start
\`\`\`dataview
LIST
FROM #🏷️/index
\`\`\`
%%
DATAVIEWの結果をシリアライズした結果であり、置換対象
%% DATAVIEW_PUBLISH: end %%`,
        language: "dataview",
        code: "LIST\nFROM #🏷️/index",
        serialized: `DATAVIEWの結果をシリアライズした結果であり、置換対象`,
      },
    ]);
  });
});
