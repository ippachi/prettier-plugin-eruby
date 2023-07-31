import {AST, AstPath, Doc, ParserOptions} from "prettier"
import * as prettier from "prettier"

const languages = [
  {
    name: "eRuby",
    parsers: ["eruby-parse"]
  }
]

async function parse(text: string, options: ParserOptions): Promise<AST> {
  return await prettier.format(text, { parser: "html" })
}

function locStart(node: object): number {
  return 0;
}

function locEnd(node: object): number {
  return 0;
}

const parsers = {
  "eruby-parse": {
    parse,
    astFormat: "eruby-ast",
    locStart,
    locEnd
  }
}

function print(path: AstPath, options: object, print: (selector: AstPath<any>) => Doc): Doc {
  return path.getNode();
}

const printers = {
  "eruby-ast": {
    print,
  }
}

const options = {}
const defaultOptions = {}

export default {
  languages,
  parsers,
  printers,
  options,
  defaultOptions
}
