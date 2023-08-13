import {expect, test} from '@jest/globals';
import * as prettier from "prettier"
import erubyParse from "../index"

test("format multiple erb tags", async () => {
  const code =
`<DIV>
  test
  <% test1 %>
    <%= test2 %>
<%=
  test3
  test4
%>
</DIV>
`
  const result = await prettier.format(code, { parser: "eruby-parse", plugins: [erubyParse] })
  expect(result).toBe(
`<div>
  test
  <% test1 %>
  <%= test2 %>
  <%=
    test3
    test4
  %>
</div>
`
  )
})
