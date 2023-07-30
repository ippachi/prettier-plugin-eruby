import {expect, test} from '@jest/globals';
import * as prettier from "prettier"
import erubyParse from "../index"

test("Check", async () => {
  const code =
`console.log(1)
`
  const result = await prettier.format(code, { parser: "eruby-parse", plugins: [erubyParse] })
  expect(result).toBe(
`console.log(1)
`
  )
})
