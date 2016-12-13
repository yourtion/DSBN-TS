import { Generator } from "./generator";
import { IAST, IBody, ISVG, IToken } from "./interface";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Transformer } from "./transformer";

export class DSBN {

  public static VERSION = "0.1.0";
  public static Lexer = Lexer;
  public static Parser = Parser;
  public static Transformer = Transformer;
  public static Generator = Generator;

  private L = new Lexer();
  private P = new Parser();
  private T = new Transformer();
  private G = new Generator();

  public compile = (code: string): string => {
    return this.G.generator(this.T.transformer(this.P.parser(this.L.lexer(code))));
  }
}
