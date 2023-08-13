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

  replaceErbElementToTag(text: string) {
    return text.substring(0, this.#originalPositionIndex) +
      this.#erbTag +
      text.substring(this.#originalPositionIndex + this.#originalContentLength)
  }

  replaceErbTagToElement(text: string) {
    const markMatchResult = text.match(this.#originalContentRegExp)
    assert(markMatchResult)
    return text.replace(this.#originalContentRegExp, this.#indentedContent(markMatchResult[1]))
  }

  get #originalContentRegExp() { return new RegExp(`([^\\S\\r\\n]*)(${this.#erbTag})`) }
  get #originalPositionIndex() { return this.#matchResult.index as number }
  get #originalContentLength() { return this.#matchResult[0].length }
  get #erbTag() { return `<erb-${this.#tagId} />` }

  #indentedContent(spaces: string) {
    const HeadWhitespaceRemovedContent = this.#matchResult[0]
                                             .split("\n")
                                             .map((line) => line.replace(new RegExp(`^${this.#matchResult[1]}`), ""))
                                             .join("\n")
    return HeadWhitespaceRemovedContent.split("\n").map((line) => `${spaces}${line}`).join("\n")
  }
}

class ErbPrettierPlugin {
  astFormat: string
  #erbElements: ErbElement[]

  constructor() {
    this.#erbElements = []
    this.astFormat = "eruby-ast"
  }

  async parse(text: string, options: ParserOptions): Promise<AST> {
    this.#erbElements = []

    // The reason for reverse() is that the index is broken when replacing
    const reverseMatchResults = Array.from(text.matchAll(/([^\S\r\n]*)<%[\s\n]*.*?[\s\n]*%>/gs)).reverse()
    reverseMatchResults.forEach((currentMatchResult, i) => {
      this.#erbElements.push(new ErbElement(i, currentMatchResult))
    })
    const replacedText = this.#erbElements.reduce((acc, erbElement) => erbElement.replaceErbElementToTag(acc), text)
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
    return this.#erbElements.reduce((acc, erbElement) => erbElement.replaceErbTagToElement(acc), result)
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
