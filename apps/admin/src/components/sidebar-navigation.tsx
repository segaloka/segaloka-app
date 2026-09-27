'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  type ComponentType,
  type SVGProps,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  adminModuleGroups,
  type AdminModule,
  type AdminModuleGroup,
  type AdminModuleIcon
} from '@/config/admin-modules';
import { localizeModuleLabel } from '@/i18n/module-labels';

import { useAppPreferences } from './app-provider';
import {
  BagIcon,
  BuildingIcon,
  CalendarIcon,
  ChartIcon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  GlobeIcon,
  GridIcon,
  LayersIcon,
  LinkIcon,
  MegaphoneIcon,
  MessageIcon,
  SettingsIcon,
  ShieldIcon,
  SparkIcon,
  StoreIcon,
  UserRoundIcon,
  UsersIcon,
  WalletIcon
} from './icons';

type NavigationIcon = ComponentType<SVGProps<SVGSVGElement>>;

const iconMap: Record<AdminModuleIcon, NavigationIcon> = {
  overview: GridIcon,
  approval: ClipboardCheckIcon,
  travel: BuildingIcon,
  vendor: StoreIcon,
  affiliate: LinkIcon,
  agent: UsersIcon,
  partner: UsersIcon,
  customer: UserRoundIcon,
  traveler: UserRoundIcon,
  marketplace: BagIcon,
  omnichannel: MessageIcon,
  ads: MegaphoneIcon,
  booking: CalendarIcon,
  operations: LayersIcon,
  finance: WalletIcon,
  subscription: GlobeIcon,
  platform: SparkIcon,
  security: ShieldIcon,
  analytics: ChartIcon,
  system: SettingsIcon
};

