export type AdminModuleStatus = 'ready' | 'planned';

export type AdminModuleIcon =
  | 'overview'
  | 'approval'
  | 'travel'
  | 'vendor'
  | 'affiliate'
  | 'agent'
  | 'partner'
  | 'customer'
  | 'traveler'
  | 'marketplace'
  | 'omnichannel'
  | 'ads'
  | 'booking'
  | 'operations'
  | 'finance'
  | 'subscription'
  | 'platform'
  | 'security'
  | 'analytics'
  | 'system';

export interface AdminNavigationChild {
  id: string;
  label: string;
  href?: string;
  status: AdminModuleStatus;
  badge?: string;
}

export interface AdminModule {
  id: string;
  label: string;
  icon: AdminModuleIcon;
  href?: string;
  status: AdminModuleStatus;
  badge?: string;
  children?: readonly AdminNavigationChild[];
}

export interface AdminModuleGroup {
  id: string;
  label: string;
  modules: readonly AdminModule[];
}

export const adminModuleGroups: readonly AdminModuleGroup[] = [
  {
    id: 'main',
    label: 'Utama',
    modules: [
      {
        id: 'overview',
        label: 'Overview',
        icon: 'overview',
        href: '/',
        status: 'ready'
      },
      {
        id: 'approval-center',
        label: 'Approval Center',
        icon: 'approval',
        status: 'planned'
      }
    ]
  },
  {
    id: 'ecosystem',
    label: 'Ekosistem',
    modules: [
      {
        id: 'travel',
        label: 'Travel',
        icon: 'travel',
        href: '/travel',
        status: 'ready',
        children: [
          {
            id: 'travel-all',
            label: 'Semua Travel',
            href: '/travel',
            status: 'ready'
          },
          {
            id: 'travel-branches',
            label: 'Cabang Travel',
            status: 'planned'
          },
          {
            id: 'travel-legal',
            label: 'Legalitas & Perizinan',
            status: 'planned'
          },
          {
            id: 'travel-subscription',
            label: 'Subscription Travel',
            status: 'planned'
          },
          {
            id: 'travel-website',
            label: 'Website Travel',
            status: 'planned'
          }
        ]
      },
      {
        id: 'vendor',
        label: 'Vendor',
        icon: 'vendor',
        href: '/vendor',
        status: 'ready',
        children: [
          {
            id: 'vendor-all',
            label: 'Semua Vendor',
            status: 'planned'
          },
          {
            id: 'vendor-category',
            label: 'Kategori Vendor',
            status: 'planned'
          },
          {
            id: 'vendor-verification',
            label: 'Verifikasi Vendor',
            status: 'planned'
          },
          {
            id: 'vendor-products',
            label: 'Produk & Layanan',
            status: 'planned'
          }
        ]
      },
      {
        id: 'affiliate',
        label: 'Affiliate',
        icon: 'affiliate',
        href: '/affiliate',
        status: 'ready',
        children: [
          {
            id: 'affiliate-all',
            label: 'Semua Affiliate',
            status: 'planned'
          },
          {
            id: 'affiliate-referral',
            label: 'Referral',
            status: 'planned'
          },
          {
            id: 'affiliate-commission',
            label: 'Komisi',
            status: 'planned'
          },
          {
            id: 'affiliate-performance',
            label: 'Performance',
            status: 'planned'
          }
        ]
      },
      {
        id: 'agent',
        label: 'Agen',
        icon: 'agent',
        href: '/agent',
        status: 'ready',
        children: [
          {
            id: 'agent-all',
            label: 'Semua Agen',
            status: 'planned'
          },
          {
            id: 'agent-sales',
            label: 'Penjualan',
            status: 'planned'
          },
          {
            id: 'agent-commission',
            label: 'Komisi',
            status: 'planned'
          },
          {
            id: 'agent-performance',
            label: 'Performance',
            status: 'planned'
          }
        ]
      },
      {
        id: 'travel-partner',
        label: 'Mitra Travel',
        icon: 'partner',
        href: '/travel-partner',
        status: 'ready',
        children: [
          {
            id: 'travel-partner-all',
            label: 'Semua Mitra',
            status: 'planned'
          },
          {
            id: 'travel-partner-region',
            label: 'Wilayah',
            status: 'planned'
          },
          {
            id: 'travel-partner-performance',
            label: 'Performance',
            status: 'planned'
          }
        ]
      },
      {
        id: 'customer',
        label: 'Pengguna',
        icon: 'customer',
        href: '/customer',
        status: 'ready'
      }
    ]
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    modules: [
      {
        id: 'marketplace-overview',
        label: 'Overview Marketplace',
        icon: 'marketplace',
        status: 'planned'
      },
      {
        id: 'travel-packages',
        label: 'Paket Travel',
        icon: 'marketplace',
        status: 'planned'
      },
      {
        id: 'vendor-products',
        label: 'Produk Vendor',
        icon: 'vendor',
        status: 'planned'
      },
      {
        id: 'segadeals',
        label: 'SegaDeals',
        icon: 'marketplace',
        status: 'planned',
        badge: '12'
      },
      {
        id: 'marketplace-category',
        label: 'Kategori',
        icon: 'marketplace',
        status: 'planned'
      },
      {
        id: 'marketplace-moderation',
        label: 'Moderasi Produk',
        icon: 'approval',
        status: 'planned'
      }
    ]
  },
  {
    id: 'omnichannel',
    label: 'Omnichannel',
    modules: [
      {
        id: 'omnichannel-overview',
        label: 'Overview Omnichannel',
        icon: 'omnichannel',
        status: 'planned'
      },
      {
        id: 'omnichannel-inbox',
        label: 'Inbox',
        icon: 'omnichannel',
        status: 'planned'
      },
      {
        id: 'omnichannel-conversations',
        label: 'Percakapan',
        icon: 'omnichannel',
        status: 'planned'
      },
      {
        id: 'omnichannel-channel',
        label: 'Channel',
        icon: 'omnichannel',
        status: 'planned',
        children: [
          {
            id: 'channel-whatsapp',
            label: 'WhatsApp',
            status: 'planned'
          },
          {
            id: 'channel-instagram',
            label: 'Instagram',
            status: 'planned'
          },
          {
            id: 'channel-facebook',
            label: 'Facebook',
            status: 'planned'
          },
          {
            id: 'channel-email',
            label: 'Email',
            status: 'planned'
          },
          {
            id: 'channel-web-chat',
            label: 'Web Chat',
            status: 'planned'
          }
        ]
      },
      {
        id: 'omnichannel-contacts',
        label: 'Contacts & Audience',
        icon: 'traveler',
        status: 'planned'
      },
      {
        id: 'omnichannel-template',
        label: 'Template Pesan',
        icon: 'omnichannel',
        status: 'planned'
      },
      {
        id: 'omnichannel-broadcast',
        label: 'Broadcast',
        icon: 'omnichannel',
        status: 'planned'
      },
      {
        id: 'omnichannel-automation',
        label: 'Automation',
        icon: 'platform',
        status: 'planned'
      },
      {
        id: 'omnichannel-routing',
        label: 'Routing & Assignment',
        icon: 'platform',
        status: 'planned'
      },
      {
        id: 'omnichannel-sla',
        label: 'SLA & Response',
        icon: 'operations',
        status: 'planned'
      }
    ]
  },
  {
    id: 'ads',
    label: 'Ads & Promotion',
    modules: [
      {
        id: 'ads-overview',
        label: 'Overview Ads',
        icon: 'ads',
        status: 'planned'
      },
      {
        id: 'campaign',
        label: 'Campaign',
        icon: 'ads',
        status: 'planned'
      },
      {
        id: 'ads-management',
        label: 'Ads',
        icon: 'ads',
        status: 'planned'
      },
      {
        id: 'ads-audience',
        label: 'Ad Set & Audience',
        icon: 'traveler',
        status: 'planned'
      },
      {
        id: 'ads-creative',
        label: 'Creative',
        icon: 'ads',
        status: 'planned'
      },
      {
        id: 'ads-placement',
        label: 'Placement & Channel',
        icon: 'ads',
        status: 'planned'
      },
      {
        id: 'ads-budget',
        label: 'Budget',
        icon: 'finance',
        status: 'planned'
      },
      {
        id: 'ads-promotion',
        label: 'Voucher & Promo',
        icon: 'ads',
        status: 'planned'
      },
      {
        id: 'ads-tracking',
        label: 'Tracking',
        icon: 'analytics',
        status: 'planned'
      },
      {
        id: 'ads-conversion',
        label: 'Conversion',
        icon: 'analytics',
        status: 'planned'
      },
      {
        id: 'ads-attribution',
        label: 'Attribution',
        icon: 'analytics',
        status: 'planned'
      }
    ]
  },
  {
    id: 'booking-operations',
    label: 'Booking & Operasional',
    modules: [
      {
        id: 'booking',
        label: 'Booking',
        icon: 'booking',
        status: 'planned'
      },
      {
        id: 'manifest',
        label: 'Manifest',
        icon: 'operations',
        status: 'planned'
      },
      {
        id: 'room-list',
        label: 'Room List',
        icon: 'operations',
        status: 'planned'
      },
      {
        id: 'package-info',
        label: 'Paket Info',
        icon: 'operations',
        status: 'planned'
      },
      {
        id: 'operational-documents',
        label: 'Dokumen Operasional',
        icon: 'operations',
        status: 'planned'
      }
    ]
  },
  {
    id: 'finance',
    label: 'Keuangan',
    modules: [
      {
        id: 'finance-overview',
        label: 'Overview Keuangan',
        icon: 'finance',
        status: 'planned'
      },
      {
        id: 'transactions',
        label: 'Transaksi',
        icon: 'finance',
        status: 'planned'
      },
      {
        id: 'payment-gateway',
        label: 'Payment Gateway',
        icon: 'finance',
        status: 'planned'
      },
      {
        id: 'settlement',
        label: 'Settlement',
        icon: 'finance',
        status: 'planned'
      },
      {
        id: 'withdrawal',
        label: 'Withdrawal',
        icon: 'finance',
        status: 'planned'
      },
      {
        id: 'travel-deposit',
        label: 'Deposit Travel',
        icon: 'finance',
        status: 'planned'
      },
      {
        id: 'refund',
        label: 'Refund',
        icon: 'finance',
        status: 'planned'
      },
      {
        id: 'reconciliation',
        label: 'Reconciliation',
        icon: 'finance',
        status: 'planned'
      },
      {
        id: 'fees',
        label: 'Fee & Commission',
        icon: 'finance',
        status: 'planned'
      }
    ]
  },
  {
    id: 'saas',
    label: 'SaaS & Subscription',
    modules: [
      {
        id: 'subscription',
        label: 'Subscription',
        icon: 'subscription',
        status: 'planned'
      },
      {
        id: 'plans',
        label: 'Plan & Pricing',
        icon: 'subscription',
        status: 'planned'
      },
      {
        id: 'addons',
        label: 'Add-on',
        icon: 'subscription',
        status: 'planned'
      },
      {
        id: 'travel-website',
        label: 'Website Travel',
        icon: 'subscription',
        status: 'planned'
      },
      {
        id: 'crm',
        label: 'CRM',
        icon: 'platform',
        status: 'planned'
      }
    ]
  },
  {
    id: 'platform',
    label: 'Platform',
    modules: [
      {
        id: 'users',
        label: 'User Management',
        icon: 'platform',
        status: 'planned'
      },
      {
        id: 'roles',
        label: 'Role & Permission',
        icon: 'security',
        status: 'planned'
      },
      {
        id: 'notification',
        label: 'Notification',
        icon: 'platform',
        status: 'planned'
      },
      {
        id: 'segaloka-ai',
        label: 'Segaloka AI',
        icon: 'platform',
        status: 'planned'
      }
    ]
  },
  {
    id: 'compliance',
    label: 'Compliance & Security',
    modules: [
      {
        id: 'legal',
        label: 'Legalitas',
        icon: 'security',
        status: 'planned'
      },
      {
        id: 'audit',
        label: 'Audit Log',
        icon: 'security',
        status: 'planned'
      },
      {
        id: 'security',
        label: 'Security',
        icon: 'security',
        status: 'planned'
      },
      {
        id: 'risk',
        label: 'Risk & Fraud',
        icon: 'security',
        status: 'planned'
      }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    modules: [
      {
        id: 'executive-analytics',
        label: 'Executive Analytics',
        icon: 'analytics',
        status: 'planned'
      },
      {
        id: 'marketplace-analytics',
        label: 'Marketplace Analytics',
        icon: 'analytics',
        status: 'planned'
      },
      {
        id: 'travel-analytics',
        label: 'Travel Analytics',
        icon: 'analytics',
        status: 'planned'
      },
      {
        id: 'vendor-analytics',
        label: 'Vendor Analytics',
        icon: 'analytics',
        status: 'planned'
      },
      {
        id: 'finance-analytics',
        label: 'Finance Analytics',
        icon: 'analytics',
        status: 'planned'
      },
      {
        id: 'omnichannel-analytics',
        label: 'Omnichannel Analytics',
        icon: 'analytics',
        status: 'planned'
      },
      {
        id: 'ads-performance',
        label: 'Ads Performance',
        icon: 'analytics',
        status: 'planned'
      },
      {
        id: 'campaign-performance',
        label: 'Campaign Performance',
        icon: 'analytics',
        status: 'planned'
      },
      {
        id: 'conversion-attribution',
        label: 'Conversion & Attribution',
        icon: 'analytics',
        status: 'planned'
      },
      {
        id: 'growth-analytics',
        label: 'Growth Analytics',
        icon: 'analytics',
        status: 'planned'
      }
    ]
  },
  {
    id: 'system',
    label: 'System',
    modules: [
      {
        id: 'configuration',
        label: 'Configuration',
        icon: 'system',
        status: 'planned'
      },
      {
        id: 'brand',
        label: 'Brand & Appearance',
        icon: 'system',
        status: 'planned'
      },
      {
        id: 'localization',
        label: 'Language & Localization',
        icon: 'system',
        status: 'planned'
      },
      {
        id: 'currency',
        label: 'Currency',
        icon: 'system',
        status: 'planned'
      },
      {
        id: 'payment-configuration',
        label: 'Payment Configuration',
        icon: 'system',
        status: 'planned'
      },
      {
        id: 'notification-configuration',
        label: 'Notification Configuration',
        icon: 'system',
        status: 'planned'
      },
      {
        id: 'feature-flags',
        label: 'Feature Flags',
        icon: 'system',
        status: 'planned'
      },
      {
        id: 'integration-api',
        label: 'Integration & API',
        icon: 'system',
        status: 'planned'
      },
      {
        id: 'system-health',
        label: 'System Health',
        icon: 'system',
        status: 'planned'
      }
    ]
  }
];

export const adminModuleCount = adminModuleGroups.reduce(
  (count, group) => count + group.modules.length,
  0
);

export const readyAdminModuleCount = adminModuleGroups.reduce(
  (count, group) =>
    count +
    group.modules.filter((module) => module.status === 'ready').length,
  0
);
