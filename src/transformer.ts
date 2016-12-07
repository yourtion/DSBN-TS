import { IAST, ISVG, IToken } from "./interface";

function makeColor(level: number = 100): string {
  level = 100 - level;
  return `rgb(${level}%, ${level}%, ${level}%)`;
}

export function transformer(ast: IAST): ISVG {
  const astClone = Object.assign({}, ast);
  const svgAst: ISVG = {
    tag: "svg",
    attr: {
      height: 100, width: 100,
      viewBox: "0 0 100 100",
      xmlns: "http://www.w3.org/2000/svg",
      version: "1.1",
    },
    body: [],
  };
  let penColor = 100; // 默认钢笔颜色为黑
  const variables: {
   [key: string]: number | string;
  } = {};

  function findParamValue(p: IToken): number {
    if (p.type === "word") {
      return Number(variables[p.value]);
    }
    return Number(p.value);
  }

  const elements = {
    Line: (param: IToken[], penColor: number): ISVG => {
      return {
        tag: "line",
        attr: {
          "x1": findParamValue(param[0]),
          "y1": 100 - findParamValue(param[1]),
          "x2": findParamValue(param[2]),
          "y2": 100 - findParamValue(param[3]),
          "stroke": makeColor(penColor),
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
          fill: makeColor(findParamValue(param[0])),
        },
        body: [],
      };
    },
  };

  // 一次提取一个调用表达式，作为 `node`。循环直至我们跳出表达式体。
  while (astClone.body.length > 0) {
    const node = astClone.body.shift();
    if (node && (node.type === "CallExpression" || node.type === "VariableDeclaration")) {
      if (node.name === "Pen" && node.arguments) {
        penColor = findParamValue(node.arguments[0]);
      } else if (node.name === "Set" && node.identifier && node.value) {
        variables[node.identifier.value] = (node.value as IToken).value;
      } else if (node.name === "Line" && node.arguments) {
        svgAst.body.push(elements.Line(node.arguments, penColor));
      } else if (node.name === "Paper" && node.arguments) {
        svgAst.body.push(elements.Paper(node.arguments));
      } else {
        throw new Error(`${node.name} is not a valid command.`);
      }
    }
  }

  return svgAst;
}
