const { readFileSync, writeFileSync, readdirSync } = require("node:fs");
const { resolve } = require("node:path");
const { DSBN } = require("../dist/lib");

const directory = resolve(__dirname, "../example");
for (const name of readdirSync(directory).filter((file) => file.endsWith(".dbn")).sort()) {
  const svg = new DSBN().compile(readFileSync(resolve(directory, name), "utf8"));
  const output = name.replace(/\.dbn$/, ".svg");
  writeFileSync(resolve(directory, output), svg + "\n");
  console.log(`${name} -> ${output}`);
}
