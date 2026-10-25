import { expect } from "chai";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DSBN } from "../lib";

const cli = (...args: string[]) => spawnSync(process.execPath, [resolve(__dirname, "../cli.js"), ...args], {
  input: "Paper 0", encoding: "utf8", timeout: 5000,
});

describe("CLI and examples", () => {
  it("prints help and package version", () => {
    expect(cli("--help").stdout).to.contain("Usage: dsbn");
    expect(cli("-h").status).to.equal(0);
    expect(cli("--version").stdout.trim()).to.equal(DSBN.VERSION);
    expect(cli("-v").status).to.equal(0);
    const pkg = JSON.parse(readFileSync(resolve(__dirname, "../../package.json"), "utf8"));
    expect(DSBN.VERSION).to.equal(pkg.version);
  });

  it("compiles standard input with and without the stdin marker", () => {
    for (const args of [[], ["-"]]) {
      const result = cli(...args);
      expect(result.status, result.stderr).to.equal(0);
      expect(result.stdout.trim()).to.equal(new DSBN().compile("Paper 0"));
    }
  });

  it("reads files, exports SVG, and leaves output intact on compilation failure", () => {
    const dir = mkdtempSync(join(tmpdir(), "dsbn-"));
    try {
      const input = join(dir, "drawing.dbn");
      const output = join(dir, "drawing.svg");
      writeFileSync(input, "Paper 0 Pen 100 Circle 50 50 10");
      expect(cli(input, "--output", output).status).to.equal(0);
      expect(readFileSync(output, "utf8")).to.contain("<circle");
      const previous = readFileSync(output, "utf8");
      writeFileSync(input, "Paper 0 Pen 100 Repeat n 0 100 {}");
      expect(cli(input, "-o", output, "--max-steps", "2").status).to.equal(1);
      expect(readFileSync(output, "utf8")).to.equal(previous);
      expect(cli(input).stdout).to.contain("<svg");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  for (const args of [["--unknown"], ["-o"], ["--max-steps", "nope"], ["-", "another.dbn"], ["missing-file.dbn"]]) {
    it(`reports ${args.join(" ")} with exit code 1`, () => {
      const result = cli(...args);
      expect(result.status).to.equal(1);
      expect(result.stderr).to.match(/^dsbn: /);
      expect(result.stdout).to.equal("");
    });
  }

  it("compiles every demo to its checked-in SVG without NaN or undefined", () => {
    const dir = resolve(__dirname, "../../example");
    const sources = readdirSync(dir).filter((file) => file.endsWith(".dbn"));
    expect(sources.length).to.be.at.least(4);
    for (const file of sources) {
      const svg = new DSBN().compile(readFileSync(join(dir, file), "utf8"));
      expect(svg).not.to.match(/NaN|undefined|Infinity/);
      expect(svg + "\n").to.equal(readFileSync(join(dir, file.replace(/\.dbn$/, ".svg")), "utf8"));
    }
  });
});
