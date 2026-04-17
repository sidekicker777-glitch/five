'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentType,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  Link2,
  Package,
  RefreshCw,
  Server,
  Settings2,
  Shield,
  Sparkles,
  Upload,
  Wand2,
  Dices,
} from 'lucide-react';
import { decodePreset, encodePreset } from '@/lib/preset';
import {
  DEFAULTS,
  EXTRA_GROUPS,
  MODES,
  OPTION_GROUPS,
  QS_PACKAGES,
  STARTERS,
  type ModeId,
  type PresetState,
} from '@/lib/prompt-data';

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel">
      <div className="card-header">
        <div className="icon-box">
          <Icon className="icon" />
        </div>
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function PillGroup({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <div className="pill-row">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            className={`option-pill ${active ? 'active' : ''}`}
            onClick={() => onToggle(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function titleCase(text: string) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function inferModeFromBrief(brief: string): ModeId {
  const text = brief.toLowerCase();

  if (/(debug|fix|broken|error|issue|not work|stuck|problem|troubleshoot)/.test(text)) return 'debug';
  if (/(mlo|mapping|interior|shell|ipl|prop|map builder|object placement)/.test(text)) return 'mlo';
  if (/(ui|nui|hud|tablet|interface|menu|loading screen)/.test(text)) return 'ui';
  if (/(item|weapon|ammo|inventory image|attachment|loot table|crafting item)/.test(text)) return 'items';
  if (/(full system|complete system|framework|economy|job system|multi-step|whole system)/.test(text)) return 'system';

  return 'script';
}

function buildProjectNameFromBrief(brief: string, mode: ModeId) {
  const cleaned = brief
    .replace(/^(i want|can you|please|write me|make me|i need|build me)\s+/i, '')
    .replace(/[^\w\s/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleaned.split(' ').filter(Boolean).slice(0, 5);
  const base = titleCase(words.join(' '));
  const suffix =
    mode === 'ui'
      ? ' UI Prompt'
      : mode === 'debug'
        ? ' Debug Prompt'
        : mode === 'mlo'
          ? ' MLO Prompt'
          : mode === 'items'
            ? ' Items Prompt'
            : mode === 'system'
              ? ' System Prompt'
              : ' Script Prompt';

  return base ? `${base}${suffix}`.slice(0, 72) : STARTERS[mode].title;
}

function buildSummaryFromBrief(brief: string, mode: ModeId) {
  const modeLabel = MODES.find((entry) => entry.id === mode)?.label || 'FiveM build';
  return `Turn this rough request into a polished ${modeLabel.toLowerCase()} prompt for a high-level AI assistant: ${brief.trim()}`;
}

function buildFeaturesFromBrief(brief: string, mode: ModeId) {
  const text = brief.trim();
  const lower = text.toLowerCase();
  const lines = [
    `Use this raw user request as the core idea: "${text}"`,
    'Expand the rough idea into a cleaner, stronger, more production-ready prompt instead of repeating it word-for-word.',
    'Make the AI act like an expert FiveM developer with strong QBCore, QS, standalone, optimization, and integration knowledge.',
  ];

  if (mode === 'script') {
    lines.push('Focus on real FiveM resource structure, events, exports, configs, and drop-in usability.');
  }
  if (mode === 'ui') {
    lines.push('Push for polished NUI structure, responsive layouts, strong UX, and clean Lua-to-UI wiring.');
  }
  if (mode === 'debug') {
    lines.push('Push for root-cause analysis, working fixes, and corrected files instead of general advice.');
  }
  if (mode === 'mlo') {
    lines.push('Push for builder workflow, placement logic, save/load flow, export format, and admin controls.');
  }
  if (mode === 'items') {
    lines.push('Push for item definitions, metadata, weapon mappings, images, and inventory-ready naming consistency.');
  }
  if (mode === 'system') {
    lines.push('Push for modular architecture, clean scalability, deep integrations, and premium release quality.');
  }

  if (/(prompt|chatgpt|gpt|claude|ai)/.test(lower)) {
    lines.push('Keep the final result in ready-to-paste AI prompt format, not as a casual explanation.');
  }
  if (/(qbcore|qb core|qb)/.test(lower)) {
    lines.push('Make QBCore a first-class target.');
  }
  if (/(standalone)/.test(lower)) {
    lines.push('Keep standalone fallback behavior clean and realistic.');
  }
  if (/(qs-|quasar|qs inventory|qs housing|qs apartments|qs interface)/.test(lower)) {
    lines.push('Explicitly account for QS resource compatibility and bridge behavior.');
  }
  if (/(ox_target|ox target|ox_lib|ox lib|ox_inventory|ox inventory)/.test(lower)) {
    lines.push('Include Ox ecosystem compatibility where it improves the result.');
  }
  if (/(qb-target|qb target)/.test(lower)) {
    lines.push('Keep qb-target interactions and setup details in scope.');
  }
  if (/(premium|tebex|polished|modern)/.test(lower)) {
    lines.push('Aim for premium, Tebex-ready polish and cleaner presentation.');
  }

  lines.push('Fill in missing details with realistic FiveM best practices while staying aligned with what the user actually asked for.');

  return lines.join(' ');
}

function buildNotesFromBrief(brief: string) {
  return `Base the final prompt on this rough request: "${brief.trim()}". Improve clarity, completeness, and specificity without drifting away from the original goal.`;
}

function detectSelectionsFromBrief(brief: string) {
  const lower = brief.toLowerCase();

  const frameworks = [
    ...( /(qbcore|qb core|qb)/.test(lower) ? ['QBCore'] : []),
    ...( /(standalone)/.test(lower) ? ['Standalone'] : []),
    ...( /(esx)/.test(lower) ? ['ESX'] : []),
    ...( /(qbox)/.test(lower) ? ['Qbox'] : []),
  ];

  const targets = [
    ...( /(qb-target|qb target)/.test(lower) ? ['qb-target'] : []),
    ...( /(ox_target|ox target)/.test(lower) ? ['ox_target'] : []),
    ...( /(qtarget|q-target)/.test(lower) ? ['qtarget'] : []),
  ];

  const inventories = [
    ...( /(qs-inventory|qs inventory)/.test(lower) ? ['qs-inventory'] : []),
    ...( /(ox_inventory|ox inventory)/.test(lower) ? ['ox_inventory'] : []),
    ...( /(qb-inventory|qb inventory)/.test(lower) ? ['qb-inventory'] : []),
  ];

  return { frameworks, targets, inventories };
}


function pickRandom<T>(items: readonly T[], fallback: T): T {
  return items.length ? items[Math.floor(Math.random() * items.length)] : fallback;
}

function shuffleCopy<T>(items: readonly T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function formatSelected(list: string[], fallback: string) {
  return list.length ? list.join(', ') : fallback;
}

function buildRandomExtraLines(selectedExtras: string[]) {
  const copy = shuffleCopy(selectedExtras);
  return copy.slice(0, Math.min(copy.length, 6)).map((extra) => {
    const lower = extra.toLowerCase();

    if (lower.includes('admin')) return 'Include a real admin management flow with guarded access and practical setup controls.';
    if (lower.includes('setup')) return 'Let staff configure or place the system without editing deep code every time.';
    if (lower.includes('sql')) return 'Include SQL or first-start data setup where it improves the resource.';
    if (lower.includes('localization')) return 'Keep labels, notifications, and UI text localization-ready.';
    if (lower.includes('premium ui')) return 'Make the user-facing flow premium and visually polished rather than barebones.';
    if (lower.includes('ox lib')) return 'Prefer ox_lib for context menus, notifications, and utilities where it makes sense.';
    if (lower.includes('webhook')) return 'Add webhook logging hooks for key actions.';
    if (lower.includes('skill')) return 'Use progress bars or skill checks where the interaction flow benefits from them.';
    if (lower.includes('optimized')) return 'Keep loops efficient and avoid unnecessary client-side performance waste.';
    if (lower.includes('config preset')) return 'Provide clear config presets or example presets for quick deployment.';
    if (lower.includes('discord')) return 'Include optional Discord-facing logs or audit events.';
    if (lower.includes('permission')) return 'Respect permission groups and admin restrictions cleanly.';
    if (lower.includes('target zone')) return 'Use target zones or interaction zones where appropriate.';
    if (lower.includes('animation')) return 'Pair important interactions with fitting animations and props.';
    if (lower.includes('tebex')) return 'Aim for a Tebex-ready finish with presentable structure and release quality.';
    if (lower.includes('auto-detect')) return 'Auto-detect supported frameworks or major dependencies where practical.';
    if (lower.includes('shareable')) return 'Keep the output reusable and easy to hand off to teammates or customers.';
    if (lower.includes('import / export')) return 'Support importing and exporting reusable presets or setup data.';
    if (lower.includes('share by url')) return 'Make the setup or prompt easy to share through a simple handoff flow.';
    if (lower.includes('json')) return 'Provide a machine-friendly JSON export where useful.';
    if (lower.includes('bridge')) return 'Use a clean bridge layer rather than hardcoding one ecosystem path.';
    if (lower.includes('standalone')) return 'Keep standalone fallback behavior working instead of requiring a framework at all times.';
    if (lower.includes('job / gang / item')) return 'Support job, gang, or item restrictions where the gameplay needs them.';
    if (lower.includes('zone-based')) return 'Use zone-aware behavior if the selected concept benefits from location rules.';
    if (lower.includes('multi-step')) return 'Break the user flow into realistic multi-step gameplay instead of one button press.';
    if (lower.includes('saved player')) return 'Persist player-side settings or preferences when it improves the experience.';
    if (lower.includes('database')) return 'Persist meaningful state in the database when needed.';
    if (lower.includes('live admin')) return 'Expose live builder or live admin editing tools if they fit the resource.';
    if (lower.includes('context menus')) return 'Support cleaner context menu or radial access patterns.';
    if (lower.includes('minigames')) return 'Use minigames or staged interactions where they improve gameplay.';
    if (lower.includes('statebags')) return 'Use synced state cleanly for world or entity behavior.';
    if (lower.includes('vehicle integration')) return 'Tie into vehicle-related gameplay where the concept supports it.';
    if (lower.includes('phone integration')) return 'Hook into phone workflows or notifications if relevant.';
    if (lower.includes('garage integration')) return 'Support garage or vehicle storage workflows where appropriate.';
    if (lower.includes('inventory image')) return 'Account for inventory image expectations or item presentation details.';
    if (lower.includes('prop placement')) return 'Include prop placement or placement helper behavior where useful.';
    if (lower.includes('weather / time')) return 'Allow hooks into weather or time logic if the system would benefit from it.';
    if (lower.includes('custom exports')) return 'Expose useful exports for other resources to integrate with.';
    if (lower.includes('validation')) return 'Validate important actions server-side instead of trusting the client.';
    if (lower.includes('keybind')) return 'Avoid messy keybind conflicts and keep user input predictable.';
    if (lower.includes('health checks')) return 'Include practical sanity checks or dependency checks where helpful.';
    if (lower.includes('crafting')) return 'Support recipe-driven or staged crafting logic if it fits.';
    if (lower.includes('notification')) return 'Abstract notifications so different ecosystems can be supported cleanly.';
    if (lower.includes('character support')) return 'Account for multicharacter or character-specific persistence when relevant.';
    if (lower.includes('stash')) return 'Support stash, storage, or item holding flows if the concept needs them.';
    if (lower.includes('billing')) return 'Support billing, money movement, or financial hooks where practical.';
    if (lower.includes('preview')) return 'Include preview behavior so admins or players can confirm choices before finalizing.';
    if (lower.includes('searchable')) return 'Keep admin or player lists searchable if the system has many entries.';
    if (lower.includes('drag-and-drop')) return 'Use cleaner builder UX patterns if that improves the setup flow.';
    if (lower.includes('audit')) return 'Track important actions with a usable audit trail.';
    if (lower.includes('cooldown')) return 'Protect abuse-prone actions with realistic cooldown or anti-spam behavior.';
    if (lower.includes('safe restart')) return 'Handle restart persistence so important state survives safely.';
    if (lower.includes('command + export')) return 'Provide both command access and export hooks where that improves flexibility.';
    if (lower.includes('npc')) return 'Support NPC or ped-driven interaction if the system concept fits it.';
    if (lower.includes('map blips')) return 'Include map blips, markers, or world indicators if appropriate.';

    return `Include ${extra} in a real, production-usable way.`;
  });
}

function generateRandomPromptFromSelections({
  mode,
  frameworks,
  targets,
  inventories,
  appearance,
  phones,
  garages,
  extras,
  qsPackages,
}: {
  mode: ModeId;
  frameworks: string[];
  targets: string[];
  inventories: string[];
  appearance: string[];
  phones: string[];
  garages: string[];
  extras: string[];
  qsPackages: string[];
}) {
  const subjectPools: Record<ModeId, readonly string[]> = {
    script: ['chop shop workflow', 'restaurant ordering system', 'advanced elevator system', 'crafting operation', 'storage access system', 'business interaction script'],
    ui: ['tablet management app', 'admin control dashboard', 'premium job panel', 'vehicle control interface', 'dispatch tablet', 'builder menu interface'],
    debug: ['resource repair pass', 'integration cleanup plan', 'inventory persistence fix', 'target interaction fix', 'NUI callback repair', 'framework bridge cleanup'],
    mlo: ['interior builder flow', 'placement editor', 'furniture placement tool', 'shell editing workflow', 'map configuration builder', 'prop staging system'],
    items: ['custom weapon pack prompt', 'item and metadata pack', 'ammo mapping prompt', 'crafting item pack', 'inventory image pack', 'attachment setup prompt'],
    system: ['full gameplay framework concept', 'business management system', 'advanced property system', 'dispatch ecosystem', 'crime gameplay loop', 'service job platform'],
  };

  const stylePools: Record<ModeId, readonly string[]> = {
    script: ['premium', 'modular', 'drop-in ready', 'high-polish', 'server-owner friendly'],
    ui: ['premium', 'clean', 'responsive', 'modern', 'Tebex-ready'],
    debug: ['systematic', 'root-cause-first', 'clean', 'practical', 'production-safe'],
    mlo: ['builder-friendly', 'admin-driven', 'export-ready', 'structured', 'workflow-focused'],
    items: ['consistent', 'inventory-ready', 'metadata-aware', 'clean', 'framework-compatible'],
    system: ['deep', 'scalable', 'modular', 'production-ready', 'high-end'],
  };

  const subject = pickRandom(subjectPools[mode], 'FiveM project');
  const style = pickRandom(stylePools[mode], 'production-ready');
  const frameworkText = formatSelected(frameworks, 'QBCore and standalone');
  const targetText = formatSelected(targets, 'qb-target or ox_target');
  const inventoryText = formatSelected(inventories, 'qs-inventory');
  const appearanceText = formatSelected(appearance, 'illenium-appearance');
  const phoneText = formatSelected(phones.filter((entry) => entry !== 'none'), 'no phone requirement');
  const garageText = formatSelected(garages.filter((entry) => entry !== 'none'), 'no garage requirement');
  const qsText = qsPackages.length ? shuffleCopy(qsPackages).slice(0, 6).join(', ') : 'selected QS resources when relevant';
  const extraLines = buildRandomExtraLines(extras.length ? extras : ['Responsive premium UI', 'Built-in bridge layer', 'Database persistence']);
  const name = `${titleCase(style)} ${titleCase(subject)}`;
  const summary = `Create a ${style} FiveM ${subject} prompt that fits ${frameworkText}, respects the currently selected integrations, and feels ready for a real production server.`;
  const features = [
    `Generate a polished AI prompt for a ${subject} instead of raw implementation notes.`,
    `Make the AI act like an expert FiveM developer with strong knowledge of ${frameworkText}, ${targetText}, ${inventoryText}, and realistic server-side architecture.`,
    `Account for appearance support through ${appearanceText}, phone considerations through ${phoneText}, and garage workflow through ${garageText}.`,
    `Keep the prompt aligned with selected QS ecosystem expectations, especially around ${qsText}.`,
    ...extraLines,
  ].join(' ');
  const notes = `This prompt was randomly generated from the currently selected extras and integrations. Keep the final result aligned with ${frameworkText}, ${targetText}, ${inventoryText}, and the chosen extras: ${(extras.length ? extras : ['Responsive premium UI']).join(', ')}.`;

  return {
    brief: `Write me a strong AI prompt for a ${style} ${subject} that works for ${frameworkText} and respects these extras: ${(extras.length ? extras : ['Responsive premium UI']).join(', ')}.`,
    projectName: name,
    summary,
    features,
    notes,
  };
}


function buildPrompt(data: PresetState, modeLabel: string) {
  const frameworks = data.frameworks.length ? data.frameworks.join(', ') : 'QBCore, Standalone';
  const targets = data.targets.length ? data.targets.join(', ') : 'qb-target, ox_target';
  const inventories = data.inventories.length ? data.inventories.join(', ') : 'qs-inventory';
  const appearance = data.appearance.length ? data.appearance.join(', ') : 'illenium-appearance';
  const phones = data.phones.length ? data.phones.join(', ') : 'none';
  const garages = data.garages.length ? data.garages.join(', ') : 'none';
  const qsPackages = data.qsPackages.length ? data.qsPackages.join(', ') : 'No specific QS packages selected';
  const extras = data.extras.length ? data.extras.join(', ') : 'premium UI, optimization, clean config';
  const extraNotes = data.notes?.trim() || 'No additional notes provided.';
  const deliverables = data.deliverables.length
    ? data.deliverables.join(', ')
    : 'complete resource, config, SQL, README, and install notes';
  const rawBrief = data.brief?.trim();

  const modeGuidance = {
    script:
      'Focus on a complete gameplay script that is production-ready, optimized, deeply configurable, and easy to run on live FiveM servers.',
    ui: 'Focus heavily on premium NUI quality, responsive layouts, polished UX, sharing tools, and full UI-to-Lua wiring.',
    debug:
      'Focus on finding the real root cause, replacing broken logic with working logic, and returning corrected code files with compatibility fixes.',
    mlo:
      'Focus on placement workflow, editing tools, save/load behavior, permissions, builder UX, and export-friendly structure.',
    items:
      'Focus on consistent naming, item definitions, weapon mappings, metadata, icon/image support, and inventory-ready outputs.',
    system:
      'Focus on architecture, scalability, modularity, config-driven design, sharing, and complete end-to-end implementation.',
  };

  return `You are an elite FiveM developer and system designer specialized in high-end, production-ready resources for GTA V FiveM servers.

Task Type: ${modeLabel}
Project Name: ${data.projectName || 'Untitled FiveM Project'}
Main Goal: ${data.summary || 'Create a complete FiveM resource.'}

${rawBrief ? `Original user brief:
${rawBrief}

` : ''}What I want built:
${data.features || 'Build the full system with working client, server, config, and UI flow.'}

Compatibility targets:
- Main frameworks: ${frameworks}
- Target systems: ${targets}
- Inventory systems: ${inventories}
- Appearance systems: ${appearance}
- Phone systems: ${phones}
- Garage systems: ${garages}
- QS ecosystem packages to support when present: ${qsPackages}
- Extra requirements: ${extras}
- Deliverables wanted: ${deliverables}

Core compatibility rules:
- Treat QBCore as a primary supported framework.
- Also support standalone mode with clean fallback logic where framework features are not available.
- Build auto-detection and bridges so the resource can recognize installed QS scripts and integrate with them when present.
- Support as much of the QS ecosystem as realistically possible through adapters, feature flags, and clean bridge modules.
- Do not hard crash if a QS package is missing. Use safe checks, adapters, and documented fallbacks.
- Keep exports, callbacks, events, and config options clean enough that server owners can enable or disable integrations easily.
- Include sharing features for presets, templates, or generated configurations when useful so the output is easy to pass to friends or teammates.

Build rules:
- ${modeGuidance[data.mode]}
- Make it feel premium, polished, and Tebex-quality.
- Use clean file structure, clear config sections, and optimized code.
- Include all needed client, server, shared, and NUI files where relevant.
- Do not give a vague outline only. Actually produce the implementation.
- Include setup instructions, dependencies, exports, events, SQL if needed, and install steps.
- Make the script easy to drag into a server and configure.
- Keep the UI responsive for 1080p, 1440p, and ultrawide when applicable.
- Use realistic FiveM naming, events, callbacks, exports, and state handling.
- Prefer ox_lib support where it improves the system.
- Explain key architecture choices briefly, then provide the actual code/files.

Quality bar:
- No placeholder logic unless clearly labeled.
- No fake exports.
- No missing event flow.
- No generic tutorial tone.
- Return code that is cohesive and intended to actually work.
- Clearly mark how each QS integration is handled.
- Include compatibility notes for QBCore and standalone usage.
- Prefer reusable bridge patterns for QS resources instead of hardcoding one-off logic everywhere.

Additional instructions from me:
${extraNotes}

Output format:
1. Short system overview
2. File structure
3. Full code for each file
4. SQL (if needed)
5. Setup / install instructions
6. Integration notes for QBCore, QS resources, and standalone mode
7. Sharing notes for presets, templates, or handoff to friends
8. Customization notes for sharing or selling the resource
`;
}

export default function HomePage() {
  const [mode, setMode] = useState<ModeId>(DEFAULTS.mode);
  const [projectName, setProjectName] = useState(DEFAULTS.projectName);
  const [summary, setSummary] = useState(DEFAULTS.summary);
  const [features, setFeatures] = useState(DEFAULTS.features);
  const [frameworks, setFrameworks] = useState<string[]>(DEFAULTS.frameworks);
  const [targets, setTargets] = useState<string[]>(DEFAULTS.targets);
  const [inventories, setInventories] = useState<string[]>(DEFAULTS.inventories);
  const [appearance, setAppearance] = useState<string[]>(DEFAULTS.appearance);
  const [phones, setPhones] = useState<string[]>(DEFAULTS.phones);
  const [garages, setGarages] = useState<string[]>(DEFAULTS.garages);
  const [qsPackages, setQsPackages] = useState<string[]>(DEFAULTS.qsPackages);
  const [extras, setExtras] = useState<string[]>(DEFAULTS.extras);
  const [deliverables, setDeliverables] = useState<string[]>(DEFAULTS.deliverables);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [brief, setBrief] = useState(DEFAULTS.brief || '');
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [conversationId, setConversationId] = useState(
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'replace-with-uuid',
  );
  const [proxyUrl, setProxyUrl] = useState(DEFAULTS.proxyUrl);
  const [teamId, setTeamId] = useState(DEFAULTS.teamId);
  const [botId, setBotId] = useState(DEFAULTS.botId);
  const [docsbotAnswer, setDocsbotAnswer] = useState('');
  const [docsbotError, setDocsbotError] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggle = (setter: Dispatch<SetStateAction<string[]>>, values: string[]) => (value: string) => {
    setter(values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value]);
  };

  const presetState = useMemo<PresetState>(
    () => ({
      mode,
      projectName,
      summary,
      features,
      frameworks,
      targets,
      inventories,
      appearance,
      phones,
      garages,
      qsPackages,
      extras,
      deliverables,
      notes,
      brief,
    }),
    [mode, projectName, summary, features, frameworks, targets, inventories, appearance, phones, garages, qsPackages, extras, deliverables, notes, brief],
  );

  const prompt = useMemo(() => buildPrompt(presetState, MODES.find((entry) => entry.id === mode)?.label || 'Script Builder'), [presetState, mode]);

  const docsBotPayload = useMemo(
    () => ({
      question: prompt,
      stream: false,
      conversationId,
    }),
    [prompt, conversationId],
  );

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('preset', encodePreset(presetState));
    return url.toString();
  }, [presetState]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const preset = new URLSearchParams(window.location.search).get('preset');
    if (!preset) return;

    const parsed = decodePreset(preset);
    if (!parsed) return;

    setMode(parsed.mode || DEFAULTS.mode);
    setProjectName(parsed.projectName || DEFAULTS.projectName);
    setSummary(parsed.summary || DEFAULTS.summary);
    setFeatures(parsed.features || DEFAULTS.features);
    setFrameworks(parsed.frameworks || DEFAULTS.frameworks);
    setTargets(parsed.targets || DEFAULTS.targets);
    setInventories(parsed.inventories || DEFAULTS.inventories);
    setAppearance(parsed.appearance || DEFAULTS.appearance);
    setPhones(parsed.phones || DEFAULTS.phones);
    setGarages(parsed.garages || DEFAULTS.garages);
    setQsPackages(parsed.qsPackages || DEFAULTS.qsPackages);
    setExtras(parsed.extras || DEFAULTS.extras);
    setDeliverables(parsed.deliverables || DEFAULTS.deliverables);
    setNotes(parsed.notes || DEFAULTS.notes);
    setBrief(parsed.brief || '');
  }, []);

  const applyModeStarter = (nextMode: ModeId) => {
    setMode(nextMode);
    setProjectName(STARTERS[nextMode].title);
    setSummary(STARTERS[nextMode].summary);
    setFeatures(STARTERS[nextMode].features);
  };

  const generateFromBrief = () => {
    const cleaned = brief.trim().replace(/\s+/g, ' ');
    if (!cleaned) {
      setDocsbotError('Type your rough idea first, then generate a better prompt from it.');
      return;
    }

    const nextMode = inferModeFromBrief(cleaned);
    const detected = detectSelectionsFromBrief(cleaned);

    setDocsbotError('');
    setMode(nextMode);
    setProjectName(buildProjectNameFromBrief(cleaned, nextMode));
    setSummary(buildSummaryFromBrief(cleaned, nextMode));
    setFeatures(buildFeaturesFromBrief(cleaned, nextMode));
    setNotes(buildNotesFromBrief(cleaned));

    if (detected.frameworks.length) setFrameworks(Array.from(new Set(detected.frameworks)));
    if (detected.targets.length) setTargets(Array.from(new Set(detected.targets)));
    if (detected.inventories.length) setInventories(Array.from(new Set(detected.inventories)));
  };

  const generateRandomFromSelections = () => {
    setDocsbotError('');
    const generated = generateRandomPromptFromSelections({
      mode,
      frameworks,
      targets,
      inventories,
      appearance,
      phones,
      garages,
      extras,
      qsPackages,
    });

    setBrief(generated.brief);
    setProjectName(generated.projectName);
    setSummary(generated.summary);
    setFeatures(generated.features);
    setNotes(generated.notes);
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 1800);
  };

  const exportPreset = () => {
    const blob = new Blob([JSON.stringify(presetState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(projectName || 'fivem-prompt-preset').replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importPreset = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as PresetState;
      setMode(parsed.mode || DEFAULTS.mode);
      setProjectName(parsed.projectName || DEFAULTS.projectName);
      setSummary(parsed.summary || DEFAULTS.summary);
      setFeatures(parsed.features || DEFAULTS.features);
      setFrameworks(parsed.frameworks || DEFAULTS.frameworks);
      setTargets(parsed.targets || DEFAULTS.targets);
      setInventories(parsed.inventories || DEFAULTS.inventories);
      setAppearance(parsed.appearance || DEFAULTS.appearance);
      setPhones(parsed.phones || DEFAULTS.phones);
      setGarages(parsed.garages || DEFAULTS.garages);
      setQsPackages(parsed.qsPackages || DEFAULTS.qsPackages);
      setExtras(parsed.extras || DEFAULTS.extras);
      setDeliverables(parsed.deliverables || DEFAULTS.deliverables);
      setNotes(parsed.notes || DEFAULTS.notes);
      setBrief(parsed.brief || '');
    } catch {
      setDocsbotError('Could not import preset JSON.');
    } finally {
      event.target.value = '';
    }
  };

  const resetAll = () => {
    setMode(DEFAULTS.mode);
    setProjectName(DEFAULTS.projectName);
    setSummary(DEFAULTS.summary);
    setFeatures(DEFAULTS.features);
    setFrameworks(DEFAULTS.frameworks);
    setTargets(DEFAULTS.targets);
    setInventories(DEFAULTS.inventories);
    setAppearance(DEFAULTS.appearance);
    setPhones(DEFAULTS.phones);
    setGarages(DEFAULTS.garages);
    setQsPackages(DEFAULTS.qsPackages);
    setExtras(DEFAULTS.extras);
    setDeliverables(DEFAULTS.deliverables);
    setNotes(DEFAULTS.notes);
    setBrief(DEFAULTS.brief || '');
    setDocsbotAnswer('');
    setDocsbotError('');
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      setConversationId(crypto.randomUUID());
    }
  };

  const selectAllQs = () => setQsPackages([...QS_PACKAGES]);
  const clearAllQs = () => setQsPackages([]);

  const sendToDocsBot = async () => {
    setLoadingReply(true);
    setDocsbotError('');
    setDocsbotAnswer('');

    try {
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          botId,
          payload: docsBotPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDocsbotError(data?.message || 'DocsBot request failed.');
        return;
      }

      const answer = data?.answer || data?.message || JSON.stringify(data, null, 2);
      setDocsbotAnswer(typeof answer === 'string' ? answer : JSON.stringify(answer, null, 2));
    } catch {
      setDocsbotError('Could not reach the proxy route.');
    } finally {
      setLoadingReply(false);
    }
  };

  return (
    <main className="page-shell">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="hero-grid"
      >
        <div className="panel">
          <div className="hero-chip">
            <Sparkles size={16} />
            FiveM AI Prompt Maker
          </div>
          <h1 className="hero-title">Turn a rough FiveM idea into a better full prompt.</h1>
          <p className="hero-copy">
            Type what you want in plain words, let the builder expand it into a stronger prompt, then fine-tune the integrations and extras
            before you copy or send it through your DocsBot proxy.
          </p>
          <div className="info-row">
            <div className="info-chip">Fits in frame</div>
            <div className="info-chip">Freeform prompt generation</div>
            <div className="info-chip">QBCore + QS aware</div>
            <div className="info-chip">DocsBot-ready</div>
          </div>
        </div>

        <div className="panel">
          <div className="card-header">
            <div className="icon-box">
              <Bot className="icon" />
            </div>
            <div>
              <h2 className="section-title">How it works</h2>
              <p className="section-subtitle">Give it a rough ask once, then let it turn that into a better structured prompt.</p>
            </div>
          </div>
          <div className="steps">
            <div className="step">1. Type your rough request in the quick brief box.</div>
            <div className="step">2. Click Generate better prompt from brief to fill the main fields for you.</div>
            <div className="step">3. Adjust integrations, extras, and deliverables, then copy the finished prompt.</div>
          </div>
        </div>
      </motion.section>

      <div className="workspace-grid">
        <div className="split-grid">
          <SectionCard icon={Wand2} title="Prompt builder" subtitle="Type the rough idea once, then generate better prompt fields around it.">
            <div className="field-grid">
              <label className="input-block">
                <span className="label">Quick brief</span>
                <textarea
                  rows={4}
                  value={brief}
                  onChange={(event) => setBrief(event.target.value)}
                  placeholder="Example: I want a prompt for ChatGPT that makes it act like an expert FiveM dev and build a premium qb-target restaurant script with QS inventory support."
                />
              </label>

              <div className="action-row">
                <button type="button" className="action-button primary" onClick={generateFromBrief}>
                  <Sparkles size={16} /> Generate better prompt from brief
                </button>
                <button type="button" className="action-button" onClick={generateRandomFromSelections}>
                  <Dices size={16} /> Random prompt from selected extras
                </button>
                <button type="button" className="action-button" onClick={() => applyModeStarter(mode)}>
                  Use current mode starter
                </button>
              </div>

              <p className="helper">
                This does more than paste your text into one box. It can expand your rough request into a cleaner project name, main goal,
                and feature brief, or build a random prompt idea from the extras and integrations you already selected.
              </p>
            </div>

            <div className="divider" />

            <div className="mode-row" style={{ marginBottom: 16 }}>
              {MODES.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={`mode-button ${mode === entry.id ? 'active' : ''}`}
                  onClick={() => applyModeStarter(entry.id)}
                >
                  {entry.label}
                </button>
              ))}
            </div>

            <div className="field-grid">
              <label className="input-block">
                <span className="label">Project name</span>
                <input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Advanced Chop Shop System" />
              </label>

              <label className="input-block">
                <span className="label">Main goal</span>
                <textarea rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} />
              </label>

              <label className="input-block">
                <span className="label">Required features</span>
                <textarea rows={5} value={features} onChange={(event) => setFeatures(event.target.value)} />
              </label>
            </div>
          </SectionCard>

          <SectionCard icon={Settings2} title="Integrations" subtitle="Pick the frameworks, resources, and systems the AI must support.">
            <div className="field-grid">
              <div className="input-block">
                <span className="label">Frameworks</span>
                <PillGroup options={OPTION_GROUPS.frameworks} selected={frameworks} onToggle={toggle(setFrameworks, frameworks)} />
              </div>
              <div className="input-block">
                <span className="label">Target systems</span>
                <PillGroup options={OPTION_GROUPS.targets} selected={targets} onToggle={toggle(setTargets, targets)} />
              </div>
              <div className="input-block">
                <span className="label">Inventory systems</span>
                <PillGroup options={OPTION_GROUPS.inventories} selected={inventories} onToggle={toggle(setInventories, inventories)} />
              </div>
              <div className="input-block">
                <span className="label">Appearance systems</span>
                <PillGroup options={OPTION_GROUPS.appearance} selected={appearance} onToggle={toggle(setAppearance, appearance)} />
              </div>
              <div className="input-block">
                <span className="label">Phone systems</span>
                <PillGroup options={OPTION_GROUPS.phones} selected={phones} onToggle={toggle(setPhones, phones)} />
              </div>
              <div className="input-block">
                <span className="label">Garage systems</span>
                <PillGroup options={OPTION_GROUPS.garages} selected={garages} onToggle={toggle(setGarages, garages)} />
              </div>
              <div className="input-block">
                <div className="row-between">
                  <span className="label">QS resources to support</span>
                  <div className="mini-actions">
                    <button type="button" className="text-button" onClick={selectAllQs}>
                      Select all
                    </button>
                    <button type="button" className="text-button" onClick={clearAllQs}>
                      Clear
                    </button>
                  </div>
                </div>
                <PillGroup options={QS_PACKAGES} selected={qsPackages} onToggle={toggle(setQsPackages, qsPackages)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Package} title="Extras + deliverables" subtitle="These are grouped, but the whole page now stays in frame without pushing off to the right.">
            <div className="extra-groups">
              {EXTRA_GROUPS.map((group) => (
                <div key={group.id} className="extra-group">
                  <h3 className="extra-group-title">{group.title}</h3>
                  <p className="extra-group-subtitle">{group.subtitle}</p>
                  <PillGroup options={group.options} selected={extras} onToggle={toggle(setExtras, extras)} />
                </div>
              ))}
            </div>

            <div className="field-grid" style={{ marginTop: 18 }}>
              <div className="input-block">
                <span className="label">Deliverables</span>
                <PillGroup options={OPTION_GROUPS.deliverables} selected={deliverables} onToggle={toggle(setDeliverables, deliverables)} />
              </div>
              <label className="input-block">
                <span className="label">Extra notes</span>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add server rules, naming conventions, or special integration requirements here."
                />
              </label>
            </div>
          </SectionCard>
        </div>

        <div className="split-grid">
          <SectionCard icon={Code2} title="Generated prompt" subtitle="The output updates after you generate from the quick brief or edit the detailed fields.">
            <div className="action-row">
              <button type="button" className="action-button primary" onClick={copyPrompt}>
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy Prompt'}
              </button>
              <button type="button" className="action-button" onClick={copyShareLink}>
                <Link2 size={16} /> {shareCopied ? 'Link Copied' : 'Copy Share Link'}
              </button>
              <button type="button" className="action-button" onClick={exportPreset}>
                <Download size={16} /> Export Preset
              </button>
              <button type="button" className="action-button" onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} /> Import Preset
              </button>
              <button type="button" className="action-button" onClick={resetAll}>
                <RefreshCw size={16} /> Reset
              </button>
              <input ref={fileInputRef} type="file" accept="application/json" className="hidden-input" onChange={importPreset} />
            </div>
            <textarea className="mono prompt-output" rows={18} readOnly value={prompt} />
          </SectionCard>

          <SectionCard icon={Server} title="Sharing + DocsBot setup" subtitle="Share the setup and optionally run the prompt through your server-side proxy.">
            <div className="field-grid">
              <div className="input-block">
                <span className="label">Share URL</span>
                <div className="share-box mono">{shareUrl || 'Open the page in a browser to generate a share link.'}</div>
              </div>

              <label className="input-block">
                <span className="label">Proxy URL</span>
                <input value={proxyUrl} onChange={(event) => setProxyUrl(event.target.value)} />
              </label>

              <div className="two-up">
                <label className="input-block">
                  <span className="label">Team ID</span>
                  <input value={teamId} onChange={(event) => setTeamId(event.target.value)} />
                </label>
                <label className="input-block">
                  <span className="label">Bot ID</span>
                  <input value={botId} onChange={(event) => setBotId(event.target.value)} />
                </label>
              </div>

              <label className="input-block">
                <span className="label">Conversation ID</span>
                <div className="two-up">
                  <input value={conversationId} onChange={(event) => setConversationId(event.target.value)} />
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      setConversationId(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'replace-with-uuid')
                    }
                  >
                    New UUID
                  </button>
                </div>
              </label>
            </div>

            <div className="preview-box mono" style={{ marginTop: 16 }}>
              <strong>JSON body preview</strong>
              <pre>{JSON.stringify(docsBotPayload, null, 2)}</pre>
            </div>

            <div className="action-row" style={{ marginTop: 16 }}>
              <button type="button" className="action-button primary" onClick={sendToDocsBot} disabled={loadingReply}>
                {loadingReply ? 'Sending...' : 'Send to DocsBot proxy'}
              </button>
            </div>

            <div className="field-grid">
              {docsbotError ? <div className="answer-box">Error: {docsbotError}</div> : null}
              {docsbotAnswer ? <div className="answer-box mono">{docsbotAnswer}</div> : null}
            </div>
          </SectionCard>

          <SectionCard icon={Shield} title="Server proxy example" subtitle="Minimal route shape for safe DocsBot usage and private deployment.">
            <div className="code-box mono">
              <pre>{`export async function POST(request: NextRequest) {
  const { teamId, botId, payload } = await request.json();
  const auth = await buildDocsBotAuthorization(teamId, botId);

  const response = await fetch(
    \`https://api.docsbot.ai/teams/\${teamId}/bots/\${botId}/chat-agent\`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(payload),
    }
  );

  return NextResponse.json(await response.json());
}`}</pre>
            </div>
            <p className="footer-note">
              Public bots can run without auth. Private bots should use a server-side API key or a JWT signed with your DocsBot signature key.
            </p>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
