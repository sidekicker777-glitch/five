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

  const modeGuidance: Record<ModeId, string> = {
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

What I want built:
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
    return buildPrompt(presetState, modeLabel);
  }, [mode, presetState]);

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
          <h1 className="hero-title">Build better prompts for FiveM scripts, systems, UI, items, and builder tools.</h1>
          <p className="hero-copy">
            This version separates the extras into cleaner categories, keeps broad QS support, works with QBCore and standalone setups,
            and stays ready for sharing with friends through links or preset files.
          </p>
          <div className="info-row">
            <div className="info-chip">QBCore + Standalone</div>
            <div className="info-chip">Grouped extras</div>
            <div className="info-chip">Broad QS ecosystem support</div>
            <div className="info-chip">DocsBot server proxy</div>
          </div>
        </div>

        <div className="panel">
          <div className="card-header">
            <div className="icon-box">
              <Bot />
            </div>
            <div>
              <h2 className="section-title">Share with friends</h2>
              <p className="section-subtitle">Copy a share link, export a preset, or let them run the same setup from their own browser.</p>
            </div>
          </div>
          <div className="steps">
            <div className="step">1. Pick your mode, integrations, QS resources, and grouped extras.</div>
            <div className="step">2. Share the full setup by URL or export it as a preset JSON file.</div>
            <div className="step">3. Send the generated prompt through the built-in server proxy to DocsBot.</div>
          </div>
        </div>
      </motion.section>

      <div className="main-grid">
        <div className="split-grid">
          <SectionCard icon={Wand2} title="Prompt builder" subtitle="Shape the AI request exactly how you want it.">
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span className="label">QS resources to support</span>
                  <div className="mode-row">
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

          <SectionCard icon={Package} title="Extras + deliverables" subtitle="The extras are now separated into cleaner groups instead of one huge pile.">
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
          <SectionCard icon={Code2} title="Generated prompt" subtitle="Copy this into your coding AI or send it through your DocsBot proxy.">
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
            <textarea className="mono" rows={26} readOnly value={prompt} />
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
