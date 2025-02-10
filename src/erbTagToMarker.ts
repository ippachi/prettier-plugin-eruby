const erbTagToMarker = (text: string) => {
  if (isEndTag(text)) {
    return `<erb-end>`
  } else if (isIfTag(text) || isBlockTag(text)) {
    return `<erb data-eruby-content="${encodeURIComponent(text)}">`
  } else {
    return `<erb data-eruby-content="${encodeURIComponent(text)}" />`
  }
};

const isEndTag = (text: string) => {
  return text.match(/<%\s*end\s*%>/);
}

const isBlockTag = (text: string) => {
  return text.match(/do\s*%>$/);
}

const isIfTag = (text: string) => {
  return text.match(/<%(=|\-)?\s*if\s/);
}

export default erbTagToMarker;

<div>
  <% if hoge %>
    hoge
  <% elsif fuga %>
    fuga
  <% end %>
</div>

<div>
  <erb-if>
    hoge
  </erb-if>
  <erb-elsif>
    fugal
  </erb>
</div>
