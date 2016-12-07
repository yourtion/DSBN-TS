import { expect } from "chai";
import { DSBN } from "../";

const lexer = DSBN.lexer;
const parser = DSBN.parser;
const transformer = DSBN.transformer;

const RET_SVG_ATTR = {
  width: 100,
  height: 100,
  viewBox: "0 0 100 100",
  xmlns: "http://www.w3.org/2000/svg",
  version: "1.1",
};

const RET_SVG_PAPER = {
  tag: "rect",
  attr: {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: "rgb(0%, 0%, 0%)",
  },
  body: [],
};

const RET_SVG_LINE = {
  tag: "line",
  attr: {
    "x1": 100,
    "y1": 0,
    "x2": 200,
    "y2": -100,
    "stroke": "rgb(50%, 50%, 50%)",
    "stroke-linecap": "round",
  },
  body: [],
};

describe("Transformer", () => {

  it("Paper", () => {
    const str = "Paper 100";
    const lexed = lexer(str);
    const parsed = parser(lexed);
    const transformed = transformer(parsed);
    expect(transformed).to.deep.equal({
      tag: "svg",
      attr: RET_SVG_ATTR,
      body: [RET_SVG_PAPER],
    });
  });

  it("Pen", () => {
    const str = "Pen 50";
    const lexed = lexer(str);
    const parsed = parser(lexed);
    const transformed = transformer(parsed);
    expect(transformed).to.deep.equal({
      tag: "svg",
      attr: RET_SVG_ATTR,
      body: [],
    });
  });

  it("Line", () => {
    const str = "Paper 100 \n Pen 50 \n Line 100 100 200 200";
    const lexed = lexer(str);
    const parsed = parser(lexed);
    const transformed = transformer(parsed);
    expect(transformed).to.deep.equal({
      tag: "svg",
      attr: RET_SVG_ATTR,
      body: [RET_SVG_PAPER, RET_SVG_LINE],
    });
  });

  it("Paper and //", () => {
    const str = "// Pen 1 Haha \n Paper 100";
    const lexed = lexer(str);
    const parsed = parser(lexed);
    const transformed = transformer(parsed);
    expect(transformed).to.deep.equal({
      tag: "svg",
      attr: RET_SVG_ATTR,
      body: [RET_SVG_PAPER],
    });
  });

  it("Paper and Set", () => {
    const str = "Paper 100\n Set A 50 \n Pen A \n Line 100 100 200 200";
    const lexed = lexer(str);
    const parsed = parser(lexed);
    const transformed = transformer(parsed);
    expect(transformed).to.deep.equal({
      tag: "svg",
      attr: RET_SVG_ATTR,
      body: [RET_SVG_PAPER, RET_SVG_LINE],
    });
  });

});
