import { expect } from "chai";
import { lexer, parser } from "../";

let LEX: IToken[];

describe("Parser", () => {
  it("Lexer - 1", () => {
    const str = "Paper 100";
    const ret = LEX = lexer(str);
    expect(ret).to.deep.equal([{ type: "word", value: "Paper" }, { type: "number", value: 100 }]);
  });

  it("Parse - 1", () => {
    const ret = parser(LEX);
    expect(ret).to.deep.equal({
      type: "Drawing",
      body: [{
        type: "CallExpression",
        name: "Paper",
        arguments: [{ type: "NumberLiteral", value: 100 }],
      }],
    });
  });
});
