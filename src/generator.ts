import { ISVG } from "./interface";

export function generator(svgAst: ISVG | ISVG[]): string {

  function traverseSvgAst(obj: ISVG | ISVG[], parent: string[] = [], rest: Array<ISVG|ISVG[]> = [], text = ""): string {
    let objClone: ISVG[] = [];
    if (Array.isArray(obj)) {
      objClone = obj.slice();
    } else {
      objClone.push(obj);
    }

    while (objClone.length > 0) {
      let currentNode = objClone.shift();
      if (!currentNode || !currentNode.body) {
        break;
      }
      let body = currentNode.body ;
      const currAttr = currentNode.attr;
      let attr = Object.keys(currentNode.attr).map( (key) => {
        return `${key}="${currAttr[key]}"`;
      }).join(" ");

      text += `${parent.map( () => { return "\t"; }).join("")} <${currentNode.tag} ${attr}>`;

      if ( Array.isArray(currentNode.body) && currentNode.body.length > 0) {
        text += "\n";
        parent.push(currentNode.tag);
        rest.push(objClone);
        return traverseSvgAst(currentNode.body, parent, rest, text);
      }

      text += `${body} </${currentNode.tag}>\n`;
    }

    while (rest.length > 0) {
      let next = rest.pop();
      let tag = parent.pop();
      text += `${parent.map( () => { return "\t"; }).join("")} </${tag}>\n`;
      if (next && Array.isArray(next) && next.length > 0) {
        traverseSvgAst(next, parent, rest, text);
      }
    }

    return text;
  }

  return traverseSvgAst(svgAst).trim();
}
