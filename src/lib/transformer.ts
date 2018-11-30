import { IAST, ISVG, IToken } from "./interface";

export class Transformer {

  private variables: {
    [key: string]: number | string;
  } = {};
  private penColor = 100; // 默认钢笔颜色为黑
  private ast: IAST = {} as IAST;
  private svgAst: ISVG = {} as ISVG;

  private elements = {
    Line: (param: IToken[], penColor: number): ISVG => {
      return {
        tag: "line",
        attr: {
          "x1": this.findParamValue(param[0]),
          "y1": 100 - this.findParamValue(param[1]),
          "x2": this.findParamValue(param[2]),
          "y2": 100 - this.findParamValue(param[3]),
          "stroke": this.makeColor(penColor),
          "stroke-linecap": "round",
        },
        body: [],
      };
    },
    Paper: (param: IToken[]): ISVG => {
      return {
        tag: "rect",
        attr: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          fill: this.makeColor(this.findParamValue(param[0])),
        },
        body: [],
      };
    },
  };

  public transformer(ast: IAST): ISVG {
    this.variables = {};
    this.ast = Object.assign({}, ast);
    this.svgAst = {
      tag: "svg",
      attr: {
        height: 100, width: 100,
        viewBox: "0 0 100 100",
        xmlns: "http://www.w3.org/2000/svg",
        version: "1.1",
      },
      body: [],
    };

    // 一次提取一个调用表达式，作为 `node`。循环直至我们跳出表达式体。
    while (this.ast.body.length > 0) {
      const node = this.ast.body.shift();
      if (node && (node.type === "CallExpression" || node.type === "VariableDeclaration")) {
        if (node.name === "Pen" && node.arguments) {
          this.penColor = this.findParamValue(node.arguments[0]);
        } else if (node.name === "Set" && node.identifier && node.value) {
          this.variables[node.identifier.value] = (node.value as IToken).value;
        } else if (node.name === "Line" && node.arguments) {
          this.svgAst.body.push(this.elements.Line(node.arguments, this.penColor));
        } else if (node.name === "Paper" && node.arguments) {
          this.svgAst.body.push(this.elements.Paper(node.arguments));
        } else {
          throw new Error(`${node.name} is not a valid command.`);
        }
      }
    }

    return this.svgAst;
  }

  private findParamValue(p: IToken): number {
    if (p.type === "word") {
      return Number(this.variables[p.value]);
    }
    return Number(p.value);
  }

  private makeColor(level: number = 100): string {
    level = 100 - level;
    return `rgb(${level}%, ${level}%, ${level}%)`;
  }
}
