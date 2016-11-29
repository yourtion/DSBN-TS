function lexer (code: String) {
  return code.split(/\s+/)
          .filter(function (t) { return t.length > 0 })
          .map(function (t) {
            const n = Number(t)
            return isNaN(n)
                    ? {type: 'word', value: t}
                    : {type: 'number', value: n}
          })
}
console.log(lexer("Paper 100"));
