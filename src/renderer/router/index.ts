import { createRouter, createWebHashHistory } from 'vue-router'

export const RouterName = {
  main: 'main',
  preferences: 'preferences',
  preferencesStorage: 'preferences/storage',
  preferencesLanguage: 'preferences/language',
  preferencesAppearance: 'preferences/appearance',
  preferencesEditor: 'preferences/editor',
  preferencesNotesEditor: 'preferences/notes-editor',
  preferencesMath: 'preferences/math',
  preferencesAPI: 'preferences/api',
  devtools: 'devtools',
  devtoolsCaseConverter: 'devtools/case-converter',
  devtoolsTextToUnicode: 'devtools/text-to-unicode',
  devtoolsTextToAscii: 'devtools/text-to-ascii',
  devtoolsBase64Converter: 'devtools/base64-converter',
  devtoolsJsonToYaml: 'devtools/json-to-yaml',
  devtoolsJsonToToml: 'devtools/json-to-toml',
  devtoolsJsonToXml: 'devtools/json-to-xml',
  devtoolsHash: 'devtools/hash',
  devtoolsHmac: 'devtools/hmac',
  devtoolsPassword: 'devtools/password',
  devtoolsUuid: 'devtools/uuid',
  devtoolsUrlParser: 'devtools/url-parser',
  devtoolsSlugify: 'devtools/slugify',
  devtoolsUrlEncoder: 'devtools/url-encoder',
  devtoolsColorConverter: 'devtools/color-converter',
  devtoolsJsonGenerator: 'devtools/json-generator',
  devtoolsLoremIpsumGenerator: 'devtools/lorem-ipsum-generator',
  devtoolsJsonDiff: 'devtools/json-diff',
  mathNotebook: 'math-notebook',
  notesSpace: 'notes-space',
  notesDashboard: 'notes-space/dashboard',
  notesGraph: 'notes-space/graph',
  notesPresentation: 'notes-space/presentation',
} as const

const routes = [
  {
    path: '/',
    name: RouterName.main,
    component: () => import('@/views/Main.vue'),
  },
  {
    path: '/preferences',
    name: RouterName.preferences,
    component: () => import('@/views/Preferences.vue'),
    redirect: () => {
      const saved = sessionStorage.getItem('preferences:lastRoute')
      return { name: saved || RouterName.preferencesStorage }
    },
    children: [
      {
        path: 'storage',
        name: RouterName.preferencesStorage,
        component: () => import('@/components/preferences/Storage.vue'),
      },
      {
        path: 'language',
        name: RouterName.preferencesLanguage,
        component: () => import('@/components/preferences/Language.vue'),
      },
      {
        path: 'appearance',
        name: RouterName.preferencesAppearance,
        component: () => import('@/components/preferences/Appearance.vue'),
      },
      {
        path: 'editor',
        name: RouterName.preferencesEditor,
        component: () => import('@/components/preferences/Editor.vue'),
      },
      {
        path: 'notes-editor',
        name: RouterName.preferencesNotesEditor,
        component: () => import('@/components/preferences/NotesEditor.vue'),
      },
      {
        path: 'math',
        name: RouterName.preferencesMath,
        component: () => import('@/components/preferences/Math.vue'),
      },
      {
        path: 'api',
        name: RouterName.preferencesAPI,
        component: () => import('@/components/preferences/API.vue'),
      },
    ],
  },
  {
    path: '/devtools',
    name: RouterName.devtools,
    redirect: { name: RouterName.main },
  },
  {
    path: '/math-notebook',
    name: RouterName.mathNotebook,
    redirect: { name: RouterName.main },
  },
  {
    path: '/notes',
    name: RouterName.notesSpace,
    redirect: { name: RouterName.main },
    children: [
      {
        path: 'dashboard',
        name: RouterName.notesDashboard,
        redirect: { name: RouterName.main },
      },
      {
        path: 'graph',
        name: RouterName.notesGraph,
        redirect: { name: RouterName.main },
      },
    ],
  },
  {
    path: '/notes/presentation',
    name: RouterName.notesPresentation,
    redirect: { name: RouterName.main },
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
