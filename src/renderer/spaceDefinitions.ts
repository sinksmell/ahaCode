import type { Component } from 'vue'
import type { RouteLocationRaw, RouteRecordName } from 'vue-router'
import { i18n } from '@/electron'
import { router, RouterName } from '@/router'
import { Code2 } from 'lucide-vue-next'

export type SpaceId = 'code'

export interface SpaceDefinition {
  id: SpaceId
  label: string
  tooltip: string
  icon: Component
  to: RouteLocationRaw
  isActive: (routeName: RouteRecordName | null | undefined) => boolean
}

export function getSpaceDefinitions(): SpaceDefinition[] {
  return [
    {
      id: 'code',
      label: i18n.t('spaces.code.label'),
      tooltip: i18n.t('spaces.code.tooltip'),
      icon: Code2,
      to: { name: RouterName.main },
      isActive: routeName => routeName === RouterName.main,
    },
  ]
}

export function isSpaceRouteName(
  routeName: RouteRecordName | null | undefined,
) {
  return getSpaceDefinitions().some(space => space.isActive(routeName))
}

export function getActiveSpaceId(): SpaceId | null {
  const routeName = router.currentRoute.value.name
  const space = getSpaceDefinitions().find(s => s.isActive(routeName))
  return space?.id ?? null
}
