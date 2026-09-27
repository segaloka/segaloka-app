import Link from 'next/link';

import {
  ArrowRightIcon,
  BuildingIcon,
  CheckIcon,
  ClockIcon,
  SearchIcon,
  ShieldIcon,
  UsersIcon
} from '../icons';

const travelMetrics = [
  {
    label: 'Total travel',
    value: '128',
    detail: '116 aktif di platform',
    icon: BuildingIcon
  },
  {
    label: 'Legalitas terverifikasi',
    value: '112',
    detail: '87,5% dari seluruh travel',
    icon: ShieldIcon
  },
  {
    label: 'Menunggu verifikasi',
    value: '8',
    detail: 'Perlu tindakan admin',
    icon: ClockIcon
  },
  {
    label: 'Cabang aktif',
    value: '214',
    detail: 'Termasuk cabang tambahan',
    icon: UsersIcon
  }
];

const travels = [
  {
    id: 'TRV-00128',
    name: 'Safar Indonesia',
    city: 'Makassar',
    license: 'PPIU',
    legal: 'Terverifikasi',
    subscription: 'Business',
    branches: 2,
    status: 'Aktif'
  },
  {
    id: 'TRV-00127',
    name: 'Travel Nusantara',
    city: 'Jakarta Selatan',
    license: 'PPIU',
    legal: 'Terverifikasi',
    subscription: 'Enterprise',
    branches: 4,
    status: 'Aktif'
  },
  {
    id: 'TRV-00126',
    name: 'Amanah Journey',
    city: 'Surabaya',
    license: 'PPIU',
    legal: 'Review',
    subscription: 'Business',
    branches: 1,
    status: 'Review'
  },
  {
    id: 'TRV-00125',
    name: 'Madinah Tour',
    city: 'Bandung',
    license: 'PPIU',
    legal: 'Terverifikasi',
    subscription: 'Business',
    branches: 2,
    status: 'Aktif'
  },
  {
    id: 'TRV-00124',
    name: 'Rihlah Wisata',
    city: 'Yogyakarta',
    license: 'BPW',
    legal: 'Review',
    subscription: 'Starter',
    branches: 1,
    status: 'Review'
  },
  {
    id: 'TRV-00123',
    name: 'Barokah Haramain',
    city: 'Medan',
    license: 'PPIU',
    legal: 'Terverifikasi',
    subscription: 'Business',
    branches: 3,
    status: 'Aktif'
  }
];

