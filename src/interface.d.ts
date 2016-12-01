interface IToken {
  type: string;
  value: string | number;
}

interface IAST {
  type: string;
  body: IBody[];
}

interface IBody {
  type: string;
  name?: string;
  arguments?: IToken[];
}

interface IAttr {
  width: number;
  height: number;
  viewBox: string;
  xmlns: string;
  version: string;
  [key: string]: string | number;
}

interface ISVGAST {
  tag: string;
  attr: IAttr ;
  body: IBodys[];
}

interface IBodys {
  tag: string;
  attr: IBodyRect | IBodyLine;
  body: IBodys[]
}

interface IBodyRect {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  [key: string]: string | number;
}

interface IBodyLine {
  x1: number
  y1: number,
  x2: number,
  y2: number,
  stroke: string,
  "stroke-linecap": string,
  [key: string]: string | number;
}

interface IElements {
  Line: Function;
  Paper: Function;
}
