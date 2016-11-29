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
