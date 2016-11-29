interface IToken {
  type: string;
  value: string | number;
}

function lexer(code: String): IToken[] {
  return code.split(/\s+/)
    .filter((t) => { return t.length > 0; })
    .map((t) => {
      const n = Number(t);
      return isNaN(n)
        ? { type: "word", value: t }
        : { type: "number", value: n };
    });
}

console.log(lexer("Paper 100"));
