import { ISVG } from "./interface";

export class Generator {

  private text: string = "";
  private rest: Array<ISVG | ISVG[]> = [];
  private parent: string[] = [];

  public generator(svgAst: ISVG | ISVG[]): string {
    this.text = "";
    this.rest = [];
    this.parent = [];
    return this.traverseSvgAst(svgAst).trim();
  }

  private traverseSvgAst(obj: ISVG | ISVG[]): string {
      let objClone: ISVG[] = [];
      if (Array.isArray(obj)) {
        objClone = obj.slice();
      } else {
        objClone.push(obj);
      }

      while (objClone.length > 0) {
        const currentNode = objClone.shift();
        if (!currentNode || !currentNode.body) {
          break;
        }
        const body = currentNode.body;
        const currAttr = currentNode.attr;
        const attr = Object.keys(currentNode.attr).map((key) => {
          return `${key}="${currAttr[key]}"`;
        }).join(" ");

        this.text += `${this.parent.map(() => "\t").join("")} <${currentNode.tag} ${attr}>`;

        if (Array.isArray(currentNode.body) && currentNode.body.length > 0) {
          this.text += "\n";
          this.parent.push(currentNode.tag);
          this.rest.push(objClone);
          return this.traverseSvgAst(currentNode.body);
        }

        this.text += `${body} </${currentNode.tag}>\n`;
      }

      while (this.rest.length > 0) {
        const next = this.rest.pop();
        const tag = this.parent.pop();
        this.text += `${this.parent.map(() => "\t").join("")} </${tag}>\n`;
        if (next && Array.isArray(next) && next.length > 0) {
          this.traverseSvgAst(next);
        }
      }

      return this.text;
    }

}
