import { Generator } from "./generator";
import { IAST, IBody, ISVG, IToken } from "./interface";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Transformer } from "./transformer";

export class DSBN {

  public static VERSION = "0.1.0";
  public static lexer = new Lexer().lexer;
  public static parser = new Parser().parser;
  public static transformer = new Transformer().transformer;
  public static generator = new Generator().generator;

  public compile = (code: string): string => {
    return DSBN.generator(DSBN.transformer(DSBN.parser(DSBN.lexer(code))));
  }
}
