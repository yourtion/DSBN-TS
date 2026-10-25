import { ISVG } from "./interface";

/** Serialize a SVG tree without changing it. Attribute values are always XML escaped. */
export class Generator {
  public generator(svgAst: ISVG | ISVG[]): string {
    const nodes = Array.isArray(svgAst) ? svgAst : [svgAst];
    return nodes.map((node) => this.render(node, 0)).join("").trim();
  }
  private escape(value: string | number): string {
    if (typeof value === "number" && !Number.isFinite(value)) { throw new TypeError("SVG numbers must be finite"); }
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&apos;");
  }
  private render(node: ISVG, depth: number): string {
    if (depth > 100) { throw new RangeError("SVG nesting limit exceeded (100)"); }
    if (!/^[A-Za-z][A-Za-z0-9:_-]*$/.test(node.tag)) { throw new TypeError("Invalid SVG tag name"); }
    const attributes = Object.entries(node.attr).map(([key, value]) => {
      if (!/^[A-Za-z_][A-Za-z0-9:_.-]*$/.test(key)) { throw new TypeError("Invalid SVG attribute name"); }
      return `${key}="${this.escape(value)}"`;
    }).join(" ");
    const indent = "\t".repeat(depth) + " ";
    const open = `${indent}<${node.tag}${attributes ? " " + attributes : ""}>`;
    if (node.body.length === 0) { return `${open} </${node.tag}>\n`; }
    return `${open}\n${node.body.map((child) => this.render(child, depth + 1)).join("")}${indent}</${node.tag}>\n`;
  }
}
