// Maps common LLM-generated shorthand and alias names to the canonical
// language values used by the editor (src/renderer/components/editor/grammars/languages.ts).
const LANGUAGE_ALIASES: Record<string, string> = {
  // Go
  'go': 'golang',
  // JavaScript / TypeScript
  'js': 'javascript',
  'ts': 'typescript',
  'jsx': 'javascript',
  'tsx': 'typescript',
  // Python
  'py': 'python',
  // Ruby
  'rb': 'ruby',
  // Rust
  'rs': 'rust',
  // C / C++
  'c': 'c_cpp',
  'cpp': 'c_cpp',
  'c++': 'c_cpp',
  'cc': 'c_cpp',
  // C#
  'cs': 'csharp',
  'c#': 'csharp',
  // Shell
  'bash': 'sh',
  'shell': 'sh',
  'zsh': 'sh',
  'bat': 'sh',
  // Markup / data
  'md': 'markdown',
  'yml': 'yaml',
  // GraphQL
  'graphql': 'graphqlschema',
  'gql': 'graphqlschema',
  // Misc aliases (matches oldLanguageMap in renderer)
  'coffeescript': 'coffee',
  'objective-c': 'objectivec',
  'objc': 'objectivec',
  'pug': 'jade',
  'vb': 'vbscript',
}

export function normalizeLanguage(lang: string): string {
  const key = lang.trim().toLowerCase()
  return LANGUAGE_ALIASES[key] ?? key
}
