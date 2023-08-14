# Prettier eRuby plugin

## Overview
This plugin is designed to recognize html.erb files as html and format them as html.
So it currently does **not** support formatting ruby code.

## Installation & Configuration

```bash
yarn add -D prettier-eruby-plugin
```

```yaml
{
  "plugins": ["prettier-plugin-eruby"],
  "overrides": [
    {
      "files": "*.html.erb",
      "options": {
        "parser": "eruby-parse"
      }
    }
  ]
}
```
