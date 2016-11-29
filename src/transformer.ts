export function transformer(ast: IAST): ISVGAST {
  const svgAst: ISVGAST = {
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

  // 一次提取一个调用表达式，作为 `node`。循环直至我们跳出表达式体。
  while (ast.body.length > 0) {
    const node = ast.body.shift();
    switch (node.name) {
      case "Paper":
        const paperColor = 100 - Number(node.arguments[0].value);
        svgAst.body.push({ // 在 svg_ast 的 body 内加入 rect 元素信息
          tag: "rect",
          attr: {
            x: 0, y: 0, width: 100, height: 100,
            fill: "rgb(" + paperColor + "%," + paperColor + "%," + paperColor + "%)",
          },
        });
        break;
      case "Pen":
        penColor = 100 - Number(node.arguments[0].value); // 把当前的钢笔颜色保存在 `pen_color` 变量内
        break;
      case "Line":
        break;
      default:
        break;
    }
  }
  return svgAst;
}
