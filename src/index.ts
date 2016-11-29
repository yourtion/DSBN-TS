import { lexer, parser } from "./parser";
import { transformer } from "./transformer";
import { dump } from "./utils";

const lex = lexer("Paper 100");
const parsed = parser(lex);
const transformed = transformer(parsed);

dump(transformed);
