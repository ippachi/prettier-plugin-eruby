import {AST, AstPath, Doc, ParserOptions} from "prettier"
import * as prettier from "prettier"

const languages = [
  {
    name: "eRuby",
    parsers: ["eruby-parse"]
  }
]

class ErbPrettierPlugin {
  public astFormat: string
  private matchResult: RegExpMatchArray | null

  constructor() {
    this.matchResult = null
    this.astFormat = "eruby-ast"
  }

  async parse(text: string, options: ParserOptions): Promise<AST> {
    this.matchResult = text.match(/<%([\s\n]*?).*([\s\n]*?)%>/)
    const targetText = this.replaceErbElementToMarker(text, this.matchResult)
    return await prettier.format(targetText, { parser: "html" })
  }

  locStart(node: object): number {
    return 0;
  }

  locEnd(node: object): number {
    return 0;
  }

  print(path: AstPath, options: object, print: (selector: AstPath<any>) => Doc): Doc {
    let result = path.getNode()
    result = result.replace(/<erb \/>/, this.matchResult?.[0])
    return result;
  }

  private replaceErbElementToMarker(originalText: string, matchResult: RegExpMatchArray | null): string {
    if (matchResult?.index !== undefined) {
      return originalText.substring(0, matchResult.index) +
        '<erb />' +
        originalText.substring(matchResult.index + matchResult[0].length)
    }
    return originalText
  }
}

const erbPrettierPlugin = new ErbPrettierPlugin()

const parsers = {
  "eruby-parse": erbPrettierPlugin
}

const printers = {
  "eruby-ast": erbPrettierPlugin
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
