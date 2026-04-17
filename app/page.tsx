'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ComponentType, type Dispatch, type SetStateAction } from 'react';
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
  WandSparkles,
  Shuffle,
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

function normalizeBrief(input: string) {
  return input.replace(/\s+/g, ' ').replace(/[“”]/g, '"').trim();
}

function sentenceCase(input: string) {
  if (!input) return input;
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function titleCase(input: string) {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function inferModeFromBrief(brief: string, currentMode: ModeId): ModeId {
  const text = brief.toLowerCase();

  if (/(\bnui\b|\bui\b|tablet|\bhud\b|\binterface\b|\bux\b|\bfrontend\b|dashboard)/.test(text)) return 'ui';
  if (/(debug|fix|error|issue|broken|bug|trace|troubleshoot)/.test(text)) return 'debug';
  if (/(\bmlo\b|mapping|interior|\bprop\b|\bprops\b|\bobject\b|\bobjects\b|coords?|shell)/.test(text)) return 'mlo';
  if (/(weapon|ammo|\bitem\b|\bitems\b|inventory|attachment|icon)/.test(text)) return 'items';
  if (/(\bsystem\b|framework|complete resource|full system|entire system)/.test(text)) return 'system';

  return currentMode;
}

function deriveProjectName(brief: string, mode: ModeId) {
  const text = brief.toLowerCase();

  if (/(prop|object).*(remove|cleanup|delete)/.test(text)) return 'Persistent Prop Cleanup Dev Tool';
  if (/(restaurant|food|menu)/.test(text)) return 'Restaurant Menu Builder';
  if (/(elevator)/.test(text)) return 'Advanced Elevator System';
  if (/(handling)/.test(text)) return 'Vehicle Handling Editor';
  if (/(weather|time)/.test(text)) return 'Weather and Time Admin System';
  if (/(clothing|appearance|shop)/.test(text)) return 'Clothing Shop Builder';
  if (/(inventory|item)/.test(text)) return 'Item and Inventory Builder';
  if (/(mlo|interior|map)/.test(text)) return 'MLO and Mapping Dev Tool';
  if (/(phone)/.test(text)) return 'Phone-Integrated FiveM System';
  if (/(garage|vehicle)/.test(text)) return 'Vehicle and Garage System';

  const trimmed = titleCase(brief.replace(/[^a-zA-Z0-9\s]/g, ''));
  if (trimmed) return trimmed;
  return STARTERS[mode].title;
}

function pickRelevantExtras(extras: string[], max = 10) {
  return extras.filter(Boolean).slice(0, max);
}

function buildEnhancedFields(brief: string, state: PresetState, options?: { lockMode?: boolean }) {
  const cleaned = normalizeBrief(brief);
  const inferredMode = options?.lockMode ? state.mode : inferModeFromBrief(cleaned, state.mode);
  const modeLabel = MODES.find((entry) => entry.id === inferredMode)?.label || inferredMode;
  const selectedExtras = pickRelevantExtras(state.extras, 12);
  const selectedQs = state.qsPackages.slice(0, 8);

  const projectName = deriveProjectName(cleaned, inferredMode);
  const summary = sentenceCase(
    `Turn this rough request into a polished ${modeLabel.toLowerCase()} prompt for a high-level AI assistant: ${cleaned}`
  );

  const features = [
    `Use this raw user request as the core idea: "${cleaned}"`,
    'Expand the rough idea into a cleaner, stronger, more production-ready prompt instead of repeating it word-for-word.',
    'Make the AI act like an expert FiveM developer with strong QBCore, QS, standalone, optimization, and integration knowledge.',
    inferredMode === 'mlo'
      ? 'Push for builder workflow, placement logic, save/load flow, export format, and admin controls.'
      : inferredMode === 'ui'
        ? 'Push for a polished UI/NUI workflow, event wiring, layout behavior, and production-ready UX decisions.'
        : inferredMode === 'debug'
          ? 'Push for real troubleshooting flow, root-cause analysis, working fixes, and replacement code where needed.'
          : 'Push for production-ready gameplay logic, admin workflow, multiplayer-safe state handling, and clean file structure.',
    selectedExtras.length
      ? `Blend in the selected extras where they actually fit the idea: ${selectedExtras.join(', ')}.`
      : 'Add only the extras that are clearly relevant to the idea.',
    selectedQs.length
      ? `Respect the selected QS ecosystem choices when relevant: ${selectedQs.join(', ')}.`
      : 'Support broad FiveM compatibility without forcing unnecessary integrations.',
  ].join(' ');

  const notes = [
    `Base the final prompt on this rough request: "${cleaned}".`,
    'Improve clarity, completeness, and specificity without drifting away from the original goal.',
    selectedExtras.length ? `Selected extras to weave in naturally when relevant: ${selectedExtras.join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    mode: inferredMode,
    projectName,
    summary,
    features,
    notes,
  };
}

function generateRandomIdea(state: PresetState) {
  const mode = state.mode;
  const extras = pickRelevantExtras(state.extras, 4);
  const frameworks = state.frameworks.length ? state.frameworks.join(' and ') : 'QBCore and standalone';
  const targets = state.targets.length ? state.targets.join(' and ') : 'qb-target and ox_target';

  const ideas: Record<ModeId, string[]> = {
    script: [
      `build me a premium FiveM admin utility that helps staff manage broken props and world issues with ${targets}`,
      `make me a high quality FiveM developer tool that can inspect entities, copy coords, and save changes with ${frameworks}`,
      `write me a prompt for a FiveM script that gives admins a polished in game builder for interactive job locations`,
    ],
    ui: [
      'make me a prompt for a premium FiveM tablet UI with responsive NUI pages and smooth admin workflow',
      'write me a better prompt for a modern FiveM management panel with clean layout, filters, and animated sections',
      'build a prompt for a Tebex-quality FiveM settings UI that feels polished and responsive',
    ],
    debug: [
      'make me a prompt that helps fix a broken FiveM script with real root cause analysis and full working replacements',
      'write me a debugging prompt for a FiveM resource that has callback issues, target problems, and database persistence bugs',
      'build a troubleshooting prompt for a FiveM script that errors on startup and has broken event flow',
    ],
    mlo: [
      'make me a prompt for a FiveM dev tool that removes props from the world, keeps them removed after restart, and syncs to everyone',
      'write me a prompt for an in game mapping utility that can place, move, and save objects with admin controls',
      'build a prompt for a FiveM MLO helper that copies coords, inspects props, and exports placement data',
    ],
    items: [
      'write me a prompt for a FiveM item and weapon pack builder with metadata, ammo mapping, and inventory images',
      'make me a prompt for generating consistent qb-core and qs inventory item definitions with icons and integration notes',
      'build a prompt for a FiveM custom weapon setup with clean ammo logic and framework-ready definitions',
    ],
    system: [
      'make me a prompt for a full FiveM system with QBCore support, standalone fallback, and premium UI',
      'write me a prompt for a complete admin-facing FiveM system with setup tools, persistence, and integrations',
      'build a prompt for a production-ready FiveM gameplay system that supports QBCore, QS resources, and clean bridges',
    ],
  };

  const base = ideas[mode][Math.floor(Math.random() * ideas[mode].length)];
  if (!extras.length) return base;
  return `${base} and work in extras like ${extras.join(', ')}`;
}

function buildPrompt(data: PresetState, modeLabel: string, quickBrief: string) {
  const brief = normalizeBrief(quickBrief);
  const frameworks = data.frameworks.length ? data.frameworks.join(', ') : 'QBCore, Standalone';
  const targets = data.targets.length ? data.targets.join(', ') : 'qb-target, ox_target';
  const inventories = data.inventories.length ? data.inventories.join(', ') : 'qs-inventory';
  const appearance = data.appearance.length ? data.appearance.join(', ') : 'illenium-appearance';
  const phones = data.phones.length ? data.phones.join(', ') : 'none';
  const garages = data.garages.length ? data.garages.join(', ') : 'none';
  const qsPackages = data.qsPackages.length ? data.qsPackages.join(', ') : 'No specific QS packages selected';
  const selectedExtras = data.extras.length ? data.extras.join(', ') : 'Only use extras that are clearly relevant.';
  const deliverables = data.deliverables.length
    ? data.deliverables.join(', ')
    : 'complete resource, config, SQL, README, and install notes';

  const objective = data.summary.trim() || 'Turn this idea into a polished, AI-ready FiveM development prompt.';
  const features = data.features.trim() || 'Expand the idea with realistic FiveM implementation details, clean structure, and relevant multiplayer-safe logic.';
  const notes = data.notes.trim() || 'Keep the final prompt aligned with the original goal and avoid fake or placeholder logic.';

  return `You are an expert FiveM developer and system designer who writes strong, production-ready prompts for high-level AI assistants.

Project: ${data.projectName || 'Untitled FiveM Project'}
Prompt type: ${modeLabel}

${brief ? `Original idea:\n"${brief}"\n` : ''}Objective:
${objective}

What the final solution should cover:
${features}

Selected stack and compatibility:
- Frameworks: ${frameworks}
- Target systems: ${targets}
- Inventory systems: ${inventories}
- Appearance systems: ${appearance}
- Phone systems: ${phones}
- Garage systems: ${garages}
- QS resources to support when relevant: ${qsPackages}

Selected extras to weave in naturally where they make sense:
- ${selectedExtras}

Required output style:
- Rewrite the rough idea into a cleaner, stronger, more professional AI prompt.
- Make it read naturally, more like an optimized prompt generator result, not a giant checklist dump.
- Keep the core idea intact while filling in missing FiveM-specific best practices.
- Only include integrations or extras that actually fit the idea.
- Prefer realistic multiplayer-safe patterns, persistence, admin workflow, clean file structure, and good UX where relevant.
- Avoid fake exports, placeholder logic, and overstuffed filler requirements.

Deliverables to request from the AI:
- ${deliverables}

Extra guidance:
${notes}`;
}

export default function FiveMPromptMakerSite() {
  const [mode, setMode] = useState<ModeId>(DEFAULTS.mode);
  const [projectName, setProjectName] = useState(DEFAULTS.projectName);
  const [summary, setSummary] = useState(DEFAULTS.summary);
  const [features, setFeatures] = useState(DEFAULTS.features);
  const [quickBrief, setQuickBrief] = useState('');
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
  const [proxyUrl, setProxyUrl] = useState(DEFAULTS.proxyUrl);
  const [teamId, setTeamId] = useState(DEFAULTS.teamId);
  const [botId, setBotId] = useState(DEFAULTS.botId);
  const [conversationId, setConversationId] = useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'replace-with-uuid'
  );
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
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
    }),
    [mode, projectName, summary, features, frameworks, targets, inventories, appearance, phones, garages, qsPackages, extras, deliverables, notes]
  );

  const prompt = useMemo(() => {
    const modeLabel = MODES.find((entry) => entry.id === mode)?.label || mode;
    return buildPrompt(presetState, modeLabel, quickBrief);
  }, [mode, presetState, quickBrief]);

  const docsBotPayload = useMemo(
    () => ({
      question: prompt,
      stream: false,
      conversationId,
    }),
    [prompt, conversationId]
  );

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('preset', encodePreset(presetState));
    return url.toString();
  }, [presetState]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const presetParam = new URLSearchParams(window.location.search).get('preset');
    if (!presetParam) return;

    const parsed = decodePreset(presetParam);
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
  }, []);

  const applyModeStarter = (nextMode: ModeId) => {
    setMode(nextMode);
    setProjectName(STARTERS[nextMode].title);
    setSummary(STARTERS[nextMode].summary);
    setFeatures(STARTERS[nextMode].features);
  };

  const generateFromBrief = () => {
    const cleaned = normalizeBrief(quickBrief);
    if (!cleaned) return;

    const next = buildEnhancedFields(cleaned, presetState);
    setMode(next.mode);
    setProjectName(next.projectName);
    setSummary(next.summary);
    setFeatures(next.features);
    setNotes(next.notes);
  };

  const randomFromSelections = () => {
    const brief = generateRandomIdea(presetState);
    setQuickBrief(brief);
    const next = buildEnhancedFields(brief, presetState, { lockMode: true });
    setMode(presetState.mode);
    setProjectName(next.projectName);
    setSummary(next.summary);
    setFeatures(next.features);
    setNotes(next.notes);
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
    setQuickBrief('');
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
          <h1 className="hero-title">Turn a rough FiveM idea into a stronger prompt that still uses your selected extras.</h1>
          <p className="hero-copy">
            Start with a quick brief like you would on a prompt generator, then let the builder rewrite it into a cleaner FiveM prompt while weaving in the stack, QS resources,
            and extras you already selected.
          </p>
          <div className="info-row">
            <div className="info-chip">Brief-first flow</div>
            <div className="info-chip">Selected extras included</div>
            <div className="info-chip">QBCore + standalone</div>
            <div className="info-chip">DocsBot server proxy</div>
          </div>
        </div>

        <div className="panel">
          <div className="card-header">
            <div className="icon-box">
              <Bot />
            </div>
            <div>
              <h2 className="section-title">How it works</h2>
              <p className="section-subtitle">More like a prompt enhancer, less like a giant template filler.</p>
            </div>
          </div>
          <div className="steps">
            <div className="step">1. Type a rough idea in the quick brief box.</div>
            <div className="step">2. Click <strong>Generate better prompt from brief</strong> to rewrite it into a stronger FiveM prompt.</div>
            <div className="step">3. Your selected extras and integrations still get worked into the final prompt where they make sense.</div>
          </div>
        </div>
      </motion.section>

      <div className="main-grid">
        <div className="split-grid">
          <SectionCard icon={Wand2} title="Prompt builder" subtitle="Start with a simple idea, then refine it.">
            <div className="field-grid">
              <label className="input-block">
                <span className="label">Quick brief</span>
                <textarea
                  rows={5}
                  value={quickBrief}
                  onChange={(event) => setQuickBrief(event.target.value)}
                  placeholder="Example: write me a prompt for ChatGPT that makes it act like an expert FiveM dev and build a premium prop removal dev tool that keeps removals saved and synced"
                />
              </label>
            </div>

            <div className="action-row">
              <button type="button" className="action-button primary" onClick={generateFromBrief}>
                <WandSparkles size={16} /> Generate better prompt from brief
              </button>
              <button type="button" className="action-button" onClick={randomFromSelections}>
                <Shuffle size={16} /> Random prompt from selected extras
              </button>
            </div>

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

          <SectionCard icon={Settings2} title="Integrations" subtitle="Pick the frameworks, resources, and systems the prompt should respect.">
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

          <SectionCard icon={Package} title="Extras + deliverables" subtitle="Selected extras get blended into the rewritten prompt where they actually fit.">
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
                  rows={5}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add server rules, naming conventions, or special integration requirements here."
                />
              </label>
            </div>
          </SectionCard>
        </div>

        <div className="split-grid">
          <SectionCard icon={Code2} title="Generated prompt" subtitle="A cleaner prompt output that starts from your rough idea and applies your selected stack and extras.">
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
            <div className="preview-box mono prompt-preview">{prompt}</div>
          </SectionCard>

          <SectionCard icon={Server} title="Sharing + DocsBot setup" subtitle="Share the setup and optionally run the generated prompt through your server-side proxy.">
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
