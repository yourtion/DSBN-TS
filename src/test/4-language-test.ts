import { expect } from "chai";
import { DSBN, Generator, Lexer, Parser, Transformer, ISVG } from "../lib";

const compile = new DSBN().compile;
const parse = (source: string) => new Parser().parser(new Lexer().lexer(source));
const transform = (source: string) => new Transformer().transformer(parse(source));
const drawing = "Paper 0 Pen 100 ";

describe("Language", () => {
  it("tokenizes adjacent punctuation, decimals, scientific notation, and CRLF", () => {
    const tokens = new Lexer().lexer("Set A(-.5+1e2)\r\nSet [1,2] 50//done");
    expect(tokens.filter((token) => token.type === "newline")).to.have.length(1);
    expect(tokens.filter((token) => token.type === "number").map((token) => token.value)).to.deep.equal([.5, 100, 1, 2, 50]);
    expect(tokens[tokens.length - 1].value).to.equal("done");
  });

  it("evaluates precedence, nested expressions, signs, and variable copies", () => {
    const svg = transform(drawing + "Set A (2 + 3 * 4) Set B A Set A 90 Line B (-(2 + 3)) (20 / 4 / 2) (+7)");
    expect(svg.body[1].attr).to.include({ x1: 14, y1: 105, x2: 2.5, y2: 93 });
  });

  it("allows numbers outside the color range in variables and coordinates", () => {
    expect(transform(drawing + "Set A -200 Line A 0 200 200").body[1].attr.x1).to.equal(-200);
  });

  it("executes nested and standalone blocks in order", () => {
    const svg = transform(drawing + "{Set A 10 {Set A (A + 5)} Line A 0 20 20} Line A 0 30 30");
    expect(svg.body.slice(1).map((node) => node.attr.x1)).to.deep.equal([15, 15]);
  });

  it("executes inclusive ascending, descending, single, and nested loops", () => {
    const svg = transform(drawing + "Repeat x 1 2 {Repeat y 2 1 {Line x y x y}} Repeat n 3 3 {Line n n n n}");
    expect(svg.body.slice(1).map((node) => [node.attr.x1, node.attr.y1])).to.deep.equal([[1, 98], [1, 99], [2, 98], [2, 99], [3, 97]]);
  });

  it("permits a pen declared in an unconditional inclusive loop", () => {
    expect(() => compile("Paper 0 Repeat i 1 1 {Pen 100} Line 0 0 10 10")).not.to.throw();
  });

  it("does not interpret quoted values as command tokens", () => {
    expect(() => compile('Set name "Set" Paper 0')).not.to.throw();
  });

  it("restores a shadowed loop counter and freezes bounds at loop entry", () => {
    const svg = transform(drawing + "Set n 42 Set end 2 Repeat n 1 end {Set end 9 Repeat n 5 5 {} Line n 0 n 0} Line n 0 n 0");
    expect(svg.body.slice(1).map((node) => node.attr.x1)).to.deep.equal([1, 2, 42]);
    expect(() => compile(drawing + "Repeat n 1 1 {} Line n 0 0 0")).to.throw("Undefined variable n");
  });

  for (const [name, a, b, matches] of [
    ["Same?", 1, 1, true], ["Same?", 1, 2, false],
    ["NotSame?", 1, 2, true], ["NotSame?", 1, 1, false],
    ["Smaller?", 1, 2, true], ["Smaller?", 2, 2, false],
    ["NotSmaller?", 2, 2, true], ["NotSmaller?", 1, 2, false],
  ] as const) {
    it(`${name} ${a} ${b} executes: ${matches}`, () => {
      const svg = transform(drawing + `${name} ${a} ${b} {Line 0 0 10 10}`);
      expect(svg.body).to.have.length(matches ? 2 : 1);
    });
  }

  it("accepts spaced question marks and skips unevaluated branches", () => {
    expect(() => compile(drawing + "Same ? 1 2 {Line unknown 0 0 0}")).not.to.throw();
  });

  it("reads and writes grayscale dots, with latest drawing taking precedence", () => {
    const svg = transform(drawing + "Set [10, 20] 35 Set shade [10 20] Pen shade Line 0 0 30 0 Set [11 20] [0 0]");
    expect(svg.body[1].attr).to.include({ x: 9.5, y: 79.5, fill: "rgb(65%, 65%, 65%)" });
    expect(svg.body[2].attr.stroke).to.equal("rgb(65%, 65%, 65%)");
    expect(svg.body[3].attr.fill).to.equal("rgb(65%, 65%, 65%)");
    expect(transform(drawing + "Set A [1 2] Pen A Line 0 0 1 1").body[1].attr.stroke).to.equal("rgb(100%, 100%, 100%)");
    expect(transform(drawing + "Line 10 10 10 10 Set [20 20] [10 10]").body[2].attr.fill).to.equal("rgb(0%, 0%, 0%)");
  });

  it("sets dots without requiring a Pen and keeps boundary dots visible", () => {
    const svg = transform("Paper 0 Set [0 0] 100 Set [100 100] 100");
    expect(svg.body[1].attr).to.include({ x: -0.5, y: 99.5 });
    expect(svg.body[2].attr).to.include({ x: 99.5, y: -0.5 });
    expect(() => compile("Set [0 0] 100")).to.throw("Paper 1st");
  });

  it("supports all vector extensions with DBN coordinates and colors", () => {
    const svg = transform('Paper "white" Pen "#123abc" Rect 10 20 30 40 Circle 50 60 7 Ellipse 50 60 8 9 Polyline [0,0] [10,20] Polygon [0 0] [20 0] [10 20] Path "M 0 0 L 10 20 Z"');
    expect(svg.body.map((node) => node.tag)).to.deep.equal(["rect", "rect", "circle", "ellipse", "polyline", "polygon", "path"]);
    expect(svg.body[1].attr).to.deep.equal({ x: 10, y: 40, width: 30, height: 40, fill: "#123abc" });
    expect(svg.body[2].attr).to.deep.equal({ cx: 50, cy: 40, r: 7, fill: "#123abc" });
    expect(svg.body[3].attr).to.deep.equal({ cx: 50, cy: 40, rx: 8, ry: 9, fill: "#123abc" });
    expect(svg.body[4].attr).to.include({ points: "0,100 10,80", fill: "none", stroke: "#123abc" });
    expect(svg.body[5].attr).to.include({ points: "0,100 20,100 10,80", fill: "#123abc" });
    expect(svg.body[6].attr.transform).to.equal("translate(0 100) scale(1 -1)");
  });

  it("samples lines and paper in drawing order, independently of SVG extensions", () => {
    const svg = transform(drawing + "Line 10 10 90 10 Rect 0 0 100 100 Set [5 5] [5 10] Set [6 6] [50 10]");
    expect(svg.body[3].attr.fill).to.equal("rgb(100%, 100%, 100%)");
    expect(svg.body[4].attr.fill).to.equal("rgb(0%, 0%, 0%)");
    expect(() => compile(drawing + "Line 0 0 10 10 Set A [50 50]", { maxSteps: 5 })).to.throw("Execution limit");
  });

  it("rejects prototype property names as commands without leaking internal values", () => {
    expect(() => compile("constructor")).to.throw("valid command");
    expect(() => compile("toString")).to.throw("valid command");
    expect(() => compile(drawing + "Pen __proto__")).to.throw("Undefined variable");
  });

  it("supports quoted functional colors and color variables", () => {
    expect(compile('Set color "rgb(255, 0, 0)" Paper color Pen "hsl(120, 50%, 50%)" Circle 50 50 10')).to.contain('fill="rgb(255, 0, 0)"');
  });

  it("leaves input tokens and AST unchanged and permits reuse", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const transformer = new Transformer();
    const tokens = lexer.lexer(drawing + "Repeat n 1 2 {Line n 0 n 1}");
    const tokenCopy = JSON.stringify(tokens);
    const ast = parser.parser(tokens);
    const astCopy = JSON.stringify(ast);
    const first = transformer.transformer(ast);
    expect(transformer.transformer(ast)).to.deep.equal(first);
    expect(parser.parser(tokens)).to.deep.equal(ast);
    expect(JSON.stringify(tokens)).to.equal(tokenCopy);
    expect(JSON.stringify(ast)).to.equal(astCopy);
  });

  it("resets variables, paper, pen, samples, and budget between compilations including failures", () => {
    const compiler = new DSBN();
    compiler.compile(drawing + "Set A 70 Set [10 10] 20");
    expect(() => compiler.compile(drawing + "Pen A")).to.throw("Undefined variable A");
    expect(() => compiler.compile("Line 0 0 1 1")).to.throw("Paper");
    expect(() => compiler.compile("Paper 0 Line 0 0 1 1")).to.throw("Pen");
    expect(() => compiler.compile(drawing + "Repeat i 0 100 {}", { maxSteps: 3 })).to.throw("Execution limit");
    expect(compiler.compile("Paper 0")).to.equal(compile("Paper 0"));
  });

  it("limits loops even with empty bodies and rejects invalid limits", () => {
    expect(() => compile("Repeat i 0 1000000000000 {}", { maxSteps: 20 })).to.throw("Execution limit");
    for (const maxSteps of [0, -1, 1.5, NaN, Infinity]) {
      expect(() => compile("Paper 0", { maxSteps })).to.throw("maxSteps");
    }
  });
});

