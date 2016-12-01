import { expect } from "chai";
import { generator, lexer, parser, transformer } from "../";

// tslint:disable-next-line
const RET_XML_PAPER = `<svg height="100" width="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" version="1.1"> <rect x="0" y="0" width="100" height="100" fill="rgb(0%, 0%, 0%)"></rect> </svg>`;

// tslint:disable-next-line
const RET_XML_LINE = `<svg height="100" width="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" version="1.1"> <rect x="0" y="0" width="100" height="100" fill="rgb(0%, 0%, 0%)"></rect>\n\t<line x1="100" y1="0" x2="200" y2="-100" stroke="rgb(50%, 50%, 50%)" stroke-linecap="round"></line> </svg>`;


describe("Generator", () => {

  it("Paper", () => {
    const str = "Paper 100";
    const lexed = lexer(str);
    const parsed = parser(lexed);
    const transformed = transformer(parsed);
    const generated = generator(transformed);
    expect(generated).to.equal(RET_XML_PAPER);
  });

  it("Line", () => {
    const str = "Paper 100 \n Pen 50 \n Line 100 100 200 200";
    const lexed = lexer(str);
    const parsed = parser(lexed);
    const transformed = transformer(parsed);
    const generated = generator(transformed);
    expect(generated).to.equal(RET_XML_LINE);
  });

});
