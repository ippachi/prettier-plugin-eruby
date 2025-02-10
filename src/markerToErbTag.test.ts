import { expect, test } from "@jest/globals";
import markerToErbTag from "./markerToErbTag";
import erbTagToMarker from "./erbTagToMarker";

test("marker to erb tag", () => {
  expect(markerToErbTag(erbTagToMarker("<% test %>"), { indent: "" })).toEqual("<% test %>");
});

test("marker to erb tag with indent", () => {
  const marker = erbTagToMarker(
    "<%\n" +
    "  test\n" +
    "%>"
  );
  const result =
    "<div>\n" +
    `  ${markerToErbTag(marker, { indent: "  " })}\n` +
    "</div>"
  expect(result).toEqual(
    "<div>\n" +
    "  <%\n" +
    "    test\n" +
    "  %>\n" +
    "</div>"
  );
});
