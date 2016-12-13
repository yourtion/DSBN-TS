import { IAST, IBody, IToken } from "./interface";

export class Parser {

  private tokens: IToken[];

  public parser(tokens: IToken[]): IAST {
    this.tokens = tokens.slice();
    let AST: IAST = {
      body: [],
      type: "Drawing",
    };
    let paper = false;
    let pen = false;
    // 一次提取一个标记，作为 current_token，一直循环，直到我们脱离标记。
    while (this.tokens.length > 0) {
      const currentToken = this.tokens.shift();

      // 既然数字标记自身并不做任何事情，我们只要在发现一个单词时分析它的语法。
      if (currentToken && currentToken.type === "word") {
        switch (currentToken.value) {
          case "{": {
            const block = {
              type: "Block Start",
            };
            AST.body.push(block);
            break;
          }
          case "}": {
            const block = {
              type: "Block End",
            };
            AST.body.push(block);
            break;
          }
          case "//": {
            const expression: IBody = {
              type: "CommentExpression",
              value: "",
            };
            let next = this.tokens.shift();
            while (next && next.type !== "newline") {
              expression.value += next.value + " ";
              next = this.tokens.shift();
            }
            AST.body.push(expression);
            break;
          }
          case "Paper": {
            if (paper) {
              throw new Error("You can not define Paper more than once");
            }
            const args = this.findArguments("Paper", 1);
            const expression: IBody = {
              type: "CallExpression",
              name: "Paper",
              arguments: args,
            };
            AST.body.push(expression);
            paper = true;
            break;
          }
          case "Pen": {
            const args = this.findArguments("Pen", 1);
            const expression: IBody = {
              type: "CallExpression",
              name: "Pen",
              arguments: args,
            };
            AST.body.push(expression);
            pen = true;
            break;
          }
          case "Line": {
            if (!paper) {
              throw new Error("Please make Paper 1st");
            }
            if (!pen) {
              throw new Error("Please define Pen 1st");
            }

            const args = this.findArguments("Line", 4);
            const expression: IBody = {
              type: "CallExpression",
              name: "Line",
              arguments: args,
            };
            AST.body.push(expression);
            break;
          }
          case "Set": {
            const args = this.findArguments("Set", 2, ["word", "number"]);
            const expression: IBody = {
              type: "VariableDeclaration",
              name: "Set",
              identifier: args[0],
              value: args[1],
            };
            AST.body.push(expression);
            break;
          }
          default:
            break;
        }
      }
    }
    return AST;
  }

  private expectedTypeCheck = (type: string, expect: string[] | string): boolean => {
    if (Array.isArray(expect)) {
      return expect.indexOf(type) >= 0;
    }
    return type === expect;
  }

  private findArguments = (cmd: string, expLen: number, expType?: Array<string | string[]>): IToken[] => {
    let curPos = 0;
    const curList: IToken[] = [];
    while (expLen > curPos) {
      const token = this.tokens.shift();
      if (!token) {
        throw new Error(`${cmd} takes ${expLen} argument(s). `);
      }

      if (expType) {
        const expected = this.expectedTypeCheck(token.type, expType[curPos]);
        if (!expected) {
          throw new Error(`${cmd} takes ${JSON.stringify(expType[curPos])} as argument ${(curPos + 1)}.
               ${JSON.stringify(token)} "Instead found a ${token.type} ${token.value}`);
        }
        if (token.type === "number" && (token.value < 0 || token.value > 100)) {
          throw new Error(`Found value ${token.value} for ${cmd} . Value must be between 0 - 100.`);
        }
      }

      const arg: IToken = {
        type: token.type,
        value: token.value,
      };
      curList.push(arg);
      curPos++;
    }
    return curList;
  }

}
