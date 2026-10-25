/** Tokens also represent evaluated expressions in the drawing AST. */
export interface IToken {
  type: string;
  value: string | number;
  left?: IToken;
  right?: IToken;
  arguments?: IToken[];
}

export interface IAST {
  type: string;
  body: IBody[];
}

export interface IBody {
  type: string;
  name?: string;
  arguments?: IToken[];
  identifier?: IToken;
  value?: IToken | string;
  body?: IBody[];
}

export interface IAttributes {
  [key: string]: string | number;
}

export interface IAttr extends IAttributes {
  width: number;
  height: number;
  viewBox: string;
  xmlns: string;
  version: string;
}

export interface ISVG {
  tag: string;
  attr: IAttributes;
  body: ISVG[];
}

export interface IBodyRect extends IAttributes {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

export interface IBodyLine extends IAttributes {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  "stroke-linecap": string;
}

export interface IElements {
  Line: () => object;
  Paper: () => object;
}

export interface ICompileOptions {
  /** Limits executed statements and loop iterations, including empty loops. */
  maxSteps?: number;
}
