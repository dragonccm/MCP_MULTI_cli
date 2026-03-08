import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

export const ENGINE_DIR = process.cwd();
const DAEMON_PORT_FILE = path.join(ENGINE_DIR, 'docs', 'daemon-port.json');
let daemonStatusCache = { ts: 0, data: null };
let cliStatusCache = { ts: 0, data: null };

export const CLI_TOOLS = [
  { id: 'codex', cmd: 'codex', label: 'Codex CLI' },
  { id: 'copilot', cmd: 'copilot', label: 'Copilot CLI' },
  { id: 'gemini', cmd: 'gemini', label: 'Gemini CLI' },
  { id: 'qwen', cmd: 'qwen', label: 'Qwen CLI' },
];

export const ROLE_KEYS = ['po', 'frontend', 'backend', 'reviewer', 'release', 'coder'];

export function defaultCliConfig() {
  return {
    po: process.env.PO_CLI || process.env.CODER_CLI || 'codex',
    frontend: process.env.FRONTEND_CLI || process.env.CODER_CLI || 'codex',
    backend: process.env.BACKEND_CLI || process.env.CODER_CLI || 'copilot',
    reviewer: process.env.REVIEWER_CLI || process.env.CODER_CLI || 'codex',
    release: process.env.RELEASE_CLI || process.env.CODER_CLI || 'copilot',
    coder: process.env.CODER_CLI || 'codex',
  };
}

export function checkCLI(cmd) {
  try {
    const out = execSync(`${cmd} --version 2>&1`, { timeout: 1200, stdio: 'pipe' })
      .toString()
      .trim();
    return { available: true, version: out.split('\n')[0].slice(0, 80) };
  } catch {
    return { available: false, version: null };
  }
}

export function getCLIStatus() {
  const now = Date.now();
  if (cliStatusCache.data && now - cliStatusCache.ts < 15000) {
    return cliStatusCache.data;
  }
  const status = {};
  for (const tool of CLI_TOOLS) {
    status[tool.id] = { ...tool, ...checkCLI(tool.cmd) };
  }
  cliStatusCache = { ts: now, data: status };
  return status;
}

export function hasStitchCredentials() {
  const cloudSdkConfig = process.env.CLOUDSDK_CONFIG
    || path.join(os.homedir(), '.stitch-mcp', 'config');
  const adcPath = path.join(cloudSdkConfig, 'application_default_credentials.json');
  if (!fs.existsSync(adcPath)) return false;
  try {
    const json = JSON.parse(fs.readFileSync(adcPath, 'utf-8'));
    return !!(json?.client_id || json?.refresh_token || json?.type);
  } catch {
    return false;
  }
}

export function getMCPStatus(engineDir = ENGINE_DIR) {
  const mcpDist = path.join(engineDir, 'mcp-server', 'dist', 'index.js');
  const mcpConfigPaths = [
    path.join(engineDir, '.gemini', 'settings.json'),
    path.join(engineDir, '.claude', 'mcp.json'),
    path.join(engineDir, '.mcp.json'),
    path.join(engineDir, '.qwen', 'settings.json'),
    path.join(engineDir, '.qwen', 'mcp.json'),
    path.join(engineDir, '.copilot', 'mcp-config.json'),
    path.join(engineDir, '.copilot', 'mcp.json'),
  ];

  let stitchConfigured = false;
  let devToolsConfigured = false;
  let configPath = null;
  for (const p of mcpConfigPaths) {
    if (!fs.existsSync(p)) continue;
    configPath = p;
    try {
      const cfg = JSON.parse(fs.readFileSync(p, 'utf-8'));
      const servers = cfg?.mcpServers || {};
      if (servers['dev-tools']) devToolsConfigured = true;
      if (servers['stitch-mcp'] || servers.stitch) {
        stitchConfigured = true;
        break;
      }
    } catch {
      // ignore invalid json
    }
  }

  return {
    devTools: {
      available: fs.existsSync(mcpDist),
      configured: devToolsConfigured,
      path: mcpDist,
    },
    stitch: {
      configured: stitchConfigured,
      credentials: hasStitchCredentials(),
      note: configPath || mcpConfigPaths[0],
    },
    codex: {
      config: path.join(engineDir, '.codex', 'config.toml'),
      exists: fs.existsSync(path.join(engineDir, '.codex', 'config.toml')),
    },
  };
}

export function loadCliConfig(engineDir = ENGINE_DIR) {
  const configPath = path.join(engineDir, 'cli-config.json');
  const defaults = defaultCliConfig();
  try {
    if (fs.existsSync(configPath)) {
      return { ...defaults, ...JSON.parse(fs.readFileSync(configPath, 'utf-8')) };
    }
  } catch {
    // ignore parse error
  }
  return defaults;
}

export function saveCliConfig(cfg, engineDir = ENGINE_DIR) {
  const configPath = path.join(engineDir, 'cli-config.json');
  const nextCfg = { ...loadCliConfig(engineDir), ...cfg };
  fs.writeFileSync(configPath, JSON.stringify(nextCfg, null, 2), 'utf-8');
  return nextCfg;
}

