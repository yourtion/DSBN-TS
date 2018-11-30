import { IToken } from "./interface";

export class Lexer {

  public lexer(code: string): IToken[] {

    const codeToken = code
      .replace(/[\n\r]/g, " *nl* ")
      .replace(/\[/g, " *ob* ")
      .replace(/\]/g, " *cb* ")
      .replace(/\{/g, " *ocb* ")
      .replace(/\}/g, " *ccb* ")
      .split(/[\t\f\v ]+/);

    const tokens: IToken[] = [];
    for (const t of codeToken) {
      const n = Number(t);
      if (t.length <= 0 || isNaN(n)) {
        if (t === "*nl*") {
          tokens.push({ type: "newline", value: "" });
        } else if (t === "*ob*") {
          tokens.push({ type: "ob", value: "[" });
        } else if (t === "*cb*") {
          tokens.push({ type: "cb", value: "]" });
        } else if (t === "*ocb*") {
          tokens.push({ type: "ocb", value: "{" });
        } else if (t === "*ccb*") {
          tokens.push({ type: "ccb", value: "}" });
        } else if (t.length > 0) {
          tokens.push({ type: "word", value: t });
        }
      } else {
        tokens.push({ type: "number", value: n });
      }
    }

    if (tokens.length < 1) {
      throw new Error('No Tokens Found. Try "Paper 10"');
    }

    return tokens;
  }

}
