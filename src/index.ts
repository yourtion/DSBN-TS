import { lexer, parser } from "./parser";
import { dump } from "./utils";

const lex = lexer("Paper 100");
const parsed = parser(lex);

dump(parsed);
