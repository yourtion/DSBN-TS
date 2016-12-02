import { expect } from "chai";
import { DSBN } from "../";

const lexer = DSBN.lexer;

describe("Lexer", () => {

  it("Paper", () => {
    const str = "Paper 100";
    const ret = lexer(str);
    expect(ret).to.deep.equal([{ type: "word", value: "Paper" }, { type: "number", value: 100 }]);
  });

  it("Pen", () => {
    const str = "Pen 100";
    const ret = lexer(str);
    expect(ret).to.deep.equal([{ type: "word", value: "Pen" }, { type: "number", value: 100 }]);
  });

  it("Line", () => {
    const str = "Line 100 100 200 200";
    const ret = lexer(str);
    expect(ret).to.deep.equal([
      { type: "word", value: "Line" },
      { type: "number", value: 100 },
      { type: "number", value: 100 },
      { type: "number", value: 200 },
      { type: "number", value: 200 },
    ]);
  });

  it("Paper and Pen", () => {
    const str = "Paper 95\n Pen 1";
    const ret = lexer(str);
    expect(ret).to.deep.equal([
      { type: "word", value: "Paper" },
      { type: "number", value: 95 },
      { type: "newline" , value: ""},
      { type: "word", value: "Pen" },
      { type: "number", value: 1 },
    ]);
  });


  it("Paper and //", () => {
    const str = "// Pen 1 Haha\nPaper 95";
    const ret = lexer(str);
    expect(ret).to.deep.equal([
      { type: "word", value: "//" },
      { type: "word", value: "Pen" },
      { type: "number", value: 1 },
      { type: "word", value: "Haha" },
      { type: "newline" , value: ""},
      { type: "word", value: "Paper" },
      { type: "number", value: 95 },

    ]);
  });

  it("Paper and Set[]", () => {
    const str = "Paper 95\n Set [ 1 2 ]";
    const ret = lexer(str);
    expect(ret).to.deep.equal([
      { type: "word", value: "Paper" },
      { type: "number", value: 95 },
      { type: "newline", value: "" },
      { type: "word", value: "Set" },
      { type: "ob", value: "[" },
      { type: "number", value: 1 },
      { type: "number", value: 2 },
      { type: "cb" , value: "]"},
    ]);
  });

  it("Paper and {}", () => {
    const str = "Paper 95\n { \n Pen 100 \n }";
    const ret = lexer(str);
    expect(ret).to.deep.equal([
      { type: "word", value: "Paper" },
      { type: "number", value: 95 },
      { type: "newline" , value: ""},
      { type: "ocb", value: "{" },
      { type: "newline", value: "" },
      { type: "word", value: "Pen" },
      { type: "number", value: 100 },
      { type: "newline", value: "" },
      { type: "ccb", value: "}" },
    ]);
  });

});
