import {expect, test} from '@jest/globals';
import * as prettier from "prettier"
import erubyParse from "../index"

test("format invalid indent single line <% %>", async () => {
  const code =
`<DIV>
  test
      <% test %>
</DIV>
`
  const result = await prettier.format(code, { parser: "eruby-parse", plugins: [erubyParse] })
  expect(result).toBe(
`<div>
  test
  <% test %>
</div>
`
  )
})

test("format invalid indent multi line <% %>", async () => {
  const code =
`<DIV>
  test
      <%
        test1
        test2
      %>
</DIV>
`
  const result = await prettier.format(code, { parser: "eruby-parse", plugins: [erubyParse] })
  expect(result).toBe(
`<div>
  test
  <%
    test1
    test2
  %>
</div>
`
  )
})