describe("Errors", () => {
  const invalid: Array<[string, string]> = [
    ["", "No Tokens"], ["Paper @", "Unexpected character"], ["Paper 1e999", "Non-finite"],
    ['Paper "white', "Unterminated string"], ['Paper "\\q"', "Invalid string escape"],
    ["Paper 0 Paper 10", "more than once"], [drawing + "Unknown 1", "valid command"],
    [drawing + "Line 0 0 10", "argument"], ["Paper\nPen 100", "argument"],
    [drawing + "Line 0 0 10 10 20", "Expected word"],
    [drawing + "}", "closing brace"], [drawing + "{", "Unclosed block"],
    [drawing + "Repeat n 1 2 Line 0 0 1 1", "Expected ocb"],
    [drawing + "{ Paper 0 }", "top level"], [drawing + "Pen missing", "Undefined variable"],
    [drawing + "Set Paper 1", "Invalid variable"], [drawing + "Set A", "argument"],
    [drawing + "Set A (2 +)", "Expected an expression"], [drawing + "Set A (2 + 3", "Unexpected end"],
    [drawing + "Set A (1 / 0)", "Division by zero"], [drawing + "Set A (1e308 * 10)", "finite"],
    [drawing + 'Line "x" 0 1 1', "Expected a number"], [drawing + "Pen 101", "0 - 100"],
    ["Paper -1", "0 - 100"], ['Paper "url(https://example.com)"', "Invalid color"],
    [drawing + "Repeat n 0.5 2 {}", "safe integers"], [drawing + "Repeat n 0 1e20 {}", "safe integers"],
    [drawing + "Set [101 0] 50", "Point coordinates"], [drawing + "Set A [0.5 0]", "Point coordinates"],
    [drawing + "Set [1 2 3] 50", "Expected cb"], ["Set A [1 2]", "Paper first"],
    ['Paper "red" Set A [1 2]', "grayscale"], [drawing + "Circle 0 0 -1", "non-negative"],
    [drawing + "Rect 0 0 1 -1", "non-negative"], [drawing + "Ellipse 0 0 -1 1", "non-negative"],
    [drawing + "Polyline [0 0]", "at least 2"], [drawing + "Polygon [0 0] [1 1]", "at least 3"],
    [drawing + 'Path "<script>"', "Path expects"], [drawing + "Path 10", "Path expects"],
    ["Paper 0 Same? 1 2 {Pen 100} Line 0 0 1 1", "Pen 1st"],
  ];
  for (const [source, message] of invalid) {
    it(`rejects ${JSON.stringify(source)}`, () => expect(() => compile(source)).to.throw(message));
  }

  for (const path of ["M", "M 1", "M 0 0 L", "M 0 0 R 1 2", "M 0 0 Z 1", "M 0 0 A -1 2 0 0 0 10 10", "M 0 0 A 1 2 0 3 0 10 10", "M 0 0 L 1e999 2", "M 0 0 ! L 1 2", "M 0 0 L 1 2,"]) {
    it(`rejects malformed path ${path}`, () => expect(() => compile(drawing + `Path "${path}"`)).to.throw("Path expects"));
  }

  it("accepts repeated path groups, relative commands, curves, and arcs", () => {
    expect(() => compile(drawing + 'Path "m 0 0 1 2 h 2 v 3 c 1 2 3 4 5 6 s 1 2 3 4 q 1 2 3 4 t 1 2 a 1 2 0 0 1 10 20 z"')).not.to.throw();
  });

  it("bounds block, parenthesis, and point nesting", () => {
    expect(() => compile("{".repeat(101) + "}".repeat(101))).to.throw("nesting limit");
    expect(() => compile("Set A " + "(".repeat(101) + "1" + ")".repeat(101))).to.throw("nesting limit");
    expect(() => compile("Set A " + "[".repeat(101) + "0" + " 0]".repeat(101))).to.throw("nesting limit");
  });
});

