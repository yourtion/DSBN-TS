export function parser(tokens: IToken[]): IAST {
  const tokensClone = tokens.slice();
  let AST: IAST = {
    body: [],
    type: "Drawing",
  };
  // 一次提取一个标记，作为 current_token，一直循环，直到我们脱离标记。
  while (tokensClone.length > 0) {
    const currentToken = tokensClone.shift();

    // 既然数字标记自身并不做任何事情，我们只要在发现一个单词时分析它的语法。
    if (currentToken.type === "word") {
      switch (currentToken.value) {
        case "Paper":
          const expression: IBody = {
            type: "CallExpression",
            name: "Paper",
            arguments: [],
          };
          // 如果当前标记是以 Paper 为类型的 CallExpression，下一个标记应该是颜色参数
          const argument = tokensClone.shift();
          if (argument.type === "number") {
            expression.arguments.push({  // 在 expression 对象内部加入参数信息
              type: "NumberLiteral",
              value: argument.value,
            });
            AST.body.push(expression);    // 将 expression 对象放入我们的 AST 的 body 内
          } else {
            throw "Paper command must be followed by a number.";
          }
          break;
        case "Pen":
          break;
        case "Line":
          break;
        default:
      }
    }
  }
  return AST;
}
