import { generator } from "./generator";
import { lexer, parser } from "./parser";
import { transformer } from "./transformer";
import { dump } from "./utils";

const lex = lexer("Paper 100");
dump(lex);

const parsed = parser(lex);
dump(parsed);

const transformed = transformer(parsed);
dump(transformed);

const xml = generator(transformed);
dump(xml);
