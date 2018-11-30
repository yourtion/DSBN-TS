export interface IToken {
  type: string;
  value: string | number;
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
}

export interface IAttr {
  width: number;
  height: number;
  viewBox: string;
  xmlns: string;
  version: string;
  [key: string]: string | number;
}

export interface ISVG {
  tag: string;
  attr: IAttr | IBodyRect | IBodyLine;
  body: ISVG[];
}

export interface IBodyRect {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  [key: string]: string | number;
}

export interface IBodyLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  "stroke-linecap": string;
  [key: string]: string | number;
}

export interface IElements {
  Line: () => {};
  Paper: () => {};
}
