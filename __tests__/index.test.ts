import {expect, test} from '@jest/globals';
import * as prettier from "prettier"
import erubyParse from "../index"

test("format html", async () => {
  const code =
`<DIV>test</DIV>
`
  const result = await prettier.format(code, { parser: "eruby-parse", plugins: [erubyParse] })
  expect(result).toBe(
`<div>test</div>
`
  )
})
