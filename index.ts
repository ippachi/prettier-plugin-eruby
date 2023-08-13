import {AST, AstPath, Doc, ParserOptions} from "prettier"
import * as prettier from "prettier"
import assert from "assert"

const languages = [
  {
    name: "eRuby",
    parsers: ["eruby-parse"]
  }
]

class ErbTag {
  private content: string

  constructor(content: string) {
    this.content = content
  }

  indentedContent(spaces: string) {
    return this.content.split("\n").map((line) => `${spaces}${line}`).join("\n")
  }
}

class ErbPrettierPlugin {
  public astFormat: string
  private erbTag: ErbTag | null

  constructor() {
    this.erbTag = null
    this.astFormat = "eruby-ast"
  }

  async parse(text: string, options: ParserOptions): Promise<AST> {
    const matchResult = text.match(/([^\S\r\n]*)<%[\s\n]*[\s\S]*[\s\n]*%>/m)
    if (matchResult === null) return await prettier.format(text, { parser: "html" })

    assert(matchResult.index);
    this.erbTag = this.erbTagFromMatchResult(matchResult)
    return await prettier.format(this.replaceErbTagToMark(text, matchResult), { parser: "html" })
  }

  locStart(node: object): number {
    return 0;
  }

  locEnd(node: object): number {
    return 0;
  }

  print(path: AstPath, options: object, print: (selector: AstPath<any>) => Doc): Doc {
    let result = path.getNode() as string;
    const markMatchResult = result.match(/([^\S\r\n]*)(?=<erb \/>)/)
    if (markMatchResult) {
      assert(this.erbTag)
      result = result.replace(/[^\S\r\n]*<erb \/>/, this.erbTag.indentedContent(markMatchResult[1]))
    }
    return result;
  }

  private replaceErbTagToMark(text: string, matchResult: RegExpMatchArray) {
    assert(matchResult.index)
    return text.substring(0, matchResult.index) +
      '<erb />' +
      text.substring(matchResult.index + matchResult[0].length)
  }

  private erbTagFromMatchResult(matchResult: RegExpMatchArray) {
    assert(matchResult.index)
    const content =
      matchResult[0].split("\n").map((line) => line.replace(new RegExp(`^${matchResult[1]}`), "")).join("\n")
    return new ErbTag(content)
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
