'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  adminModuleCount,
  adminModuleGroups,
  readyAdminModuleCount
} from '@/config/admin-modules';

export function ModuleInventory() {
  const pathname = usePathname();

  return (
    <section className="module-inventory">
      <div className="module-inventory-header">
        <div>
          <span className="module-inventory-eyebrow">
            SUPER ADMIN ARCHITECTURE
          </span>

          <h2>Inventaris Modul Segaloka</h2>

          <p>
            Seluruh domain utama ditampilkan agar modul yang sudah tersedia
            dan yang masih direncanakan dapat diaudit sejak awal.
          </p>
        </div>

        <div className="module-inventory-stats">
          <div>
            <strong>{adminModuleCount}</strong>
            <span>Total modul</span>
          </div>

          <div>
            <strong>{readyAdminModuleCount}</strong>
            <span>Sudah aktif</span>
          </div>

          <div>
            <strong>{adminModuleCount - readyAdminModuleCount}</strong>
            <span>Direncanakan</span>
          </div>
        </div>
      </div>

      <div className="module-inventory-groups">
        {adminModuleGroups.map((group) => (
          <article className="module-inventory-group" key={group.id}>
            <div className="module-group-heading">
              <span>{group.label}</span>
              <small>{group.modules.length}</small>
            </div>

            <div className="module-list">
              {group.modules.map((module) => {
                const active =
                  module.href === '/'
                    ? pathname === '/'
                    : module.href
                      ? pathname === module.href ||
                        pathname.startsWith(`${module.href}/`)
                      : false;

                if (module.href) {
                  return (
                    <Link
                      className={`module-list-item module-ready${
                        active ? ' module-current' : ''
                      }`}
                      href={module.href}
                      key={module.label}
                    >
                      <span className="module-status-dot" />

                      <span className="module-name">
                        {module.label}
                      </span>

                      {module.badge ? (
                        <span className="module-count-badge">
                          {module.badge}
                        </span>
                      ) : null}

                      <span className="module-state">Aktif</span>
                    </Link>
                  );
                }

                return (
                  <div
                    className="module-list-item module-planned"
                    key={module.label}
                  >
                    <span className="module-status-dot" />

                    <span className="module-name">
                      {module.label}
                    </span>

                    {module.badge ? (
                      <span className="module-count-badge">
                        {module.badge}
                      </span>
                    ) : null}

                    <span className="module-state">
                      Planned
                    </span>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
