import { IAST, IBody, IToken } from "./interface";

const ARITY: Record<string, number> = { Paper: 1, Pen: 1, Line: 4, Rect: 4, Circle: 3, Ellipse: 4, Path: 1 };
const QUESTIONS = ["Same?", "NotSame?", "Smaller?", "NotSmaller?"];
const COMMANDS = new Set([...Object.keys(ARITY), ...QUESTIONS, "Set", "Repeat", "Polyline", "Polygon"]);

export class Parser {
  private tokens: IToken[] = [];
  private position = 0;
  private paper = false;
  private pen = false;
  private depth = 0;

  public parser(tokens: IToken[]): IAST {
    this.tokens = tokens;
    this.position = 0;
    this.paper = false;
    this.pen = false;
    this.depth = 0;
    return { type: "Drawing", body: this.statements(false) };
  }

  private peek(): IToken | undefined { return this.tokens[this.position]; }
  private take(): IToken {
    const token = this.tokens[this.position++];
    if (!token) { throw new SyntaxError("Unexpected end of input"); }
    return token;
  }
  private expect(type: string): IToken {
    const token = this.take();
    if (token.type !== type) { throw new SyntaxError(`Expected ${type}, found ${token.value}`); }
    return token;
  }
  private newlines(): void {
    while (this.peek()?.type === "newline") { this.position++; }
  }
  private statements(inBlock: boolean): IBody[] {
    const body: IBody[] = [];
    this.newlines();
    while (this.peek()) {
      if (this.peek()?.type === "ccb") {
        if (!inBlock) { throw new SyntaxError("Unexpected closing brace"); }
        this.position++;
        return body;
      }
      body.push(this.statement());
      this.newlines();
    }
    if (inBlock) { throw new SyntaxError("Unclosed block: expected }"); }
    return body;
  }
  private block(): IBody[] {
    this.newlines();
    this.expect("ocb");
    if (++this.depth > 100) { throw new SyntaxError("Block nesting limit exceeded (100)"); }
    const body = this.statements(true);
    this.depth--;
    return body;
  }
  private statement(): IBody {
    if (this.peek()?.type === "ocb") { return { type: "BlockStatement", body: this.block() }; }
    const token = this.expect("word");
    let name = String(token.value);
    if (name === "//") {
      let value = "";
      while (this.peek() && this.peek()?.type !== "newline") { value += this.take().value + " "; }
      return { type: "CommentExpression", value };
    }
    if (["Same", "NotSame", "Smaller", "NotSmaller"].includes(name) && this.peek()?.value === "?") {
      this.position++;
      name += "?";
    }
    if (name === "Repeat") {
      const identifier = this.identifier();
      const args = this.arguments(name, 2);
      const body = this.block();
      return { type: "RepeatStatement", name, identifier, arguments: args, body };
    }
    if (QUESTIONS.includes(name)) {
      const args = this.arguments(name, 2);
      const pen = this.pen;
      const body = this.block();
      this.pen = pen;
      return { type: "QuestionStatement", name, arguments: args, body };
    }
    if (name === "Set") {
      const identifier = this.peek()?.type === "ob" ? this.point() : this.identifier();
      if (identifier.type === "point" && !this.paper) { throw new Error("Please make Paper 1st"); }
      return { type: "VariableDeclaration", name, identifier, value: this.arguments(name, 1)[0] };
    }
    if (!Object.prototype.hasOwnProperty.call(ARITY, name) && name !== "Polyline" && name !== "Polygon") {
      throw new SyntaxError(`${name} is not a valid command.`);
    }
    if (name === "Paper") {
      if (this.depth > 0) { throw new SyntaxError("Paper must be defined at the top level"); }
      if (this.paper) { throw new Error("You can not define Paper more than once"); }
    } else if (name !== "Pen") {
      this.requireDrawing();
    }
    const args: IToken[] = [];
    if (name === "Polyline" || name === "Polygon") {
      while (this.peek()?.type === "ob") { args.push(this.point()); }
      const min = name === "Polygon" ? 3 : 2;
      if (args.length < min) { throw new SyntaxError(`${name} takes at least ${min} points [x y]`); }
    } else {
      args.push(...this.arguments(name, ARITY[name]));
    }
    if (name === "Paper") { this.paper = true; }
    if (name === "Pen") { this.pen = true; }
    return { type: "CallExpression", name, arguments: args };
  }
  private requireDrawing(): void {
    if (!this.paper) { throw new Error("Please make Paper 1st"); }
    if (!this.pen) { throw new Error("Please define Pen 1st"); }
  }
  private identifier(): IToken {
    const token = this.expect("word");
    if (!/^[A-Za-z_][A-Za-z_0-9]*$/.test(String(token.value)) || COMMANDS.has(String(token.value))) {
      throw new SyntaxError(`Invalid variable name ${token.value}`);
    }
    return token;
  }
  private arguments(name: string, count: number): IToken[] {
    const args: IToken[] = [];
    for (let i = 0; i < count; i++) {
      const token = this.peek();
      if (!token || ["newline", "ocb", "ccb"].includes(token.type) || (token.type === "word" && COMMANDS.has(String(token.value)))) {
        throw new SyntaxError(`${name} takes ${count} argument(s). Missing argument ${i + 1}.`);
      }
      args.push(this.atom(0));
    }
    return args;
  }
  private point(depth = 0): IToken {
    this.expect("ob");
    const x = this.atom(depth + 1);
    if (this.peek()?.type === "comma") { this.position++; }
    const y = this.atom(depth + 1);
    this.expect("cb");
    return { type: "point", value: "[]", arguments: [x, y] };
  }
  private atom(depth: number): IToken {
    if (depth > 100) { throw new SyntaxError("Expression nesting limit exceeded (100)"); }
    const token = this.peek();
    if (!token) { throw new SyntaxError("Expected an expression"); }
    if (token.type === "operator" && (token.value === "-" || token.value === "+")) {
      this.position++;
      return { type: "unary", value: token.value, right: this.atom(depth + 1) };
    }
    if (token.type === "op") {
      this.position++;
      const result = this.binary(0, depth + 1);
      this.expect("cp");
      return result;
    }
    if (token.type === "ob") { return this.point(depth + 1); }
    if (["number", "string"].includes(token.type) || (token.type === "word" && !COMMANDS.has(String(token.value)))) {
      this.position++;
      return token;
    }
    throw new SyntaxError(`Expected an expression, found ${token.value || token.type}`);
  }
  private binary(min: number, depth: number): IToken {
    let left = this.atom(depth);
    while (this.peek()?.type === "operator") {
      const operator = String(this.peek()?.value);
      const precedence = operator === "*" || operator === "/" ? 2 : 1;
      if (precedence < min) { break; }
      this.position++;
      const right = this.binary(precedence + 1, depth + 1);
      left = { type: "binary", value: operator, left, right };
    }
    return left;
  }
}
