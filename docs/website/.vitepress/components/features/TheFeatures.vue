<script setup lang="ts">
import FeaturesItem from './FeaturesItem.vue'
</script>

<template>
  <div class="spaces">
    <FeaturesItem title="Code Snippets">
      Build a reusable code library across projects and languages. Organize
      snippets with folders, tags, and fragments, then edit them with
      <AppLink href="https://github.com/codemirror/codemirror5">
        CodeMirror
      </AppLink>
      , format them with
      <AppLink href="https://prettier.io">
        Prettier
      </AppLink>
      , preview HTML & CSS in real time, inspect JSON visually, and export
      polished screenshots when you need to share code.
    </FeaturesItem>
    <FeaturesItem title="AI / MCP Server">
      Search your snippet library with natural language from any MCP-compatible
      client — Claude Desktop, Cursor, Claude Code, Zed, and more. A built-in
      MCP server exposes semantic RAG search and snippet creation, powered by a
      local embedding model with zero API keys required.
    </FeaturesItem>
  </div>
  <div class="extras">
    <FeaturesItem title="Open & Local">
      Keep your data on your machine and in your control. Snippets are stored as
      plain Markdown files with YAML frontmatter, so syncing with iCloud,
      Dropbox, or Git stays simple and portable.
    </FeaturesItem>
    <FeaturesItem title="Localization">
      Use ahaCode in the language you are most comfortable with. The app is
      available in 15 languages, including English, Deutsch, Español, Français,
      Русский, 日本語, and 中文.
    </FeaturesItem>
    <FeaturesItem title="Custom Themes">
      Adapt ahaCode to your taste with full UI and editor syntax themes. Themes
      are stored as JSON files and hot-reload on change — create a new theme from
      Settings or drop one into the themes directory.
    </FeaturesItem>
  </div>
</template>

<style scoped>
.spaces {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 24px 0 8px;
}

.extras {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 8px 0 24px;
}

@media (min-width: 768px) {
  .spaces {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
    padding: 24px 0 12px;
  }

  .extras {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
    padding: 12px 0 24px;
  }
}
</style>
