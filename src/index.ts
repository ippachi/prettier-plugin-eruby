import { AstPath, ParserOptions } from "prettier";
import * as prettier from "prettier";
import erbTagToMarker from "./erbTagToMarker";
import markerToErbTag from "./markerToErbTag";

export const languages = [
  {
    name: "eRuby",
    parsers: ["eruby-parse"],
    extensions: [".html.erb"],
  },
];

export const parsers = {
  "eruby-parse": {
    parse(text: string, options: object): Promise<prettier.AST> | prettier.AST {
      const erbTagMatchResults = Array.from(text.matchAll(/<%(.*?)%>/gs)).reverse();
      const replacedText = erbTagMatchResults.reduce((acc, match) => {
        return replaceText({
          original: acc,
          replace: erbTagToMarker(match[0]),
          from: match.index!,
          to: match[0].length,
        });
      }, text);
      return prettier.format(replacedText, { parser: "html" });
    },
    astFormat: "eruby-ast",
    locStart(node: object): number {
      return 0;
    },
    locEnd(node: object): number {
      return 0;
    },
  },
};

export const printers = {
  "eruby-ast": {
    print: function (path: AstPath, options: object) {
      const markerMatchResults = Array.from<RegExpMatchArray>(
        path.node.matchAll(/( *)?(<erb data-eruby-content.*?\/>)/g),
      ).reverse();
      const result = markerMatchResults.reduce((acc, match) => {
        const indent = match[1];
        const marker = match[2];
        return replaceText({
          original: acc,
          replace: markerToErbTag(marker, { indent }),
          from: indent.length + match.index!,
          to: marker.length,
        });
      }, path.node);
      return result;
    },
  },
};

const replaceText = ({
  original,
  replace,
  from,
  to,
}: {
  original: string;
  replace: string;
  from: number;
  to: number;
}) => {
  return original.substring(0, from) + replace + original.substring(from + to);
};

export const options = {};
export const defaultOptions = {};
