/**
 * 从 attr 对象中创建属性（attribute）字符串
 * 使得 { "width": 100, "height": 100 } 变成 'width="100" height="100"'
 * 
 * @param {IAttr} attr
 * @returns {string}
 */
function createAttrString(attr: IAttr | IBodyRect | IBodyLine): string {
  return Object.keys(attr).map((key: string) => {
    return `${key}="${attr[key]}"`;
  }).join(" ");
}

export function generator(svgAst: ISVGAST): string {
  // 顶端节点总是 <svg>。为 svg 标签创建属性字符串
  const svgAttr = createAttrString(svgAst.attr);

  // 为每个 svf_ast body 中的元素，生成 svg 标签
  const elements = svgAst.body.map((node) => {
    return `<${node.tag} ${createAttrString(node.attr)}></${node.tag}>`;
  }).join("\n\t");

  // 使用开和关的 svg 标签包装来完成 svg 代码
  return `<svg ${ svgAttr }> ${ elements } </svg>`;
}