describe("SVG serialization", () => {
  it("renders empty trees, siblings, and nested nodes without losing following siblings", () => {
    const leaf: ISVG = { tag: "g", attr: {}, body: [] };
    const node: ISVG = { tag: "svg", attr: {}, body: [{ ...leaf, body: [leaf] }, leaf] };
    const generator = new Generator();
    expect(generator.generator([])).to.equal("");
    const svg = generator.generator(node);
    expect(svg.match(/<g>/g)).to.have.length(3);
    expect(svg.match(/<\/g>/g)).to.have.length(3);
    expect(generator.generator([leaf, leaf]).match(/<g>/g)).to.have.length(2);
    expect(generator.generator(node)).to.equal(svg);
  });

  it("escapes attribute values and rejects invalid XML names or numbers", () => {
    const generator = new Generator();
    expect(generator.generator({ tag: "svg", attr: { title: '<&"\'>' }, body: [] })).to.contain("&lt;&amp;&quot;&apos;&gt;");
    expect(() => generator.generator({ tag: "svg>", attr: {}, body: [] })).to.throw("tag name");
    expect(() => generator.generator({ tag: "svg", attr: { 'x="': "bad" }, body: [] })).to.throw("attribute name");
    expect(() => generator.generator({ tag: "svg", attr: { x: NaN }, body: [] })).to.throw("finite");
  });
});
