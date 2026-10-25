#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { DSBN } from "./lib";

const usage = `Usage: dsbn [input.dbn|-] [-o output.svg] [--max-steps number]

Compile a DBN drawing to SVG. With no input file (or -), read standard input.
Without -o, write SVG to standard output.
`;

function main(args: string[]): void {
  let input: string | undefined;
  let output: string | undefined;
  let maxSteps: number | undefined;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") { process.stdout.write(usage); return; }
    if (arg === "--version" || arg === "-v") { process.stdout.write(DSBN.VERSION + "\n"); return; }
    if (arg === "-o" || arg === "--output" || arg === "--max-steps") {
      const value = args[++i];
      if (!value || value.startsWith("-")) { throw new Error(`${arg} requires a value`); }
      if (arg === "--max-steps") { maxSteps = Number(value); } else { output = value; }
    } else if (arg.startsWith("-") && arg !== "-") {
      throw new Error(`Unknown option ${arg}`);
    } else {
      if (input !== undefined) { throw new Error("Only one input file is supported"); }
      input = arg;
    }
  }
  const source = readFileSync(input && input !== "-" ? input : 0, "utf8");
  const svg = new DSBN().compile(source, { maxSteps });
  if (output) { writeFileSync(output, svg + "\n", "utf8"); } else { process.stdout.write(svg + "\n"); }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`dsbn: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
