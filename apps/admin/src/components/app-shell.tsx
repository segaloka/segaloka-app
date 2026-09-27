'use client';

import { useState } from 'react';

import { brandConfig } from '@/config/brand';
import {
  localeOptions,
  type Locale
} from '@/config/locales';
import { translate } from '@/i18n/messages';

import {
  type ThemePreference,
  useAppPreferences
} from './app-provider';
import {
  BellIcon,
  ChevronDownIcon,
  MenuIcon,
  SearchIcon
} from './icons';
import { SidebarNavigation } from './sidebar-navigation';

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function Sidebar({
  mobileOpen,
  collapsed,
  onCloseMobile,
  onToggleCollapsed
}: Readonly<{
  mobileOpen: boolean;
  collapsed: boolean;
  onCloseMobile: () => void;
  onToggleCollapsed: () => void;
}>) {
  const { locale } = useAppPreferences();

  return (
    <>
      {mobileOpen ? (
        <button
          aria-label="Close navigation"
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          type="button"
        />
      ) : null}

      <aside
        className={[
          'sidebar',
          mobileOpen ? 'sidebar-open' : '',
          collapsed ? 'sidebar-collapsed' : ''
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-identity">
            <BrandMark />

            <div className="sidebar-brand-copy">
              <strong>{brandConfig.productName}</strong>
              <span>{brandConfig.controlCenterName}</span>
            </div>
          </div>

          <button
            aria-label={
              collapsed
                ? 'Expand navigation'
                : 'Collapse navigation'
            }
            aria-pressed={collapsed}
            className="sidebar-collapse-button"
            onClick={onToggleCollapsed}
            title={
              collapsed
                ? 'Expand navigation'
                : 'Collapse navigation'
            }
            type="button"
          >
            <MenuIcon />
          </button>
        </div>

        <div className="sidebar-navigation-scroll">
          <SidebarNavigation />
        </div>

        <div className="sidebar-footer">
          <div
            className="system-health"
            title={translate(locale, 'systemNormal')}
          >
            <span className="health-dot" />

            <div className="sidebar-footer-copy">
              <strong>
                {translate(locale, 'systemNormal')}
              </strong>

              <span>
                {translate(locale, 'systemChecked')}
              </span>
            </div>
          </div>

          <span className="version-label">
            {brandConfig.productName} Platform ·{' '}
            {brandConfig.version}
          </span>
        </div>
      </aside>
    </>
  );
}

function LocaleControl() {
  const {
    locale,
    setLocale
  } = useAppPreferences();

  return (
    <div
      aria-label={translate(locale, 'language')}
      className="preference-segment"
      role="group"
    >
      {localeOptions.map((option) => (
        <button
          aria-pressed={locale === option.value}
          className={
            locale === option.value ? 'is-selected' : ''
          }
          key={option.value}
          onClick={() =>
            setLocale(option.value as Locale)
          }
          title={option.label}
          type="button"
        >
          {option.shortLabel}
        </button>
      ))}
    </div>
  );
}

function ThemeControl() {
  const {
    locale,
    theme,
    setTheme
  } = useAppPreferences();

  const options: ReadonlyArray<{
    value: ThemePreference;
    label: string;
  }> = [
    {
      value: 'light',
      label: translate(locale, 'light')
    },
    {
      value: 'dark',
      label: translate(locale, 'dark')
    },
    {
      value: 'system',
      label: translate(locale, 'system')
    }
  ];

  return (
    <div
      aria-label={translate(locale, 'theme')}
      className="theme-select-wrap"
    >
      <select
        aria-label={translate(locale, 'theme')}
        className="theme-select"
        onChange={(event) =>
          setTheme(
            event.target.value as ThemePreference
          )
        }
        value={theme}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Topbar({
  onOpenNavigation
}: Readonly<{
  onOpenNavigation: () => void;
}>) {
  const { locale } = useAppPreferences();

  return (
    <header className="topbar">
      <div className="topbar-leading">
        <button
          aria-label="Open navigation"
          className="icon-button mobile-menu"
          onClick={onOpenNavigation}
          type="button"
        >
          <MenuIcon />
        </button>

        <button
          aria-label={translate(locale, 'search')}
          className="search-box"
          type="button"
        >
          <SearchIcon />

          <span className="search-copy">
            {translate(locale, 'search')}
          </span>

          <kbd>Ctrl K</kbd>
        </button>
      </div>

      <div className="topbar-actions">
        <div className="environment-pill">
          <span />
          {translate(locale, 'production')}
        </div>

        <LocaleControl />
        <ThemeControl />

        <button
          aria-label={translate(locale, 'notifications')}
          className="icon-button notification-button"
          type="button"
        >
          <BellIcon />
          <span className="notification-dot" />
        </button>

        <div className="topbar-divider" />

        <button
          className="profile-button"
          type="button"
        >
          <span className="avatar">SA</span>

          <span className="profile-copy">
            <strong>
              {translate(locale, 'superAdmin')}
            </strong>

            <small>
              {translate(locale, 'platformOwner')}
            </small>
          </span>

          <ChevronDownIcon />
        </button>
      </div>
    </header>
  );
}

export function AppShell({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navigationOpen, setNavigationOpen] =
    useState(false);

  const [navigationCollapsed, setNavigationCollapsed] =
    useState(false);

  return (
    <div
      className={[
        'app-shell',
        'control-center-shell',
        navigationCollapsed
          ? 'navigation-is-collapsed'
          : ''
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Sidebar
        collapsed={navigationCollapsed}
        mobileOpen={navigationOpen}
        onCloseMobile={() => setNavigationOpen(false)}
        onToggleCollapsed={() =>
          setNavigationCollapsed((current) => !current)
        }
      />

      <div className="app-main">
        <Topbar
          onOpenNavigation={() =>
            setNavigationOpen(true)
          }
        />

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
