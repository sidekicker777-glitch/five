export type ModeId = 'script' | 'ui' | 'debug' | 'mlo' | 'items' | 'system';

export const MODES: Array<{ id: ModeId; label: string }> = [
  { id: 'script', label: 'Script Builder' },
  { id: 'ui', label: 'UI / NUI' },
  { id: 'debug', label: 'Fix / Debug' },
  { id: 'mlo', label: 'MLO / Mapping' },
  { id: 'items', label: 'Items / Weapons' },
  { id: 'system', label: 'Full System' },
];

export const QS_PACKAGES = [
  'qs-inventory',
  'qs-smartphone-pro',
  'qs-housing',
  'qs-apartments',
  'qs-advancedgarages',
  'qs-interface',
  'qs-banking',
  'qs-multicharacter',
  'qs-dispatch',
  'qs-weapons',
  'qs-shops',
  'qs-hud',
  'qs-vehiclekeys',
  'qs-mechanicjob',
  'qs-ambulancejob',
  'qs-3d-sound',
  'qs-management',
  'qs-doorlock',
  'qs-radialmenu',
  'qs-adminmenu',
  'qs-policejob',
  'qs-gangmenu',
  'qs-clothing',
  'qs-weed',
  'qs-drugs',
  'qs-bennys',
  'qs-stores',
  'qs-lapraces',
  'qs-skillbar',
  'qs-scoreboard',
  'qs-loading',
  'qs-fitbit',
  'qs-fuelstations',
  'qs-vehiclemenu',
  'qs-jobs',
  'qs-businesses',
  'qs-garages',
  'qs-identity',
  'qs-phone',
  'qs-deliveries',
] as const;

export const OPTION_GROUPS = {
  frameworks: ['QBCore', 'Standalone', 'ESX', 'Qbox'],
  targets: ['qb-target', 'ox_target', 'qtarget'],
  inventories: ['qs-inventory', 'ox_inventory', 'qb-inventory', 'lj-inventory'],
  appearance: ['illenium-appearance', 'vx-illenium-rework', 'fivem-appearance', 'qs-appearance'],
  phones: ['qs-smartphone-pro', 'lb-phone', 'gksphone', 'qs-phone', 'none'],
  garages: ['qs-advancedgarages', 'jg-advancedgarages', 'qb-garages', 'qs-garages', 'none'],
  deliverables: [
    'fxmanifest.lua',
    'config.lua',
    'shared.lua',
    'client.lua',
    'server.lua',
    'html/ui files',
    'SQL',
    'README.md',
    'install guide',
    'integration notes',
    'preset examples',
  ],
} as const;

export const EXTRA_GROUPS = [
  {
    id: 'builder',
    title: 'Builder + Admin',
    subtitle: 'Live setup and admin-facing tooling.',
    options: [
      'Admin panel',
      'In-game setup menu',
      'Live admin builder tools',
      'Live preview builder',
      'Searchable admin lists',
      'Drag-and-drop style setup',
      'Admin permission gates',
      'Permission groups',
      'Command + export access',
    ],
  },
  {
    id: 'ui',
    title: 'UI + Presentation',
    subtitle: 'Polish, responsiveness, and presentation quality.',
    options: [
      'Responsive premium UI',
      'Tebex-ready polish',
      'Localization ready',
      'Notification abstraction',
      'Inventory image support',
      'Map blips / zones / markers',
    ],
  },
  {
    id: 'framework',
    title: 'Framework + Bridge Logic',
    subtitle: 'Compatibility layers and resource detection.',
    options: [
      'Auto-detect framework / resources',
      'Built-in bridge layer',
      'Standalone fallback adapters',
      'Custom exports API',
      'Ox Lib support',
      'Character support',
    ],
  },
  {
    id: 'gameplay',
    title: 'Gameplay + Interaction',
    subtitle: 'Targets, gameplay flow, props, and interaction mechanics.',
    options: [
      'Target zones',
      'Animation + props',
      'Progress bars / skill checks',
      'Minigames / interaction flow',
      'Zone-based logic',
      'Multi-step workflows',
      'NPC / ped interaction support',
      'Prop placement / gizmo tools',
      'Job / gang / item locks',
      'Weather / time hooks',
      'Statebags / entity sync',
      'Conflict-safe keybind handling',
    ],
  },
  {
    id: 'data',
    title: 'Data + Persistence',
    subtitle: 'Storage, persistence, sharing, and presets.',
    options: [
      'Database persistence',
      'Saved player settings',
      'Safe restart persistence',
      'Config presets',
      'Shareable templates',
      'Import / export config presets',
      'Share by URL',
      'JSON preset download',
      'SQL auto import',
    ],
  },
  {
    id: 'economy',
    title: 'Economy + Resource Integrations',
    subtitle: 'Systems that hook into storage, banking, and vehicles.',
    options: [
      'Vehicle integration',
      'Phone integration',
      'Garage integration',
      'Stash / storage integration',
      'Billing / banking integration',
      'Crafting / recipe support',
    ],
  },
  {
    id: 'ops',
    title: 'Ops + Safety',
    subtitle: 'Validation, logging, stability, and anti-abuse.',
    options: [
      'Webhook logging',
      'Discord logs',
      'Audit logs',
      'Server-side validation',
      'Resource health checks',
      'Optimized loops',
      'Cooldown / anti-abuse system',
    ],
  },
] as const;

