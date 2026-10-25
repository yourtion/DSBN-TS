import { IToken } from "./interface";

export class Lexer {
  public lexer(code: string): IToken[] {
    const tokens: IToken[] = [];
    const punctuation: Record<string, string> = {
      "[": "ob", "]": "cb", "{": "ocb", "}": "ccb",
      "(": "op", ")": "cp", ",": "comma",
    };
    let offset = 0;
    while (offset < code.length) {
      const rest = code.slice(offset);
      const whitespace = /^[\t\f\v ]+/.exec(rest);
      if (whitespace) {
        offset += whitespace[0].length;
        continue;
      }
      const newline = /^(\r\n|\r|\n)/.exec(rest);
      if (newline) {
        tokens.push({ type: "newline", value: "" });
        offset += newline[0].length;
        continue;
      }
      const comment = /^\/\/[^\r\n]*/.exec(rest);
      if (comment) {
        tokens.push({ type: "word", value: "//" });
        for (const word of comment[0].slice(2).trim().split(/\s+/).filter(Boolean)) {
          tokens.push({ type: Number.isFinite(Number(word)) ? "number" : "word",
            value: Number.isFinite(Number(word)) ? Number(word) : word });
        }
        offset += comment[0].length;
        continue;
      }
      if (rest[0] === '"') {
        const quoted = /^"(?:[^"\\\r\n]|\\[^\r\n])*"/.exec(rest);
        if (!quoted) {
          throw new SyntaxError(`Unterminated string at character ${offset + 1}`);
        }
        let value: string;
        try {
          value = JSON.parse(quoted[0]);
        } catch {
          throw new SyntaxError(`Invalid string escape at character ${offset + 1}`);
        }
        tokens.push({ type: "string", value });
        offset += quoted[0].length;
        continue;
      }
      const number = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(rest);
      if (number) {
        const value = Number(number[0]);
        if (!Number.isFinite(value)) {
          throw new SyntaxError(`Non-finite number at character ${offset + 1}`);
        }
        tokens.push({ type: "number", value });
        offset += number[0].length;
        continue;
      }
      const word = /^[A-Za-z_][A-Za-z_0-9]*\??|^\?/.exec(rest);
      if (word) {
        tokens.push({ type: "word", value: word[0] });
        offset += word[0].length;
        continue;
      }
      const char = rest[0];
      if (punctuation[char] || "+-*/".includes(char)) {
        tokens.push({ type: punctuation[char] || "operator", value: char });
        offset++;
        continue;
      }
      throw new SyntaxError(`Unexpected character ${JSON.stringify(char)} at character ${offset + 1}`);
    }
    if (tokens.length === 0) {
      throw new Error('No Tokens Found. Try "Paper 10"');
    }
    return tokens;
  }
}
