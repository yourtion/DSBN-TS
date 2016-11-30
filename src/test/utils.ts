import * as util from "util";

export function dump(...args: any[]) {
  for (const item of args) {
    console.log(util.inspect(item, { depth: 10, colors: true }));
  }
}