export const STARTERS: Record<ModeId, { title: string; summary: string; features: string }> = {
  script: {
    title: 'Universal FiveM Script Builder',
    summary:
      'Create a complete FiveM gameplay script that works with QBCore, supports a broad QS ecosystem when installed, and still runs cleanly in standalone mode.',
    features:
      'Build the full resource with framework bridge logic, QS integration hooks, admin setup tools, premium UI, events, exports, persistence, and production-ready structure.',
  },
  ui: {
    title: 'Universal FiveM NUI Builder',
    summary:
      'Build a polished NUI system for FiveM that fits QBCore, works cleanly with QS resources, and can still be adapted for standalone use.',
    features:
      'Use a premium responsive layout, optimized CSS, clean state flow, Lua/NUI callback wiring, config-driven screens, import/export support, and integration-safe design.',
  },
  debug: {
    title: 'FiveM Universal Debug Assistant',
    summary:
      'Analyze and fix broken FiveM resources with special attention to QBCore, QS resources, inventory conflicts, target systems, and standalone fallback behavior.',
    features:
      'Trace exports, callbacks, server events, UI flow, framework detection, QS integration points, and database problems. Return corrected files instead of vague advice.',
  },
  mlo: {
    title: 'FiveM In-Game Map / MLO Tooling',
    summary:
      'Design an advanced in-game mapping workflow for FiveM with admin placement tools, project saving, and compatibility with QBCore servers plus standalone environments.',
    features:
      'Support object placement, edit controls, snapping, grouping, save/load, permissions, clean data structure, builder tools, and export-friendly map placement flow.',
  },
  items: {
    title: 'FiveM Item + Weapon Generator',
    summary:
      'Generate complete items, weapons, ammo mappings, metadata, and shared definitions for QBCore, QS ecosystems, and standalone-friendly integrations.',
    features:
      'Keep naming conventions consistent, generate inventory-ready definitions, handle metadata, ammo logic, image notes, and framework bridge examples.',
  },
  system: {
    title: 'Universal FiveM System Architect',
    summary:
      'Build a complete FiveM system from scratch with QBCore support, deep QS compatibility, standalone fallback design, sharing support, and premium polish.',
    features:
      'Include architecture, admin tools, NUI, SQL, logging, permissions, exports, modular code structure, optimization, sharing presets, and easy drop-in installation.',
  },
};

export type PresetState = {
  mode: ModeId;
  projectName: string;
  summary: string;
  features: string;
  frameworks: string[];
  targets: string[];
  inventories: string[];
  appearance: string[];
  phones: string[];
  garages: string[];
  qsPackages: string[];
  extras: string[];
  deliverables: string[];
  notes: string;
};

export const DEFAULTS: PresetState & {
  proxyUrl: string;
  teamId: string;
  botId: string;
} = {
  mode: 'script',
  projectName: STARTERS.script.title,
  summary: STARTERS.script.summary,
  features: STARTERS.script.features,
  frameworks: ['QBCore', 'Standalone'],
  targets: ['qb-target', 'ox_target'],
  inventories: ['qs-inventory', 'qb-inventory', 'ox_inventory'],
  appearance: ['illenium-appearance', 'vx-illenium-rework'],
  phones: ['qs-smartphone-pro'],
  garages: ['qs-advancedgarages'],
  qsPackages: [...QS_PACKAGES],
  extras: [
    'Admin panel',
    'In-game setup menu',
    'Responsive premium UI',
    'Tebex-ready polish',
    'Auto-detect framework / resources',
    'Shareable templates',
    'Import / export config presets',
    'Share by URL',
    'Built-in bridge layer',
    'Standalone fallback adapters',
    'Job / gang / item locks',
    'Database persistence',
    'Live admin builder tools',
    'Minigames / interaction flow',
    'Vehicle integration',
    'Phone integration',
    'Garage integration',
    'Inventory image support',
    'Custom exports API',
    'Server-side validation',
    'Conflict-safe keybind handling',
    'Resource health checks',
  ],
  deliverables: [...OPTION_GROUPS.deliverables],
  notes:
    'Make it work with QBCore first, support as many QS scripts as possible when present, and keep standalone fallback behavior clean. Include real integration notes, shareable presets, and avoid fake exports.',
  proxyUrl: '/api/docsbot/chat-agent',
  teamId: process.env.NEXT_PUBLIC_DEFAULT_TEAM_ID || 'YOUR_TEAM_ID',
  botId: process.env.NEXT_PUBLIC_DEFAULT_BOT_ID || 'YOUR_BOT_ID',
};
