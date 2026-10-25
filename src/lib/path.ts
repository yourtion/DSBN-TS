/** Validate numeric SVG path command groups before emitting browser-consumed geometry. */
export function validatePath(path: string): boolean {
  const arity: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
  const tokens: Array<string | number> = [];
  const pattern = /[A-Za-z]|[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/g;
  let end = 0;
  for (const match of path.matchAll(pattern)) {
    if (!/^[\s,]*$/.test(path.slice(end, match.index))) { return false; }
    const token = match[0];
    if (/^[A-Za-z]$/.test(token)) { tokens.push(token); } else {
      const number = Number(token);
      if (!Number.isFinite(number)) { return false; }
      tokens.push(number);
    }
    end = match.index! + token.length;
  }
  if (!/^[\s]*$/.test(path.slice(end)) || !["M", "m"].includes(String(tokens[0]))) { return false; }
  let index = 0;
  while (index < tokens.length) {
    const command = tokens[index++];
    if (typeof command !== "string") { return false; }
    const key = command.toUpperCase();
    if (!Object.prototype.hasOwnProperty.call(arity, key)) { return false; }
    const size = arity[key];
    const start = index;
    while (typeof tokens[index] === "number") { index++; }
    const count = index - start;
    if (size === 0) {
      if (count !== 0) { return false; }
    } else {
      if (count === 0 || count % size !== 0) { return false; }
      if (key === "A") {
        for (let group = start; group < index; group += size) {
          if (Number(tokens[group]) < 0 || Number(tokens[group + 1]) < 0 ||
            ![0, 1].includes(Number(tokens[group + 3])) || ![0, 1].includes(Number(tokens[group + 4]))) { return false; }
        }
      }
    }
  }
  return true;
}
