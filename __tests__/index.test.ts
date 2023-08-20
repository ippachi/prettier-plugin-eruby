import { expect, test } from "@jest/globals";
import * as prettier from "prettier";
import * as erubyParse from "../index";

test("format multiple erb elements", async () => {
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
`;
  const result = await prettier.format(code, { parser: "eruby-parse", plugins: [erubyParse] });
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
`,
  );
});

test("format block", async () => {
  const code =
`  <%= form_with test do %>
test
                  <%= link_to test do %> link <% end %>
      <% end %>
`;
  const result = await prettier.format(code, { parser: "eruby-parse", plugins: [erubyParse] });
  expect(result).toBe(
`<%= form_with test do %>
  test
  <%= link_to test do %>
    link
  <% end %>
<% end %>
`,
  );
});

test("support options", async () => {
  const code =
`  <%= form_with test do %>
test
                  <%= link_to test do %> link <% end %>
      <% end %>
`;
  const result = await prettier.format(code, {
    parser: "eruby-parse",
    plugins: [erubyParse],
    tabWidth: 4,
  });
  expect(result).toBe(
`<%= form_with test do %>
    test
    <%= link_to test do %>
        link
    <% end %>
<% end %>
`,
  );
});

test("replace tag", async () => {
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
`;
  const erbText = new erubyParse.ErbText(code)
  erbText.replaceErbTagToMarker()
  expect(erbText.markerText).toEqual(
`<DIV>
  test
  <erb3 />
    <erb2 />
<erb1 />
</DIV>
`
  );
});

test("retain tag content", async () => {
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
`;
  const erbText = new erubyParse.ErbText(code)
  erbText.replaceErbTagToMarker()
  expect(erbText.markerContents).toEqual(
    {
      "<erb1 />": "<%=\n  test3\n  test4\n%>",
      "<erb2 />": "<%= test2 %>",
      "<erb3 />": "<% test1 %>",
    }
  );
});

test("replace nested erb", async () => {
  const code =
`<DIV>
  test
  <% hoge(class: "<%= test %>") %>
    <%= test2 %>
<%=
  test3
  test4
%>
</DIV>
`;
  const erbText = new erubyParse.ErbText(code)
  erbText.replaceErbTagToMarker()
  expect(erbText.markerContents).toEqual(
    {
      "<erb1 />": "<%=\n  test3\n  test4\n%>",
      "<erb2 />": "<%= test2 %>",
      "<erb3 />": '<% hoge(class: "<%= test %>") %>',
    }
  );
});
