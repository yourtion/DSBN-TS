import { Generator } from "./generator";
import { ICompileOptions } from "./interface";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Transformer } from "./transformer";

export * from "./generator";
export * from "./interface";
export * from "./lexer";
export * from "./parser";
export * from "./transformer";

export class DSBN {

  public static VERSION = "0.3.0";

  private L = new Lexer();
  private P = new Parser();
  private T = new Transformer();
  private G = new Generator();

  public compile = (code: string, options: ICompileOptions = {}): string => {
    return this.G.generator(this.T.transformer(this.P.parser(this.L.lexer(code)), options));
  }
}