function pathMatches(
  href: string | undefined,
  pathname: string
): boolean {
  if (!href) {
    return false;
  }

  if (href === '/') {
    return pathname === '/';
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

function moduleContainsPath(
  module: AdminModule,
  pathname: string
): boolean {
  if (pathMatches(module.href, pathname)) {
    return true;
  }

  return (
    module.children?.some((child) =>
      pathMatches(child.href, pathname)
    ) ?? false
  );
}

function groupContainsPath(
  group: AdminModuleGroup,
  pathname: string
): boolean {
  return group.modules.some((module) =>
    moduleContainsPath(module, pathname)
  );
}

export function SidebarNavigation() {
  const pathname = usePathname();
  const { locale } = useAppPreferences();

  const initialExpandedGroups = useMemo(
    () =>
      adminModuleGroups.reduce<Record<string, boolean>>(
        (state, group) => {
          state[group.id] =
            group.id === 'main' ||
            groupContainsPath(group, pathname);

          return state;
        },
        {}
      ),
    [pathname]
  );

  const initialExpandedModules = useMemo(
    () =>
      adminModuleGroups.reduce<Record<string, boolean>>(
        (state, group) => {
          for (const module of group.modules) {
            state[module.id] = moduleContainsPath(
              module,
              pathname
            );
          }

          return state;
        },
        {}
      ),
    [pathname]
  );

  const [expandedGroups, setExpandedGroups] =
    useState<Record<string, boolean>>(initialExpandedGroups);

  const [expandedModules, setExpandedModules] =
    useState<Record<string, boolean>>(initialExpandedModules);

  useEffect(() => {
    const matchingGroup = adminModuleGroups.find((group) =>
      groupContainsPath(group, pathname)
    );

    if (matchingGroup) {
      setExpandedGroups((current) => ({
        ...current,
        [matchingGroup.id]: true
      }));
    }

    const matchingModule = adminModuleGroups
      .flatMap((group) => group.modules)
      .find((module) =>
        moduleContainsPath(module, pathname)
      );

    if (
      matchingModule &&
      matchingModule.children?.length
    ) {
      setExpandedModules((current) => ({
        ...current,
        [matchingModule.id]: true
      }));
    }
  }, [pathname]);

  function toggleGroup(groupId: string) {
    setExpandedGroups((current) => ({
      ...current,
      [groupId]: !current[groupId]
    }));
  }

  function toggleModule(moduleId: string) {
    setExpandedModules((current) => ({
      ...current,
      [moduleId]: !current[moduleId]
    }));
  }

  return (
    <nav
      aria-label="Main navigation"
      className="sidebar-navigation"
    >
      {adminModuleGroups.map((group) => {
        const expanded =
          expandedGroups[group.id] ?? false;

        const groupLabel = localizeModuleLabel(
          locale,
          group.label
        );

        return (
          <section
            className="sidebar-module-group"
            key={group.id}
          >
            <button
              aria-expanded={expanded}
              className="sidebar-group-trigger"
              onClick={() => toggleGroup(group.id)}
              type="button"
            >
              <span className="sidebar-group-label">
                {groupLabel}
              </span>

              <ChevronDownIcon
                className={
                  expanded
                    ? 'sidebar-group-chevron is-open'
                    : 'sidebar-group-chevron'
                }
              />
            </button>

            {expanded ? (
              <div className="sidebar-module-items">
                {group.modules.map((module) => {
                  const active =
                    moduleContainsPath(
                      module,
                      pathname
                    );

                  const moduleLabel =
                    localizeModuleLabel(
                      locale,
                      module.label
                    );

                  const Icon = iconMap[module.icon];

                  const hasChildren =
                    Boolean(module.children?.length);

                  const moduleExpanded =
                    expandedModules[module.id] ?? false;

                  const moduleClassName = [
                    'sidebar-module-item',
                    active ? 'is-active' : '',
                    module.status === 'planned'
                      ? 'is-planned'
                      : '',
                    hasChildren
                      ? 'has-children'
                      : ''
                  ]
                    .filter(Boolean)
                    .join(' ');

                  const moduleContent = (
                    <>
                      <span className="sidebar-module-icon">
                        <Icon />
                      </span>

                      <span className="sidebar-module-label">
                        {moduleLabel}
                      </span>

                      {module.badge ? (
                        <span className="nav-badge">
                          {module.badge}
                        </span>
                      ) : null}

                      {hasChildren ? (
                        <ChevronDownIcon
                          className={
                            moduleExpanded
                              ? 'sidebar-module-chevron is-open'
                              : 'sidebar-module-chevron'
                          }
                        />
                      ) : null}
                    </>
                  );

                  return (
                    <div
                      className="sidebar-module-node"
                      key={module.id}
                    >
                      <div className="sidebar-module-row">
                        {module.href ? (
                          <Link
                            className={moduleClassName}
                            href={module.href}
                          >
                            {moduleContent}
                          </Link>
                        ) : (
                          <button
                            aria-disabled={
                              module.status === 'planned' &&
                              !hasChildren
                                ? 'true'
                                : undefined
                            }
                            className={moduleClassName}
                            onClick={
                              hasChildren
                                ? () =>
                                    toggleModule(
                                      module.id
                                    )
                                : undefined
                            }
                            title={
                              module.status === 'planned' &&
                              !hasChildren
                                ? 'Planned module'
                                : undefined
                            }
                            type="button"
                          >
                            {moduleContent}
                          </button>
                        )}

                        {module.href && hasChildren ? (
                          <button
                            aria-expanded={moduleExpanded}
                            aria-label={`${moduleLabel} submenu`}
                            className="sidebar-module-expand-button"
                            onClick={() =>
                              toggleModule(module.id)
                            }
                            type="button"
                          >
                            <ChevronDownIcon
                              className={
                                moduleExpanded
                                  ? 'is-open'
                                  : ''
                              }
                            />
                          </button>
                        ) : null}
                      </div>

                      {hasChildren && moduleExpanded ? (
                        <div className="sidebar-submodule-items">
                          {module.children?.map((child) => {
                            const childActive =
                              pathMatches(
                                child.href,
                                pathname
                              );

                            const childLabel =
                              localizeModuleLabel(
                                locale,
                                child.label
                              );

                            const childClassName = [
                              'sidebar-submodule-item',
                              childActive
                                ? 'is-active'
                                : '',
                              child.status === 'planned'
                                ? 'is-planned'
                                : ''
                            ]
                              .filter(Boolean)
                              .join(' ');

                            if (child.href) {
                              return (
                                <Link
                                  className={
                                    childClassName
                                  }
                                  href={child.href}
                                  key={child.id}
                                >
                                  <span className="sidebar-submodule-connector" />
                                  <span>
                                    {childLabel}
                                  </span>

                                  {child.badge ? (
                                    <span className="nav-badge">
                                      {child.badge}
                                    </span>
                                  ) : null}
                                </Link>
                              );
                            }

                            return (
                              <button
                                aria-disabled="true"
                                className={
                                  childClassName
                                }
                                key={child.id}
                                title="Planned module"
                                type="button"
                              >
                                <span className="sidebar-submodule-connector" />
                                <span>
                                  {childLabel}
                                </span>

                                {child.badge ? (
                                  <span className="nav-badge">
                                    {child.badge}
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>
        );
      })}
    </nav>
  );
}
