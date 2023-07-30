import {AST, AstPath, Doc} from "prettier"

const languages = [
  {
    name: "eRuby",
    parsers: ["eruby-parse"]
  }
]

function parse(text: string, options: object): Promise<AST> | AST {
  return text;
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
  console.log(path)
  return(
`console.log(1)
`
  )
}

const printers = {
  "eruby-ast": {
    print
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
