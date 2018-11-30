import { expect } from "chai";
import { Generator, Lexer, Parser, Transformer} from "../lib";

const L = new Lexer();
const P = new Parser();
const T = new Transformer();
const G = new Generator();

// tslint:disable-next-line
const RET_XML_SVG_0 = `<svg height="100" width="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" version="1.1">\n\t`;
const RET_XML_SVG_1 = `</svg>`;
const RET_XML_RECT_0 = `<rect x="0" y="0" width="100" height="100" fill="rgb(0%, 0%, 0%)"> </rect>`;
// tslint:disable-next-line
const RET_XML_LINE_0 = `<line x1="100" y1="0" x2="200" y2="-100" stroke="rgb(50%, 50%, 50%)" stroke-linecap="round"> </line>`;
const RET_XML_PAPER = `${RET_XML_SVG_0} ${RET_XML_RECT_0}\n ${RET_XML_SVG_1}`;
const RET_XML_LINE = `${RET_XML_SVG_0} ${RET_XML_RECT_0}\n\t ${RET_XML_LINE_0}\n ${RET_XML_SVG_1}`;

describe("Generator", () => {

  it("Paper", () => {
    const str = "Paper 100";
    const lexed = L.lexer(str);
    const parsed = P.parser(lexed);
    const transformed = T.transformer(parsed);
    const generated = G.generator(transformed);
    expect(generated).to.equal(RET_XML_PAPER);
  });

  it("Line", () => {
    const str = "Paper 100 \n Pen 50 \n Line 100 100 200 200";
    const lexed = L.lexer(str);
    const parsed = P.parser(lexed);
    const transformed = T.transformer(parsed);
    const generated = G.generator(transformed);
    expect(generated).to.equal(RET_XML_LINE);
  });

  it("Line and //", () => {
    const str = "// Pen 1 Haha \n Paper 100 \n Pen 50 \n Line 100 100 200 200";
    const lexed = L.lexer(str);
    const parsed = P.parser(lexed);
    const transformed = T.transformer(parsed);
    const generated = G.generator(transformed);
    expect(generated).to.equal(RET_XML_LINE);
  });

  it("Line and Set", () => {
    const str = "Paper 100 \n Set B 50 \n Pen B \n Line 100 100 200 200";
    const lexed = L.lexer(str);
    const parsed = P.parser(lexed);
    const transformed = T.transformer(parsed);
    const generated = G.generator(transformed);
    expect(generated).to.equal(RET_XML_LINE);
  });

});
