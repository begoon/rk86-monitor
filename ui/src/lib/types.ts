export type CodeLine = {
  line: number;
  label?: string;
  op?: string;
  arg1?: string;
  arg2?: string;
  data?: string;
  addr?: string;
  bytes?: string;
  chars?: string;
  comment?: string;
};

export type Listing = {
  code: CodeLine[];
  symbols: Record<string, string>;
  map: { sections: { start: string; end: string; size: number }[]; total: number };
};

export type Token =
  | { kind: 'text'; text: string }
  | { kind: 'mnemonic'; text: string }
  | { kind: 'directive'; text: string }
  | { kind: 'reg'; text: string }
  | { kind: 'num'; text: string }
  | { kind: 'str'; text: string }
  | { kind: 'label-ref'; text: string; addr: string }
  | { kind: 'punct'; text: string };
