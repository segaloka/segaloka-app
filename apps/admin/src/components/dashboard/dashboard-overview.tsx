import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BuildingIcon,
  CalendarIcon,
  ChartIcon,
  CheckIcon,
  ClockIcon,
  GlobeIcon,
  MegaphoneIcon,
  MessageIcon,
  ShieldIcon,
  StoreIcon,
  UsersIcon,
  WalletIcon
} from '../icons';

type Tone = 'ok' | 'warning' | 'danger' | 'info' | 'neutral';

interface PanelProps {
  panelId: string;
  eyebrow?: string;
  title: string;
  action?: string;
  children: React.ReactNode;
  className?: string;
}

const ecosystem = [
  ['Travel', '128', '116 aktif', BuildingIcon],
  ['Vendor', '84', '77 aktif', StoreIcon],
  ['Affiliate', '1.248', '1.106 aktif', UsersIcon],
  ['Mitra Travel', '364', '331 aktif', UsersIcon],
  ['Traveler', '18.492', '12.804 aktif', UsersIcon]
] as const;

const attentionItems: ReadonlyArray<{
  title: string;
  detail: string;
  value: string;
  tone: Tone;
}> = [
  {
    title: 'Security review',
    detail: 'Login berisiko perlu diperiksa',
    value: '3',
    tone: 'danger'
  },
  {
    title: 'Settlement tertahan',
    detail: 'Melewati SLA operasional',
    value: '7',
    tone: 'warning'
  },
  {
    title: 'Gateway reconciliation',
    detail: 'Transaksi perlu dicocokkan',
    value: '12',
    tone: 'warning'
  },
  {
    title: 'Legalitas Travel',
    detail: 'Izin mendekati masa berlaku',
    value: '8',
    tone: 'warning'
  },
  {
    title: 'Subscription grace period',
    detail: 'Tenant memerlukan tindak lanjut',
    value: '5',
    tone: 'info'
  },
  {
    title: 'Withdrawal approval',
    detail: 'Menunggu persetujuan',
    value: '14',
    tone: 'info'
  }
];

const approvalQueue = [
  {
    title: 'PT Safar Berkah',
    detail: 'Perpanjangan PPIU',
    age: '12 mnt'
  },
  {
    title: 'PT Cahaya Madinah',
    detail: 'Verifikasi legalitas',
    age: '28 mnt'
  },
  {
    title: 'Vendor Al-Haram',
    detail: 'Verifikasi vendor',
    age: '41 mnt'
  }
];

const financialFlow = [
  ['Payment', 'Rp86,1 M', '3.142 transaksi'],
  ['Ledger', 'Rp83,2 M', 'posted'],
  ['Settlement', 'Rp8,7 M', 'diproses'],
  ['Withdrawal', 'Rp2,1 M', '14 approval'],
  ['Refund', 'Rp184 jt', '23 kasus'],
  ['Reconciliation', '99,4%', 'matched']
] as const;

const operationalHealth = [
  ['Booking lifecycle', '98,7%', 'ok'],
  ['Payment completion', '97,8%', 'ok'],
  ['Legalitas Travel', '8 review', 'warning'],
  ['Subscription', '5 grace', 'warning'],
  ['Settlement SLA', '7 overdue', 'danger']
] as const;

const omnichannel = [
  ['Open conversation', '186'],
  ['Unassigned', '24'],
  ['First response', '4m 18d'],
  ['SLA at risk', '9']
] as const;

const ads = [
  ['Spend', 'Rp284 jt'],
  ['Revenue', 'Rp1,42 M'],
  ['Leads', '3.842'],
  ['ROAS', '5,0x']
] as const;

const risks = [
  ['Login gagal berulang', '12', 'danger'],
  ['Refund anomaly', '4', 'warning'],
  ['Perubahan rekening', '3', 'warning'],
  ['Chargeback', '2', 'danger']
] as const;

const recentActivity = [
  {
    title: 'Settlement batch disetujui',
    detail: 'Finance · SET-240924-018',
    time: '2 menit lalu'
  },
  {
    title: 'Legalitas Travel dikirim untuk review',
    detail: 'PT Safar Berkah · PPIU',
    time: '12 menit lalu'
  },
  {
    title: 'Payment webhook diterima',
    detail: 'Booking BKG-240924-1842',
    time: '18 menit lalu'
  },
  {
    title: 'Reconciliation selesai',
    detail: 'Gateway utama · 99,4% matched',
    time: '31 menit lalu'
  },
  {
    title: 'Laporan operasional diekspor',
    detail: 'Super Admin · CSV',
    time: '48 menit lalu'
  }
];

