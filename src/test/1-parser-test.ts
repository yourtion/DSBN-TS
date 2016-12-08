import { expect } from "chai";
import { DSBN } from "../";

const lexer = new DSBN.Lexer().lexer;
const parser = new DSBN.Parser().parser;
a !==  2;

const RET_PAPER = {
  type: "CallExpression",
  name: "Paper",
  arguments: [{ type: "number", value: 100 }],
};

const RET_PEN = {
  type: "CallExpression",
  name: "Pen",
  arguments: [{type: "number", value: 50}],
};

const RET_LINE = {
  type: "CallExpression",
  name: "Line",
  arguments: [
    {type: "number", value: 100},
    {type: "number", value: 100},
    {type: "number", value: 200},
    {type: "number", value: 200},
  ],
};

const RET_SET = {
  type: "VariableDeclaration",
  name: "Set",
  identifier: {type: "word", value: "A"}, value: {type: "number", value: 2},
};

describe("Parser", () => {

  it("Paper", () => {
    const str = "Paper 100";
    const lexed = lexer(str);
    const parsed = parser(lexed);
    expect(parsed).to.deep.equal({
      type: "Drawing",
      body: [RET_PAPER],
    });

  });

  it("Pen", () => {
    const str = "Pen 50";
    const lexed = lexer(str);
    const parsed = parser(lexed);
    expect(parsed).to.deep.equal({
      type: "Drawing",
      body: [RET_PEN],
    });
  });

  it("Line wirhout Paper", () => {
    const str = "Line 100 100 200 200";
    const lexed = lexer(str);
    try {
      const parsed = parser(lexed);
    } catch (err) {
      expect(err).to.be.an("error");
      expect(err.message).to.be.equal("Please make Paper 1st");
    }
  });

  it("Line wirhout Pen", () => {
    const str = "Paper 95\n Line 100 100 200 200";
    const lexed = lexer(str);
    try {
      const parsed = parser(lexed);
    } catch (err) {
      expect(err).to.be.an("error");
      expect(err.message).to.be.equal("Please define Pen 1st");
    }
  });

  it("Line", () => {
    const str = "Paper 100 \n Pen 50 \n Line 100 100 200 200";
    const lexed = lexer(str);
    const parsed = parser(lexed);
    expect(parsed).to.deep.equal({
      type: "Drawing",
      body: [RET_PAPER, RET_PEN, RET_LINE],
    });
  });

  it("Paper and //", () => {
    const str = "// Pen 1 Haha \n Paper 100";
    const lexed = lexer(str);
    const parsed = parser(lexed);
    expect(parsed).to.deep.equal({
      type: "Drawing",
      body: [{type: "CommentExpression", value: "Pen 1 Haha "}, RET_PAPER],
    });
  });

  it("Paper and Set", () => {
    const str = "Paper 100\n Set A 2 ";
    const lexed = lexer(str);
    const parsed = parser(lexed);
    expect(parsed).to.deep.equal({
      type: "Drawing",
      body: [RET_PAPER, RET_SET],
    });
  });

});
