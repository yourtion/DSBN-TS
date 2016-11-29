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
  name: string;
  arguments: IToken[];
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
  attr: IAttr;
  body: IBodys[];
}

interface IBodys {
  tag: string;
  attr: IBodyAttr;
}

interface IBodyAttr {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}
