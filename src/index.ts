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

  private lexer = new Lexer().lexer;
  private parser = new Parser().parser;
  private transformer = new Transformer().transformer;
  private generator = new Generator().generator;


  public compile = (code: string): string => {
    return this.generator(this.transformer(this.parser(this.lexer(code))));
  }
}
