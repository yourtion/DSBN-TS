import { IAST, IAttributes, IBody, ICompileOptions, ISVG, IToken } from "./interface";

import { validatePath } from "./path";

type Value = string | number;
interface Sample { contains: (x: number, y: number) => boolean; color: Value; }

export class Transformer {
  private variables = new Map<string, Value>();
  private penColor: Value = 100;
  private samples: Sample[] = [];
  private steps = 0;
  private maxSteps = 100000;
  private svgAst!: ISVG;

  public transformer(ast: IAST, options: ICompileOptions = {}): ISVG {
    this.maxSteps = options.maxSteps ?? 100000;
    if (!Number.isSafeInteger(this.maxSteps) || this.maxSteps < 1) {
      throw new RangeError("maxSteps must be a positive safe integer");
    }
    this.steps = 0;
    this.variables = new Map();
    this.penColor = 100;
    this.samples = [];
    this.svgAst = {
      tag: "svg",
      attr: { height: 100, width: 100, viewBox: "0 0 100 100", xmlns: "http://www.w3.org/2000/svg", version: "1.1" },
      body: [],
    };
    this.execute(ast.body);
    return this.svgAst;
  }

  private tick(): void {
    if (++this.steps > this.maxSteps) { throw new RangeError(`Execution limit exceeded (${this.maxSteps} steps)`); }
  }
  private execute(body: IBody[]): void {
    for (const node of body) {
      this.tick();
      switch (node.type) {
        case "CommentExpression": break;
        case "BlockStatement": this.execute(node.body!); break;
        case "RepeatStatement": this.repeat(node); break;
        case "QuestionStatement": {
          const [a, b] = node.arguments!.map((arg) => this.number(arg));
          const matches = node.name === "Same?" ? a === b : node.name === "NotSame?" ? a !== b :
            node.name === "Smaller?" ? a < b : a >= b;
          if (matches) { this.execute(node.body!); }
          break;
        }
        case "VariableDeclaration": {
          const value = this.evaluate(node.value as IToken);
          if (node.identifier!.type === "point") {
            const [x, y] = this.coordinates(node.identifier!);
            const color = this.color(value);
            this.emit("rect", { x: x - 0.5, y: 99.5 - y, width: 1, height: 1, fill: color });
            this.samples.push({ contains: (px, py) => px === x && py === y, color: value });
          } else {
            this.variables.set(String(node.identifier!.value), value);
          }
          break;
        }
        case "CallExpression": this.draw(node.name!, node.arguments!); break;
        default: throw new Error(`Unknown AST node ${node.type}`);
      }
    }
  }
  private repeat(node: IBody): void {
    const [start, end] = node.arguments!.map((arg) => this.number(arg));
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
      throw new RangeError("Repeat bounds must be safe integers");
    }
    const name = String(node.identifier!.value);
    const previous = this.variables.get(name);
    const step = start <= end ? 1 : -1;
    try {
      for (let i = start; ; i += step) {
        this.tick();
        this.variables.set(name, i);
        this.execute(node.body!);
        if (i === end) { break; }
      }
    } finally {
      if (previous === undefined) { this.variables.delete(name); } else { this.variables.set(name, previous); }
    }
  }
  private evaluate(token: IToken, depth = 0): Value {
    if (depth > 100) { throw new RangeError("Expression evaluation nesting limit exceeded (100)"); }
    switch (token.type) {
      case "number": case "string": return token.value;
      case "word": {
        const name = String(token.value);
        if (!this.variables.has(name)) { throw new ReferenceError(`Undefined variable ${name}`); }
        return this.variables.get(name)!;
      }
      case "unary": return this.finite((token.value === "-" ? -1 : 1) * this.number(token.right!, depth + 1));
      case "binary": {
        const a = this.number(token.left!, depth + 1);
        const b = this.number(token.right!, depth + 1);
        switch (token.value) {
          case "+": return this.finite(a + b);
          case "-": return this.finite(a - b);
          case "*": return this.finite(a * b);
          case "/":
            if (b === 0) { throw new RangeError("Division by zero"); }
            return this.finite(a / b);
          default: throw new Error(`Unknown operator ${token.value}`);
        }
      }
      case "point": {
        const [x, y] = this.coordinates(token, depth + 1);
        for (let i = this.samples.length - 1; i >= 0; i--) {
          this.tick();
          const sample = this.samples[i];
          if (sample.contains(x, y)) {
            if (typeof sample.color !== "number") { throw new TypeError("Point reads require a grayscale color"); }
            return sample.color;
          }
        }
        throw new Error("Point reads require Paper first");
      }
      default: throw new Error(`Unknown expression ${token.type}`);
    }
  }
  private finite(value: number): number {
    if (!Number.isFinite(value)) { throw new RangeError("Result must be a finite number"); }
    return value;
  }
  private number(token: IToken, depth = 0): number {
    const value = this.evaluate(token, depth);
    if (typeof value !== "number") { throw new TypeError("Expected a number"); }
    return this.finite(value);
  }
  private coordinates(token: IToken, depth = 0): number[] {
    const coordinates = token.arguments!.map((arg) => this.number(arg, depth));
    if (coordinates.some((n) => !Number.isInteger(n) || n < 0 || n > 100)) {
      throw new RangeError("Point coordinates must be integers between 0 - 100");
    }
    return coordinates;
  }
  private color(value: Value): string {
    if (typeof value === "number") {
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        throw new RangeError("Color value must be between 0 - 100");
      }
      const level = 100 - value;
      return `rgb(${level}%, ${level}%, ${level}%)`;
    }
    if (!/^(?:#[\da-f]{3}|#[\da-f]{4}|#[\da-f]{6}|#[\da-f]{8}|[a-z]+|(?:rgb|rgba|hsl|hsla)\([\d\s.,%+-]+\))$/i.test(value)) {
      throw new TypeError(`Invalid color ${JSON.stringify(value)}`);
    }
    return value;
  }
  private emit(tag: string, attr: IAttributes): void { this.svgAst.body.push({ tag, attr, body: [] }); }
  private draw(name: string, args: IToken[]): void {
    if (name === "Pen") {
      const color = this.evaluate(args[0]);
      this.color(color);
      this.penColor = color;
      return;
    }
    if (name === "Paper") {
      const value = this.evaluate(args[0]);
      this.emit("rect", { x: 0, y: 0, width: 100, height: 100, fill: this.color(value) });
      this.samples.push({ contains: () => true, color: value });
      return;
    }
    const color = this.color(this.penColor);
    if (name === "Path") {
      const path = this.evaluate(args[0]);
      // Path geometry uses DBN's upward Y axis; no external resources or markup are accepted.
      if (typeof path !== "string" || !validatePath(path)) {
        throw new TypeError("Path expects quoted SVG path data beginning with M or m");
      }
      this.emit("path", { d: path, fill: color, transform: "translate(0 100) scale(1 -1)" });
      return;
    }
    if (name === "Polyline" || name === "Polygon") {
      const points = args.map((point) => point.arguments!.map((arg) => this.number(arg)));
      const attr: IAttributes = { points: points.map(([x, y]) => `${x},${100 - y}`).join(" ") };
      if (name === "Polyline") {
        Object.assign(attr, { fill: "none", stroke: color, "stroke-linecap": "round", "stroke-linejoin": "round" });
      } else { attr.fill = color; }
      this.emit(name.toLowerCase(), attr);
      return;
    }
    const values = args.map((arg) => this.number(arg));
    const [x, y, a, b] = values;
    if (name !== "Line" && values.slice(2).some((n) => n < 0)) {
      throw new RangeError(`${name} dimensions must be non-negative`);
    }
    switch (name) {
      case "Line": {
        this.emit("line", { x1: x, y1: 100 - y, x2: a, y2: 100 - b, stroke: color, "stroke-linecap": "round" });
        const dx = a - x;
        const dy = b - y;
        const lengthSquared = dx * dx + dy * dy;
        const pen = this.penColor;
        this.samples.push({ color: pen, contains: (px, py) => {
          const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - x) * dx + (py - y) * dy) / lengthSquared));
          return Math.hypot(px - x - t * dx, py - y - t * dy) <= 0.5;
        } });
        break;
      }
      case "Rect": this.emit("rect", { x, y: this.finite(100 - y - b), width: a, height: b, fill: color }); break;
      case "Circle": this.emit("circle", { cx: x, cy: 100 - y, r: a, fill: color }); break;
      case "Ellipse": this.emit("ellipse", { cx: x, cy: 100 - y, rx: a, ry: b, fill: color }); break;
      default: throw new Error(`${name} is not a valid command.`);
    }
  }
}