function TravelMetricCards() {
  return (
    <section className="travel-metrics-grid" aria-label="Ringkasan travel">
      {travelMetrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <article className="travel-metric-card" key={metric.label}>
            <span className="travel-metric-icon">
              <Icon />
            </span>

            <div>
              <span className="travel-metric-label">{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function TravelFilters() {
  return (
    <div className="travel-toolbar">
      <div className="travel-search">
        <SearchIcon />
        <input
          aria-label="Cari travel"
          placeholder="Cari nama travel, ID, atau kota..."
          type="search"
        />
      </div>

      <div className="travel-filter-actions">
        <button className="filter-button filter-button-active" type="button">
          Semua
          <span>128</span>
        </button>

        <button className="filter-button" type="button">
          Aktif
          <span>116</span>
        </button>

        <button className="filter-button" type="button">
          Review
          <span>8</span>
        </button>

        <button className="filter-button" type="button">
          Nonaktif
          <span>4</span>
        </button>

        <button className="secondary-button travel-more-filter" type="button">
          Filter lainnya
        </button>
      </div>
    </div>
  );
}

function TravelTable() {
  return (
    <div className="travel-table-wrap">
      <table className="travel-table">
        <thead>
          <tr>
            <th>Travel</th>
            <th>Perizinan</th>
            <th>Legalitas</th>
            <th>Subscription</th>
            <th>Cabang</th>
            <th>Status</th>
            <th aria-label="Aksi" />
          </tr>
        </thead>

        <tbody>
          {travels.map((travel) => (
            <tr key={travel.id}>
              <td>
                <div className="travel-identity">
                  <span className="travel-avatar">
                    {travel.name
                      .split(' ')
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join('')}
                  </span>

                  <div>
                    <strong>{travel.name}</strong>
                    <span>
                      {travel.id} &middot; {travel.city}
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <span className="license-badge">{travel.license}</span>
              </td>

              <td>
                <span
                  className={
                    travel.legal === 'Terverifikasi'
                      ? 'legal-state legal-verified'
                      : 'legal-state legal-review'
                  }
                >
                  {travel.legal === 'Terverifikasi' ? (
                    <CheckIcon />
                  ) : (
                    <ClockIcon />
                  )}

                  {travel.legal}
                </span>
              </td>

              <td>
                <div className="subscription-cell">
                  <strong>{travel.subscription}</strong>
                  <span>Aktif</span>
                </div>
              </td>

              <td>{travel.branches}</td>

              <td>
                <span
                  className={
                    travel.status === 'Aktif'
                      ? 'status-badge status-lunas'
                      : 'status-badge status-dp'
                  }
                >
                  {travel.status}
                </span>
              </td>

              <td>
                <Link
                  aria-label={`Buka ${travel.name}`}
                  className="row-action"
                  href={`/travel/${travel.id}`}
                >
                  <ArrowRightIcon />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TravelOverview() {
  return (
    <>
      <div className="page-heading travel-page-heading">
        <div>
          <p className="breadcrumb">Control Center / Ekosistem / Travel</p>
          <h1>Travel &amp; Legalitas</h1>
          <p>
            Kelola tenant travel, status perizinan, legalitas, subscription,
            dan cabang dalam satu workspace.
          </p>
        </div>

        <div className="page-heading-actions">
          <span className="demo-data-label">
            <span />
            Preview data
          </span>

          <button className="secondary-button" type="button">
            Ekspor data
          </button>

          <button className="primary-button" type="button">
            Tambah travel
          </button>
        </div>
      </div>

      <TravelMetricCards />

      <section className="panel travel-directory-panel">
        <div className="travel-directory-heading">
          <div>
            <p className="eyebrow">DIREKTORI TRAVEL</p>
            <h2>Semua travel</h2>
            <p>
              Pantau onboarding dan status operasional tenant travel.
            </p>
          </div>

          <div className="travel-directory-summary">
            <span className="summary-health-dot" />
            116 dari 128 travel aktif
          </div>
        </div>

        <TravelFilters />
        <TravelTable />

        <div className="table-pagination">
          <span>Menampilkan 1-6 dari 128 travel</span>

          <div>
            <button disabled type="button">
              Sebelumnya
            </button>
            <button className="pagination-active" type="button">
              1
            </button>
            <button type="button">2</button>
            <button type="button">3</button>
            <span>...</span>
            <button type="button">22</button>
            <button type="button">Berikutnya</button>
          </div>
        </div>
      </section>

      <section className="travel-insight-grid">
        <article className="panel travel-insight-card">
          <div className="travel-insight-icon success">
            <ShieldIcon />
          </div>

          <div>
            <span>Compliance</span>
            <strong>87,5% legalitas terverifikasi</strong>
            <p>
              8 travel masih dalam proses review dan membutuhkan pemeriksaan
              dokumen.
            </p>
          </div>

          <button className="text-link" type="button">
            Buka antrean legalitas
            <ArrowRightIcon />
          </button>
        </article>

        <article className="panel travel-insight-card">
          <div className="travel-insight-icon neutral">
            <BuildingIcon />
          </div>

          <div>
            <span>Subscription</span>
            <strong>92% subscription aktif</strong>
            <p>
              Pantau masa aktif, cabang tambahan, dan entitlement setiap
              tenant travel.
            </p>
          </div>

          <button className="text-link" type="button">
            Kelola subscription
            <ArrowRightIcon />
          </button>
        </article>
      </section>
    </>
  );
}