export function getProjects(engineDir = ENGINE_DIR) {
  const dir = path.join(engineDir, 'projects');
  if (!fs.existsSync(dir)) return [];

  try {
    return fs.readdirSync(dir)
      .filter((name) => {
        try {
          return fs.statSync(path.join(dir, name)).isDirectory() && !name.startsWith('.');
        } catch {
          return false;
        }
      })
      .map((name) => {
        const projectDir = path.join(dir, name);
        const docsDir = path.join(projectDir, 'docs');
        const reportPath = path.join(docsDir, 'pipeline-report.json');
        const finalReqPath = path.join(docsDir, 'final-requirement.md');
        let report = null;
        let finalRequirement = null;
        try {
          if (fs.existsSync(reportPath)) report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
        } catch { }
        try {
          if (fs.existsSync(finalReqPath)) {
            finalRequirement = fs.readFileSync(finalReqPath, 'utf-8').slice(0, 300);
          }
        } catch { }
        return {
          name,
          mtime: fs.statSync(projectDir).mtime.toISOString(),
          report,
          finalRequirement,
        };
      })
      .sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
  } catch {
    return [];
  }
}

function readDaemonPortFromFile() {
  try {
    if (!fs.existsSync(DAEMON_PORT_FILE)) return null;
    const raw = JSON.parse(fs.readFileSync(DAEMON_PORT_FILE, 'utf-8'));
    const port = Number(raw?.port);
    if (!Number.isFinite(port) || port <= 0) return null;
    return port;
  } catch {
    return null;
  }
}

async function fetchDaemonStatusAtPort(port) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 1200);
  try {
    const res = await fetch(`http://localhost:${port}/status`, {
      signal: ctrl.signal,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { ...data, port };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function getDaemonStatus(portHint = null) {
  const now = Date.now();
  if (daemonStatusCache.data && now - daemonStatusCache.ts < 1200) {
    return daemonStatusCache.data;
  }

  const envPort = Number(portHint || process.env.DAEMON_PORT || process.env.PORT || 0);
  const filePort = readDaemonPortFromFile();
  const candidates = [];
  const seen = new Set();

  const addPort = (p) => {
    const n = Number(p);
    if (!Number.isFinite(n) || n <= 0 || seen.has(n)) return;
    seen.add(n);
    candidates.push(n);
  };

  addPort(envPort);
  addPort(filePort);
  for (let p = 8080; p <= 8090; p += 1) addPort(p);

  const results = await Promise.all(candidates.map((port) => fetchDaemonStatusAtPort(port)));
  for (let i = 0; i < candidates.length; i += 1) {
    const status = results[i];
    if (status?.daemon === 'ok') {
      daemonStatusCache = { ts: now, data: status };
      return status;
    }
  }

  const offline = {
    daemon: 'offline',
    isProcessing: false,
    queueLength: 0,
    currentProject: null,
    currentRequirement: null,
    port: null,
  };
  daemonStatusCache = { ts: now, data: offline };
  return offline;
}

function normalizePhaseStatus(status) {
  if (!status) return 'idle';
  const s = String(status).toLowerCase();
  if (s.includes('pass')) return 'passed';
  if (s.includes('fail') || s.includes('reject')) return 'failed';
  if (s.includes('run') || s.includes('process') || s.includes('progress')) return 'running';
  return 'idle';
}

export async function getWorkflowState(engineDir = ENGINE_DIR) {
  const cliConfig = loadCliConfig(engineDir);
  const projects = getProjects(engineDir);
  const latest = projects[0] || null;
  const phases = latest?.report?.phases || {};
  const daemon = await getDaemonStatus();

  const hasRunning = daemon?.isProcessing;
  const statusOf = (id, aliases = []) => {
    if (phases[id]) return normalizePhaseStatus(phases[id].status);
    for (const key of Object.keys(phases)) {
      const lower = key.toLowerCase();
      if (aliases.some((a) => lower.includes(a))) {
        return normalizePhaseStatus(phases[key]?.status);
      }
    }
    return hasRunning ? 'running' : 'idle';
  };

  const nodes = [
    { id: 'po', label: 'Product Owner', emoji: '🧠', cli: cliConfig.po, status: statusOf('po') },
    { id: 'frontend', label: 'Frontend Dev', emoji: '🎨', cli: cliConfig.frontend, status: statusOf('frontend', ['front', 'ui']) },
    { id: 'backend', label: 'Backend Dev', emoji: '⚙️', cli: cliConfig.backend, status: statusOf('backend', ['back', 'api', 'db']) },
    { id: 'reviewer', label: 'Reviewer', emoji: '🔍', cli: cliConfig.reviewer, status: statusOf('reviewer', ['review']) },
    { id: 'release', label: 'Release', emoji: '🚀', cli: cliConfig.release, status: statusOf('release') },
    { id: 'archivist', label: 'Archivist', emoji: '📚', cli: cliConfig.coder, status: statusOf('archivist', ['archiv']) },
  ];

  const edges = [
    { from: 'po', to: 'frontend' },
    { from: 'po', to: 'backend' },
    { from: 'frontend', to: 'reviewer' },
    { from: 'backend', to: 'reviewer' },
    { from: 'reviewer', to: 'release' },
    { from: 'release', to: 'archivist' },
  ];

  return {
    project: latest?.name || daemon?.currentProject || 'No active project',
    nodes,
    edges,
    daemon,
    phases,
    cliConfig,
    timestamp: new Date().toISOString(),
  };
}

export function buildAttachmentText(name, mimeType, textContent = '') {
  const safeName = name || 'attachment';
  const safeMime = mimeType || 'application/octet-stream';
  if (textContent) {
    return `[ATTACHMENT: ${safeName} | MIME: ${safeMime}]\n${textContent}`;
  }
  return `[ATTACHMENT: ${safeName} | MIME: ${safeMime} | binary content omitted]`;
}
