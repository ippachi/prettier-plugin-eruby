import { AST, AstPath, Doc, ParserOptions } from "prettier";
import * as prettier from "prettier";
import assert from "assert";

class ErbElement {
  tagId: number = -1;
  #matchResult: RegExpMatchArray;

  constructor(matchResult: RegExpMatchArray) {
    this.#matchResult = matchResult;
  }

  replaceErbElementToTag(text: string) {
    return (
      text.substring(0, this.#originalPositionIndex) +
      this.#erbTag +
      text.substring(this.#originalPositionIndex + this.#originalContentLength)
    );
  }

  replaceErbTagToElement(text: string) {
    const markMatchResult = text.match(this.#originalContentRegExp);
    assert(markMatchResult);
    return text.replace(this.#originalContentRegExp, this.#indentedContent(markMatchResult[1]));
  }

  get #originalContentRegExp() {
    let erbTagRegExp = this.isOpenTag
      ? `<${"erb".repeat(100)}-${this.tagId}\\s*>`
      : this.isCloseTag
      ? `</${"erb".repeat(100)}-${this.tagId}\\s*>`
      : `<erb-${this.tagId}\\s*/>`;
    return new RegExp(`([^\\S\\r\\n]*)(${erbTagRegExp})`);
  }
  get #originalPositionIndex() {
    return this.#matchResult.index as number;
  }
  get #originalContentLength() {
    return this.#matchResult[0].length;
  }

  get #erbTag() {
    // Open and Close tag must break line
    switch (true) {
      case this.isOpenTag:
        return `<${"erb".repeat(100)}-${this.tagId}>\n`;
      case this.isCloseTag:
        return `\n</${"erb".repeat(100)}-${this.tagId}>`;
      default:
        return `<erb-${this.tagId} />`;
    }
  }

  #indentedContent(spaces: string) {
    const HeadWhitespaceRemovedContent = this.#matchResult[0]
      .split("\n")
      .map((line) => line.replace(new RegExp(`^${this.#matchResult[1]}`), ""))
      .join("\n");
    return HeadWhitespaceRemovedContent.split("\n")
      .map((line) => `${spaces}${line}`)
      .join("\n");
  }

  // duplicate code
  get isOpenTag() {
    return /\s*do\s*(\|\s*.*\s*\|\s*)?%>/.test(this.#indentedContent(""));
  }
  get isCloseTag() {
    return /<%\s*end\s*%>/.test(this.#indentedContent(""));
  }
}

class ErbPrettierPlugin {
  astFormat: string;
  #erbElements: ErbElement[];

  constructor() {
    this.#erbElements = [];
    this.astFormat = "eruby-ast";
  }

  async parse(text: string, options: any): Promise<AST> {
    this.#erbElements = [];

    // The reason for reverse() is that the index is broken when replacing
    const reverseMatchResults = Array.from(
      text.matchAll(/([^\S\r\n]*)<%[\s\n]*.*?[\s\n]*%>/gs),
    ).reverse();
    const endTagIds: number[] = [];

    reverseMatchResults.forEach((currentMatchResult, i) => {
      const erbElement = new ErbElement(currentMatchResult);
      if (erbElement.isCloseTag) {
        erbElement.tagId = i;
        endTagIds.push(erbElement.tagId);
      } else if (erbElement.isOpenTag) {
        const endTagId = endTagIds.pop();
        assert(endTagId !== undefined);
        erbElement.tagId = endTagId;
      } else {
        erbElement.tagId = i;
      }
      this.#erbElements.push(erbElement);
    });

    const replacedText = this.#erbElements.reduce(
      (acc, erbElement) => erbElement.replaceErbElementToTag(acc),
      text,
    );
    // TODO: The rangeEnd is useless because it forces a line break by repeating erb 100 times
    const {
      rangeEnd: {},
      ...htmlOptions
    } = options;
    return await prettier.format(replacedText, { ...htmlOptions, parser: "html" });
  }

  locStart(node: object): number {
    return 0;
  }

  locEnd(node: object): number {
    return 0;
  }

  print(path: AstPath, options: object, print: (selector: AstPath<any>) => Doc): Doc {
    let result = path.getNode() as string;
    return this.#erbElements.reduce(
      (acc, erbElement) => erbElement.replaceErbTagToElement(acc),
      result,
    );
  }
}
export const languages = [
  {
    name: "eRuby",
    parsers: ["eruby-parse"],
    extensions: [".html.erb"],
  },
];

export const erbPrettierPlugin = new ErbPrettierPlugin();

export const parsers = {
  "eruby-parse": erbPrettierPlugin,
};

export const printers = {
  "eruby-ast": erbPrettierPlugin,
};

export const options = {};
export const defaultOptions = {};
