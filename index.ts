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
  private erbTags: Record<number, ErbTag>

  constructor() {
    this.erbTags = {}
    this.astFormat = "eruby-ast"
  }

  async parse(text: string, options: ParserOptions): Promise<AST> {
    this.erbTags = {}

    // The reason for reverse() is that the index is broken when replacing
    const reverseMatchResults = Array.from(text.matchAll(/([^\S\r\n]*)<%[\s\n]*[\s\S]*?[\s\n]*%>/gm)).reverse()
    reverseMatchResults.forEach((currentMatchResult, i) => {
      this.erbTags[i] = (this.erbTagFromMatchResult(currentMatchResult))
    })
    const replacedText = reverseMatchResults.reduce(this.replaceErbTagToMark, text)
    return await prettier.format(replacedText, { parser: "html" })
  }

  locStart(node: object): number {
    return 0;
  }

  locEnd(node: object): number {
    return 0;
  }

  print(path: AstPath, options: object, print: (selector: AstPath<any>) => Doc): Doc {
    let result = path.getNode() as string;
    for (const [id, erbTag] of Object.entries(this.erbTags)) {
      const markMatchResult = result.match(new RegExp(`([^\S\r\n]*)(?=<erb data-id="${id}" />)`))
      assert(markMatchResult)
      result = result.replace(new RegExp(`[^\S\r\n]*<erb data-id="${id}" />`), erbTag.indentedContent(markMatchResult[1]))
    }
    return result;
  }

  private replaceErbTagToMark(text: string, matchResult: RegExpMatchArray, id: number) {
    assert(typeof matchResult.index == "number")
    return text.substring(0, matchResult.index) +
      `<erb data-id="${id}" />` +
      text.substring(matchResult.index + matchResult[0].length)
  }

  private erbTagFromMatchResult(matchResult: RegExpMatchArray) {
    assert(typeof matchResult.index == "number")
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
