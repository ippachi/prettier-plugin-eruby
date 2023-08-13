import {AST, AstPath, Doc, ParserOptions} from "prettier"
import * as prettier from "prettier"
import assert from "assert"

const languages = [
  {
    name: "eRuby",
    parsers: ["eruby-parse"]
  }
]

class ErbElement {
  #tagId: number
  #matchResult: RegExpMatchArray

  constructor(tagId: number, matchResult: RegExpMatchArray) {
    this.#tagId = tagId
    this.#matchResult = matchResult
  }

  indentedContent(spaces: string) {
    return this.#content.split("\n").map((line) => `${spaces}${line}`).join("\n")
  }

  get #content() {
    return this.#matchResult[0]
               .split("\n")
               .map((line) => line.replace(new RegExp(`^${this.#matchResult[1]}`), ""))
               .join("\n")
  }
}

class ErbPrettierPlugin {
  astFormat: string
  #erbElements: Record<number, ErbElement>

  constructor() {
    this.#erbElements = {}
    this.astFormat = "eruby-ast"
  }

  async parse(text: string, options: ParserOptions): Promise<AST> {
    this.#erbElements = {}

    // The reason for reverse() is that the index is broken when replacing
    const reverseMatchResults = Array.from(text.matchAll(/([^\S\r\n]*)<%[\s\n]*.*?[\s\n]*%>/gs)).reverse()
    reverseMatchResults.forEach((currentMatchResult, i) => {
      this.#erbElements[i] = new ErbElement(i, currentMatchResult)
    })
    const replacedText = reverseMatchResults.reduce(this.#replaceErbElementToMark.bind(this), text)
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
    for (const [id, erbElement] of Object.entries(this.#erbElements)) {
      const markMatchResult = result.match(new RegExp(`([^\S\r\n]*)(?=${this.#erbTag(id)})`))
      assert(markMatchResult)
      result = result.replace(new RegExp(`[^\S\r\n]*${this.#erbTag(id)}`), erbElement.indentedContent(markMatchResult[1]))
    }
    return result;
  }

  #replaceErbElementToMark(text: string, matchResult: RegExpMatchArray, id: number) {
    assert(typeof matchResult.index == "number")
    return text.substring(0, matchResult.index) +
      this.#erbTag(id) +
      text.substring(matchResult.index + matchResult[0].length)
  }

  #erbTag(id: number | string) { return `<erb-${id} />` }
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