const systemHealth = [
  ['API Gateway', '99,99%', 'Healthy'],
  ['Database', 'Normal', 'Healthy'],
  ['Payment Gateway', 'Normal', 'Healthy'],
  ['Realtime', 'Connected', 'Healthy'],
  ['Notification', 'Queue normal', 'Healthy'],
  ['Background Jobs', 'Normal', 'Healthy']
] as const;

const quickActions = [
  ['Approval Center', '32 item perlu tindakan', CheckIcon],
  ['Tambah Travel', 'Onboarding tenant baru', BuildingIcon],
  ['Rekonsiliasi', 'Periksa transaksi', WalletIcon],
  ['Audit Log', 'Pantau aktivitas sistem', ShieldIcon]
] as const;

function Panel({
  panelId,
  eyebrow,
  title,
  action,
  children,
  className = ''
}: PanelProps) {
  return (
    <section
      className={`v4-panel ${className}`.trim()}
      data-panel-id={panelId}
    >
      <header className="v4-panel-head">
        <div>
          {eyebrow ? <p className="v4-eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
        </div>

        <div className="v4-panel-tools">
          {action ? (
            <button className="v4-text-action" type="button">
              {action}
              <ArrowRightIcon />
            </button>
          ) : null}

          <button
            aria-label={`Buka ${title} di monitor terpisah`}
            className="v4-monitor-button"
            data-monitor-panel={panelId}
            title="Buka di monitor"
            type="button"
          >
            <ArrowUpRightIcon />
          </button>

          <button
            aria-label={`Atur posisi ${title}`}
            className="v4-drag-handle"
            data-drag-panel={panelId}
            title="Atur posisi panel"
            type="button"
          >
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {children}
    </section>
  );
}

function TrendChart() {
  return (
    <div className="v4-trend">
      <svg
        aria-hidden="true"
        preserveAspectRatio="none"
        viewBox="0 0 760 180"
      >
        <defs>
          <linearGradient id="v4TrendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          className="v4-trend-area"
          d="M0 145 C45 137 68 117 112 120 C158 124 178 91 226 96 C275 101 300 74 350 82 C400 90 423 55 470 63 C520 72 543 43 590 49 C638 55 683 25 760 31 L760 180 L0 180 Z"
        />

        <path
          className="v4-trend-line"
          d="M0 145 C45 137 68 117 112 120 C158 124 178 91 226 96 C275 101 300 74 350 82 C400 90 423 55 470 63 C520 72 543 43 590 49 C638 55 683 25 760 31"
        />
      </svg>

      <div className="v4-chart-axis">
        <span>25 Agu</span>
        <span>31 Agu</span>
        <span>6 Sep</span>
        <span>12 Sep</span>
        <span>18 Sep</span>
        <span>24 Sep</span>
      </div>
    </div>
  );
}

function PlatformSnapshot() {
  return (
    <>
      <section className="v4-snapshot">
        <div className="v4-gmv">
          <div className="v4-gmv-top">
            <div>
              <p className="v4-eyebrow">GMV · 30 HARI</p>
              <strong className="v4-gmv-value">Rp83,2 M</strong>
              <p className="v4-muted">
                Semua payment flow · rolling 30 hari
              </p>
            </div>

            <span className="v4-change positive">
              <ArrowUpRightIcon />
              12,8%
            </span>
          </div>

          <TrendChart />
        </div>

        <div className="v4-snapshot-metrics">
          <article>
            <span>Revenue</span>
            <strong>Rp1,84 M</strong>
            <small className="positive">+9,4%</small>
          </article>

          <article>
            <span>Booking</span>
            <strong>2.846</strong>
            <small className="positive">+6,1%</small>
          </article>

          <article>
            <span>Payment success</span>
            <strong>97,8%</strong>
            <small className="negative">-0,8%</small>
          </article>

          <article>
            <span>Approval</span>
            <strong>32</strong>
            <small>Perlu tindakan</small>
          </article>
        </div>
      </section>

      <section className="v4-ecosystem" aria-label="Ekosistem Segaloka">
        {ecosystem.map(([label, value, detail, Icon]) => (
          <button className="v4-ecosystem-item" key={label} type="button">
            <span>
              <Icon />
              {label}
            </span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </button>
        ))}
      </section>
    </>
  );
}

function AttentionPanel() {
  return (
    <Panel
      action="Lihat semua"
      eyebrow="PERLU TINDAKAN"
      panelId="attention"
      title="Operasional yang membutuhkan perhatian"
    >
      <div className="v4-attention-grid">
        {attentionItems.map((item) => (
          <button className="v4-attention-item" key={item.title} type="button">
            <i className={`v4-tone ${item.tone}`} />

            <span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>

            <b>{item.value}</b>
            <ArrowRightIcon />
          </button>
        ))}
      </div>
    </Panel>
  );
}

function ApprovalQueue() {
  return (
    <Panel
      action="Approval Center"
      eyebrow="APPROVAL QUEUE"
      panelId="approval-queue"
      title="Menunggu persetujuan"
    >
      <div className="v4-approval-list">
        {approvalQueue.map((item) => (
          <button className="v4-approval-row" key={item.title} type="button">
            <span className="v4-avatar">
              {item.title.slice(0, 2).toUpperCase()}
            </span>

            <span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>

            <time>{item.age}</time>
            <ArrowRightIcon />
          </button>
        ))}
      </div>
    </Panel>
  );
}

function FinancialSnapshot() {
  return (
    <Panel
      action="Buka Finance"
      eyebrow="FINANCIAL SNAPSHOT"
      panelId="financial-snapshot"
      title="Arus keuangan"
    >
      <div className="v4-financial-flow">
        {financialFlow.map(([label, value, detail], index) => (
          <div className="v4-financial-step" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>

            {index < financialFlow.length - 1 ? (
              <i className="v4-flow-arrow">
                <ArrowRightIcon />
              </i>
            ) : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MarketplaceActivity() {
  return (
    <Panel
      action="Marketplace"
      eyebrow="MARKETPLACE ACTIVITY"
      panelId="marketplace-activity"
      title="Aktivitas marketplace"
    >
      <div className="v4-marketplace-body">
        <div className="v4-marketplace-chart">
          <div className="v4-inline-kpis">
            <div>
              <span>Booking 30 hari</span>
              <strong>2.846</strong>
            </div>
            <div>
              <span>Conversion</span>
              <strong>4,8%</strong>
            </div>
            <div>
              <span>Published package</span>
              <strong>421</strong>
            </div>
          </div>

          <div className="v4-bars" aria-label="Booking marketplace preview">
            {[42, 55, 49, 68, 61, 76, 70, 88, 81, 94, 90, 108].map(
              (value, index) => (
                <i
                  key={`${value}-${index}`}
                  style={{ height: `${Math.max(22, value * 0.78)}%` }}
                />
              )
            )}
          </div>
        </div>

        <div className="v4-top-packages">
          <p className="v4-eyebrow">PAKET TERLARIS</p>

          <ol>
            <li>
              <span>Umrah 9 Hari · Makassar</span>
              <strong>428</strong>
            </li>
            <li>
              <span>Umrah Plus Turki</span>
              <strong>316</strong>
            </li>
            <li>
              <span>Halal Tour Istanbul</span>
              <strong>204</strong>
            </li>
            <li>
              <span>Land Arrangement Makkah</span>
              <strong>182</strong>
            </li>
          </ol>
        </div>
      </div>
    </Panel>
  );
}

function OperationalHealth() {
  return (
    <Panel
      eyebrow="OPERATIONAL HEALTH"
      panelId="operational-health"
      title="Kesehatan operasional"
    >
      <div className="v4-operational-list">
        {operationalHealth.map(([label, value, tone]) => (
          <div className="v4-operational-row" key={label}>
            <span>
              <i className={`v4-status-dot ${tone}`} />
              {label}
            </span>

            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function OmnichannelSnapshot() {
  return (
    <Panel
      action="Buka inbox"
      eyebrow="OMNICHANNEL"
      panelId="omnichannel"
      title="Inbox & layanan"
    >
      <div className="v4-stat-grid">
        {omnichannel.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="v4-channel-mix">
        <p className="v4-eyebrow">CHANNEL MIX</p>

        <div>
          <span style={{ flex: 46 }} />
          <span style={{ flex: 29 }} />
          <span style={{ flex: 16 }} />
          <span style={{ flex: 9 }} />
        </div>

        <small>WhatsApp 46% · Web 29% · Email 16% · Lainnya 9%</small>
      </div>
    </Panel>
  );
}

function AdsSnapshot() {
  return (
    <Panel
      action="Ads Manager"
      eyebrow="ADS SNAPSHOT"
      panelId="ads-snapshot"
      title="Performa promosi"
    >
      <div className="v4-stat-grid">
        {ads.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="v4-campaign">
        <span className="v4-campaign-icon">
          <MegaphoneIcon />
        </span>

        <span>
          <strong>Umrah September · Acquisition</strong>
          <small>CTR 3,8% · 1.284 leads</small>
        </span>

        <b>6,2x</b>
      </div>
    </Panel>
  );
}

function RiskSecurity() {
  return (
    <Panel
      action="Security"
      eyebrow="RISK / SECURITY"
      panelId="risk-security"
      title="Alerts"
    >
      <div className="v4-risk-list">
        {risks.map(([label, value, tone]) => (
          <button className="v4-risk-row" key={label} type="button">
            <i className={`v4-tone ${tone}`} />
            <span>{label}</span>
            <strong>{value}</strong>
            <ArrowRightIcon />
          </button>
        ))}
      </div>
    </Panel>
  );
}

function RecentActivity() {
  return (
    <Panel
      action="Audit log"
      eyebrow="RECENT ACTIVITY"
      panelId="recent-activity"
      title="Aktivitas terbaru"
    >
      <div className="v4-activity-list">
        {recentActivity.map((item, index) => (
          <div className="v4-activity-row" key={item.title}>
            <span className="v4-activity-icon">
              {index === 0 ? (
                <WalletIcon />
              ) : index === 1 ? (
                <ShieldIcon />
              ) : index === 2 ? (
                <GlobeIcon />
              ) : index === 3 ? (
                <ChartIcon />
              ) : (
                <CalendarIcon />
              )}
            </span>

            <span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>

            <time>{item.time}</time>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SystemHealth() {
  return (
    <Panel
      eyebrow="SYSTEM HEALTH"
      panelId="system-health"
      title="Kesehatan platform"
    >
      <div className="v4-system-list">
        {systemHealth.map(([label, detail, state]) => (
          <div className="v4-system-row" key={label}>
            <i />
            <span>
              <strong>{label}</strong>
              <small>{detail}</small>
            </span>
            <b>{state}</b>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function QuickActions() {
  return (
    <Panel
      eyebrow="QUICK ACTIONS"
      panelId="quick-actions"
      title="Akses cepat"
    >
      <div className="v4-quick-grid">
        {quickActions.map(([label, detail, Icon]) => (
          <button className="v4-quick-action" key={label} type="button">
            <span>
              <Icon />
            </span>

            <span>
              <strong>{label}</strong>
              <small>{detail}</small>
            </span>

            <ArrowRightIcon />
          </button>
        ))}
      </div>
    </Panel>
  );
}

export function DashboardOverview() {
  return (
    <div className="overview-v4-page">
      <div className="v4-page-heading">
        <div>
          <p className="breadcrumb">Control Center / Overview</p>
          <h1>Control Center</h1>
          <p>
            Kondisi platform Segaloka hari ini — bisnis, operasional,
            keuangan, layanan, risiko, dan sistem dalam satu pandangan.
          </p>
        </div>

        <div className="v4-heading-actions">
          <span className="demo-data-label">
            <span />
            Preview data
          </span>

          <span className="v4-live">
            <i />
            Realtime-ready
          </span>

          <button className="secondary-button" type="button">
            <CalendarIcon />
            30 hari
          </button>

          <button className="primary-button" type="button">
            <ChartIcon />
            Analytics
          </button>
        </div>
      </div>

      <div className="v4-preview-notice">
        <span>
          <ShieldIcon />
        </span>

        <div>
          <strong>Preview visual Control Center</strong>
          <p>
            Nilai pada halaman ini masih data presentasi. Struktur panel
            disiapkan untuk canonical API/read-model dan realtime event
            Segaloka; data preview tidak menjadi sumber kebenaran produksi.
          </p>
        </div>
      </div>

      <div className="v4-section-label">
        <span>PLATFORM SNAPSHOT</span>
        <i />
      </div>

      <PlatformSnapshot />

      <div className="v4-two-column">
        <AttentionPanel />
        <ApprovalQueue />
      </div>

      <FinancialSnapshot />

      <div className="v4-market-grid">
        <MarketplaceActivity />
        <OperationalHealth />
      </div>

      <div className="v4-three-column">
        <OmnichannelSnapshot />
        <AdsSnapshot />
        <RiskSecurity />
      </div>

      <div className="v4-bottom-grid">
        <RecentActivity />

        <div className="v4-bottom-stack">
          <SystemHealth />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
