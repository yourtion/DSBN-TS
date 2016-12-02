import { generator } from "./generator";
import { lexer } from "./lexer";
import { parser } from "./parser";
import { transformer } from "./transformer";

export class DSBN {

  public static VERSION = "0.1.0";
  public static lexer = lexer;
  public static parser = parser;
  public static transformer = transformer;
  public static generator = generator;

  public compile = (code: string): string => {
    return generator(transformer(parser(lexer(code))));
  }
}
