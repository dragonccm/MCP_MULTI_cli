import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync, exec } from 'child_process';

// ====================================================================
// AI Dev Team — Web Dashboard v2.0
// Features: Pipeline flow, CLI monitor, MCP status, Role assignment,
//           Live logs, DevOps controls, Agent graph, Message bus
// ====================================================================

const CLI_TOOLS = [
    { id: 'claude',  cmd: 'claude',      label: 'Claude Code',    color: '#f97316', badge: 'CL' },
    { id: 'gemini',  cmd: 'gemini',      label: 'Gemini CLI',     color: '#4285f4', badge: 'GM' },
    { id: 'copilot', cmd: 'gh copilot',  label: 'GitHub Copilot', color: '#238636', badge: 'CP' },
    { id: 'qwen',    cmd: 'qwen',        label: 'Qwen CLI',       color: '#9c27b0', badge: 'QW' },
];


// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

function checkCLI(cmd) {
    try {
        const out = execSync(`${cmd} --version 2>&1`, { timeout: 4000, stdio: 'pipe' })
            .toString().trim();
        return { available: true, version: out.split('\n')[0].substring(0, 60) };
    } catch {
        return { available: false, version: null };
    }
}

function checkMCPServer(engineDir) {
    const mcpDist  = path.join(engineDir, 'mcp-server', 'dist', 'index.js');
    const stitchCfg = path.join(engineDir, '.claude', 'mcp.json');
    let stitchOk = false;
    try {
        if (fs.existsSync(stitchCfg)) {
            const cfg = JSON.parse(fs.readFileSync(stitchCfg, 'utf-8'));
            stitchOk = !!(cfg?.mcpServers?.stitch || cfg?.mcpServers?.['stitch-mcp']);
        }
    } catch {}
    return {
        devTools: { available: fs.existsSync(mcpDist), path: mcpDist },
        stitch:   { available: stitchOk, note: stitchCfg },
    };
}

function loadCliConfig(engineDir) {
    const configPath = path.join(engineDir, 'cli-config.json');
    const defaults = {
        po:       process.env.PO_CLI       || 'gemini',
        frontend: process.env.FRONTEND_CLI || 'gemini',
        backend:  process.env.BACKEND_CLI  || 'gemini',
        reviewer: process.env.REVIEWER_CLI || 'gemini',
        release:  process.env.RELEASE_CLI  || 'gemini',
    };
    try {
        if (fs.existsSync(configPath))
            return { ...defaults, ...JSON.parse(fs.readFileSync(configPath, 'utf-8')) };
    } catch {}
    return defaults;
}

function saveCliConfig(engineDir, config) {
    fs.writeFileSync(path.join(engineDir, 'cli-config.json'), JSON.stringify(config, null, 2));
}

function getProjects(engineDir) {
    const dir = path.join(engineDir, 'projects');
    if (!fs.existsSync(dir)) return [];
    try {
        return fs.readdirSync(dir)
            .filter(f => {
                try { return fs.statSync(path.join(dir, f)).isDirectory() && !f.startsWith('.'); }
                catch { return false; }
            })
            .map(name => {
                const docsDir  = path.join(dir, name, 'docs');
                const report   = path.join(docsDir, 'pipeline-report.json');
                const release  = path.join(docsDir, 'release-report.md');
                let pipelineData = null, deployUrl = null;
                try { if (fs.existsSync(report))  pipelineData = JSON.parse(fs.readFileSync(report, 'utf-8')); } catch {}
                try {
                    if (fs.existsSync(release)) {
                        const txt = fs.readFileSync(release, 'utf-8');
                        const m = txt.match(/https?:\/\/[^\s)>"]+/);
                        if (m) deployUrl = m[0];
                    }
                } catch {}
                const mtime = fs.statSync(path.join(dir, name)).mtime;
                return { name, report: pipelineData, deployUrl, mtime };
            })
            .sort((a, b) => new Date(b.mtime) - new Date(a.mtime))
            .slice(0, 20);
    } catch { return []; }
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', d => body += d);
        req.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
        req.on('error', reject);
    });
}

function runShell(cmd, cwd) {
    return new Promise((resolve) => {
        exec(cmd, { cwd, timeout: 60000 }, (err, stdout, stderr) => {
            resolve({ ok: !err, stdout: (stdout || '').trim(), stderr: (stderr || '').trim(), code: err?.code });
        });
    });
}

// ────────────────────────────────────────────────────────────────────
// Dashboard Class
// ────────────────────────────────────────────────────────────────────

class DevTeamDashboard {
    constructor(projectName, agents, maxBudgetUsd) {
        this.projectName   = projectName || 'Workspace';
        this.agents        = agents || [];
        this.maxBudgetUsd  = maxBudgetUsd || 0;
        this.port          = 3000;
        this.engineDir     = process.cwd();
        this.clients       = new Set();
        this.phaseStatuses = {};   // phaseId → 'idle'|'running'|'passed'|'failed'
        this.currentStatus = 'Waiting for pipeline...';
        this._cliCache     = null;
        this._cliCacheTime = 0;

        this.server = this.createServer();
        this.server.listen(this.port, () => {
            console.log(`\n\x1b[1m\x1b[36m🌐  DASHBOARD → http://localhost:${this.port}\x1b[0m\n`);
        });

        this.messageLogPath = path.join(this.engineDir, 'docs', 'graph-messages.log');
        this._tailFile(this.messageLogPath);
    }

    // ── Tail log file for inter-agent messages ──
    _tailFile(filePath) {
        let lastSize = 0;
        setInterval(() => {
            if (!fs.existsSync(filePath)) return;
            try {
                const stats = fs.statSync(filePath);
                if (stats.size <= lastSize) return;
                const stream = fs.createReadStream(filePath, { start: lastSize, encoding: 'utf-8' });
                stream.on('data', chunk => {
                    chunk.split('\n').filter(l => l.trim()).forEach(line => {
                        try { this.broadcast('graph_message', JSON.parse(line)); } catch {}
                    });
                });
                lastSize = stats.size;
            } catch {}
        }, 1000);
    }

    // ── CLI status (cached 30s) ──
    _getCLIStatus() {
        if (this._cliCache && Date.now() - this._cliCacheTime < 30000)
            return this._cliCache;
        const result = {};
        for (const tool of CLI_TOOLS)
            result[tool.id] = { ...tool, ...checkCLI(tool.cmd) };
        this._cliCache     = result;
        this._cliCacheTime = Date.now();
        return result;
    }

    // ── HTTP Server ──
    createServer() {
        const self = this;
        return http.createServer(async (req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

            const url = req.url.split('?')[0];

            // ── HTML Dashboard ──
            if (url === '/') {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(self.getHtml());
                return;
            }

            // ── SSE Stream ──
            if (url === '/events') {
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                });
                res.write(': keep-alive\n\n');
                self.clients.add(res);
                res.write(`data: ${JSON.stringify({
                    type:          'init',
                    projectName:   self.projectName,
                    agents:        self.agents,
                    maxBudgetUsd:  self.maxBudgetUsd,
                    phaseStatuses: self.phaseStatuses,
                    status:        self.currentStatus,
                })}\n\n`);
                req.on('close', () => self.clients.delete(res));
                return;
            }

            // ── REST API ──
            if (url === '/api/cli-status') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(self._getCLIStatus()));
                return;
            }

            if (url === '/api/mcp-status') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(checkMCPServer(self.engineDir)));
                return;
            }

            if (url === '/api/cli-config') {
                if (req.method === 'GET') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(loadCliConfig(self.engineDir)));
                } else if (req.method === 'POST') {
                    try {
                        const cfg = await parseBody(req);
                        saveCliConfig(self.engineDir, cfg);
                        self.broadcast('cli_config_updated', { config: cfg });
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ ok: true }));
                    } catch (e) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: e.message }));
                    }
                }
                return;
            }

            if (url === '/api/projects') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(getProjects(self.engineDir)));
                return;
            }

            if (url === '/api/devops' && req.method === 'POST') {
                try {
                    const { action, projectName: pName } = await parseBody(req);
                    const projectDir = pName
                        ? path.join(self.engineDir, 'projects', pName)
                        : self.engineDir;

                    let result;
                    if (action === 'build') {
                        result = await runShell('npm run build 2>&1 || true', projectDir);
                    } else if (action === 'test') {
                        result = await runShell('npm test 2>&1 || true', projectDir);
                    } else if (action === 'deploy') {
                        result = await runShell('vercel --yes 2>&1 || echo "vercel not configured"', projectDir);
                    } else if (action === 'pr') {
                        result = await runShell(
                            'gh pr create --fill 2>&1 || echo "gh cli not authenticated"',
                            projectDir
                        );
                    } else if (action === 'git-status') {
                        result = await runShell('git status --short && git log --oneline -5', projectDir);
                    } else {
                        result = { ok: false, stdout: '', stderr: 'Unknown action' };
                    }

                    self.broadcast('devops_result', { action, ...result });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: e.message }));
                }
                return;
            }

            if (url === '/api/launch' && req.method === 'POST') {
                try {
                    const body = await parseBody(req);
                    // Forward to daemon on port 8080 if running
                    const r = await fetch('http://localhost:8080/enqueue', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                    }).catch(() => null);
                    if (r && r.ok) {
                        const data = await r.json();
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(data));
                    } else {
                        res.writeHead(503, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Daemon not running. Start with: node orchestrator.js --daemon' }));
                    }
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: e.message }));
                }
                return;
            }

            res.writeHead(404); res.end('Not found');
        });
    }

    // ── Broadcast SSE ──
    broadcast(type, payload) {
        const msg  = JSON.stringify({ type, ...payload });
        const dead = [];
        for (const client of this.clients) {
            try { client.write(`data: ${msg}\n\n`); }
            catch { dead.push(client); }
        }
        dead.forEach(c => this.clients.delete(c));
    }

    // ── Public API (called by orchestrator) ──
    updateStatus(status)                        { this.currentStatus = status; this.broadcast('status', { status }); }
    logToAgent(phaseId, text)                   { this.broadcast('log', { phaseId, text }); }
    updateBudget(usedUsd)                       { this.broadcast('budget', { usedUsd, maxBudgetUsd: this.maxBudgetUsd }); }
    updatePhaseStatus(phaseId, status, elapsed) {
        this.phaseStatuses[phaseId] = { status, elapsed };
        this.broadcast('phase_update', { phaseId, status, elapsed });
    }

    destroy() {
        if (this.server) this.server.close();
        for (const client of this.clients) { try { client.end(); } catch {} }
    }

    // ────────────────────────────────────────────────────────────────
    // HTML Dashboard
    // ────────────────────────────────────────────────────────────────
    getHtml() { return HTML_TEMPLATE; }
}

// ====================================================================
// HTML Template (inline for zero-dependency serving)
// ====================================================================
const HTML_TEMPLATE = /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Dev Team — Control Center</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
<script>tailwind.config={darkMode:'class',theme:{extend:{fontFamily:{sans:['Inter','sans-serif'],mono:['JetBrains Mono','monospace']}}}}</script>
<style>
*{box-sizing:border-box}
:root{
  --bg:#030712;
  --s1:rgba(15,23,42,0.9);
  --s2:rgba(15,23,42,0.6);
  --border:rgba(255,255,255,0.07);
  --border2:rgba(255,255,255,0.12);
  --text:#e2e8f0;
  --muted:#475569;
  --accent:#3b82f6;
}
html,body{height:100%;margin:0;overflow:hidden;background:var(--bg);color:var(--text);font-family:'Inter',sans-serif}
body{background-image:
  radial-gradient(ellipse at 10% 20%,rgba(59,130,246,0.06) 0%,transparent 50%),
  radial-gradient(ellipse at 90% 80%,rgba(139,92,246,0.06) 0%,transparent 50%),
  radial-gradient(ellipse at 50% 50%,rgba(16,185,129,0.03) 0%,transparent 70%)}

/* Scrollbars */
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#1e293b;border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:#334155}

/* Glass panels */
.glass{background:var(--s1);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid var(--border)}
.glass2{background:var(--s2);backdrop-filter:blur(12px);border:1px solid var(--border)}

/* Pulse dot */
.dot{display:inline-block;width:7px;height:7px;border-radius:50%;flex-shrink:0}
.dot-green{background:#10b981;box-shadow:0 0 6px #10b981}
.dot-red{background:#ef4444;box-shadow:0 0 6px #ef4444}
.dot-yellow{background:#f59e0b;box-shadow:0 0 6px #f59e0b}
.dot-blue{background:#3b82f6;box-shadow:0 0 8px #3b82f6}
.dot-gray{background:#475569}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
.dot-pulse{animation:blink 1.4s ease infinite}

/* Pipeline nodes */
.pipe-node{
  position:relative;padding:8px 14px;border-radius:10px;
  border:1px solid var(--border2);background:var(--s1);
  cursor:default;transition:all 0.3s;white-space:nowrap;
  display:flex;flex-direction:column;align-items:center;gap:3px;min-width:90px
}
.pipe-node.idle{border-color:rgba(71,85,105,0.5)}
.pipe-node.running{border-color:#3b82f6;box-shadow:0 0 12px rgba(59,130,246,0.35);background:rgba(59,130,246,0.08)}
.pipe-node.passed{border-color:#10b981;box-shadow:0 0 10px rgba(16,185,129,0.25);background:rgba(16,185,129,0.06)}
.pipe-node.failed{border-color:#ef4444;box-shadow:0 0 10px rgba(239,68,68,0.25);background:rgba(239,68,68,0.06)}
.pipe-arrow{color:#334155;font-size:18px;line-height:1;padding:0 4px;flex-shrink:0}

/* Log terminal */
.terminal{font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.65;color:#94a3b8;overflow-y:auto;height:100%;padding:12px 16px}
.log-think{color:#374151;font-style:italic}
.log-code{color:#38bdf8;background:rgba(56,189,248,0.08);padding:8px 12px;border-radius:6px;display:block;margin:6px 0;border-left:2px solid #38bdf8}
.log-success{color:#34d399;font-weight:600}
.log-error{color:#f87171;font-weight:600}
.log-warn{color:#fbbf24}
.log-section{color:#c084fc;font-weight:600;margin-top:8px}

/* Tabs */
.tab-btn{padding:6px 14px;border-radius:6px 6px 0 0;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s;border:1px solid transparent;border-bottom:none;white-space:nowrap;flex-shrink:0}
.tab-btn.active{background:var(--s1);border-color:var(--border2);color:#e2e8f0}
.tab-btn.inactive{color:#64748b;background:transparent}
.tab-btn.inactive:hover{color:#94a3b8;background:rgba(255,255,255,0.03)}

/* Action buttons */
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s;border:1px solid;white-space:nowrap}
.btn-primary{background:rgba(59,130,246,0.15);border-color:rgba(59,130,246,0.4);color:#93c5fd}
.btn-primary:hover{background:rgba(59,130,246,0.25);border-color:#3b82f6}
.btn-success{background:rgba(16,185,129,0.12);border-color:rgba(16,185,129,0.35);color:#6ee7b7}
.btn-success:hover{background:rgba(16,185,129,0.2);border-color:#10b981}
.btn-warn{background:rgba(245,158,11,0.12);border-color:rgba(245,158,11,0.35);color:#fde68a}
.btn-warn:hover{background:rgba(245,158,11,0.2);border-color:#f59e0b}
.btn-danger{background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.35);color:#fca5a5}
.btn-danger:hover{background:rgba(239,68,68,0.2);border-color:#ef4444}
.btn-ghost{background:rgba(255,255,255,0.04);border-color:var(--border2);color:#94a3b8}
.btn-ghost:hover{background:rgba(255,255,255,0.08);color:#e2e8f0}
.btn:disabled{opacity:0.4;cursor:not-allowed}

/* Select */
select.sel{background:rgba(15,23,42,0.9);border:1px solid var(--border2);color:#e2e8f0;border-radius:6px;padding:5px 8px;font-size:12px;outline:none;cursor:pointer;appearance:auto}
select.sel:focus{border-color:#3b82f6}

/* Input */
input.inp,textarea.inp{background:rgba(15,23,42,0.9);border:1px solid var(--border2);color:#e2e8f0;border-radius:6px;padding:7px 10px;font-size:12px;outline:none;width:100%;font-family:inherit}
input.inp:focus,textarea.inp:focus{border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,0.15)}
input.inp::placeholder,textarea.inp::placeholder{color:#475569}

/* Section label */
.sec-label{font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#475569;margin-bottom:8px;display:flex;align-items:center;gap:6px}
.sec-label::after{content:'';flex:1;height:1px;background:var(--border)}

/* Fade in */
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.fade-in{animation:fadeIn 0.3s ease}

/* Notification toast */
#toast{position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.toast-item{padding:10px 16px;border-radius:8px;font-size:13px;font-weight:500;backdrop-filter:blur(16px);animation:fadeIn 0.2s ease;pointer-events:auto}
.toast-ok{background:rgba(16,185,129,0.2);border:1px solid rgba(16,185,129,0.4);color:#6ee7b7}
.toast-err{background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);color:#fca5a5}
.toast-info{background:rgba(59,130,246,0.2);border:1px solid rgba(59,130,246,0.4);color:#93c5fd}

/* Spin */
@keyframes spin{to{transform:rotate(360deg)}}
.spin{animation:spin 1s linear infinite}

/* Busy overlay for devops output */
#devops-out{font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.5;color:#94a3b8;overflow-y:auto;max-height:140px;white-space:pre-wrap;word-break:break-all}
</style>
</head>
<body class="flex flex-col h-full">

<!-- ═══════════════════════════════════════════════════════════ HEADER -->
<header class="glass flex items-center justify-between px-5 py-2.5 border-b border-white/[0.07] shrink-0 z-20">
  <div class="flex items-center gap-3">
    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-[0_0_14px_rgba(99,102,241,0.5)]">
      <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
    </div>
    <div>
      <div class="text-sm font-bold tracking-tight bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">AI Dev Team</div>
      <div class="flex items-center gap-2 text-[10px] font-mono text-slate-500">
        <span id="hdr-project">Control Center</span>
        <span>•</span>
        <span id="hdr-conn" class="flex items-center gap-1"><span class="dot dot-yellow dot-pulse"></span>Connecting</span>
      </div>
    </div>
  </div>

  <!-- Pipeline mini-breadcrumb -->
  <div id="pipe-strip" class="flex items-center gap-1 flex-1 justify-center px-6 overflow-x-auto">
    <span class="text-slate-600 text-xs italic">Waiting for pipeline...</span>
  </div>

  <!-- Budget + Clock -->
  <div class="flex items-center gap-4 shrink-0">
    <div class="flex flex-col items-end gap-1">
      <div class="flex items-center gap-2 text-[11px] font-mono text-slate-400">
        <svg class="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span id="budget-text" class="text-emerald-400 font-semibold">$0.00</span>
      </div>
      <div class="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div id="budget-bar" class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 shadow-[0_0_6px_#10b981]" style="width:0%"></div>
      </div>
    </div>
    <div class="text-right">
      <div id="clock" class="text-sm font-mono font-semibold text-slate-300">00:00:00</div>
      <div id="elapsed" class="text-[10px] font-mono text-slate-600">Idle</div>
    </div>
  </div>
</header>

<!-- ═══════════════════════════════════════ STATUS BAR -->
<div class="flex items-center justify-between px-5 py-1.5 border-b border-white/[0.05] bg-slate-900/40 shrink-0 z-10">
  <div class="flex items-center gap-2 text-[11px] font-mono">
    <svg id="status-icon" class="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2" class="opacity-25"/><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" class="opacity-75 spin"/></svg>
    <span id="status-line" class="text-slate-400">Waiting...</span>
  </div>
  <div class="flex items-center gap-3 text-[10px] font-mono text-slate-600">
    <span id="clients-badge">0 viewers</span>
  </div>
</div>

<!-- ═══════════════════════════════════════ MAIN LAYOUT -->
<div class="flex flex-1 overflow-hidden">

  <!-- ══════════════ LEFT SIDEBAR -->
  <aside class="w-60 flex flex-col gap-0 overflow-y-auto border-r border-white/[0.07] glass2 shrink-0">
    <div class="p-3 flex flex-col gap-4">

      <!-- CLI Status -->
      <div>
        <div class="sec-label">CLI Status</div>
        <div id="cli-list" class="flex flex-col gap-1.5">
          <div class="text-xs text-slate-600 italic">Checking...</div>
        </div>
        <button onclick="refreshCLI()" class="btn btn-ghost mt-2 w-full justify-center text-[11px]">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Refresh
        </button>
      </div>

      <!-- MCP Status -->
      <div>
        <div class="sec-label">MCP Servers</div>
        <div id="mcp-list" class="flex flex-col gap-1.5">
          <div class="text-xs text-slate-600 italic">Checking...</div>
        </div>
      </div>

      <!-- Role Assignment -->
      <div>
        <div class="sec-label">Role Assignment</div>
        <div class="flex flex-col gap-1.5" id="role-form">
          <!-- Generated by JS -->
        </div>
        <button onclick="saveRoles()" class="btn btn-primary mt-2.5 w-full justify-center text-[11px]">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
          Save Config
        </button>
      </div>

      <!-- Launch Project -->
      <div>
        <div class="sec-label">Launch Project</div>
        <div class="flex flex-col gap-2">
          <input id="launch-name" type="text" placeholder="project-name" class="inp">
          <div class="flex gap-2 items-center">
            <span class="text-[10px] text-slate-500 shrink-0">Mode:</span>
            <select id="launch-mode" class="sel flex-1">
              <option value="">Normal</option>
              <option value="--flash">Flash</option>
              <option value="--update">Update</option>
              <option value="--fix">Fix</option>
            </select>
          </div>
          <textarea id="launch-req" rows="3" placeholder="Describe your requirement..." class="inp resize-none text-[11px]"></textarea>
          <button onclick="launchProject()" class="btn btn-success w-full justify-center">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Launch
          </button>
          <div id="launch-status" class="text-[10px] font-mono text-slate-600 text-center hidden"></div>
        </div>
      </div>

      <!-- Recent Projects -->
      <div>
        <div class="sec-label">Recent Projects</div>
        <div id="projects-list" class="flex flex-col gap-1 max-h-40 overflow-y-auto">
          <div class="text-xs text-slate-600 italic">Loading...</div>
        </div>
      </div>

    </div>
  </aside>

  <!-- ══════════════ CENTER — LOGS -->
  <main class="flex-1 flex flex-col overflow-hidden">

    <!-- Tabs -->
    <div class="flex items-end gap-0 px-3 pt-2 border-b border-white/[0.07] overflow-x-auto shrink-0 bg-slate-950/50" id="log-tabs">
      <span class="text-[11px] text-slate-600 italic px-3 pb-2">No agents active</span>
    </div>

    <!-- Log Content -->
    <div class="flex-1 overflow-hidden relative" id="log-pane">
      <div class="absolute inset-0 flex items-center justify-center text-slate-700 text-sm font-mono">
        Waiting for pipeline to start...
      </div>
    </div>

  </main>

  <!-- ══════════════ RIGHT PANEL -->
  <aside class="w-72 flex flex-col gap-0 border-l border-white/[0.07] glass2 overflow-y-auto shrink-0">
    <div class="p-3 flex flex-col gap-4">

      <!-- DevOps Actions -->
      <div>
        <div class="sec-label">DevOps Controls</div>
        <div class="flex flex-col gap-2">
          <div class="flex gap-2">
            <select id="devops-project" class="sel flex-1">
              <option value="">Current project</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            <button onclick="devops('build')" class="btn btn-ghost justify-center text-[11px]">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              Build
            </button>
            <button onclick="devops('test')" class="btn btn-ghost justify-center text-[11px]">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
              Tests
            </button>
            <button onclick="devops('deploy')" class="btn btn-success justify-center text-[11px]">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
              Deploy
            </button>
            <button onclick="devops('pr')" class="btn btn-primary justify-center text-[11px]">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
              Create PR
            </button>
            <button onclick="devops('git-status')" class="btn btn-ghost justify-center text-[11px] col-span-2">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/></svg>
              Git Status
            </button>
          </div>
          <div id="devops-out" class="glass rounded-lg p-2 text-[10px] font-mono text-slate-500 hidden min-h-10 max-h-36 overflow-y-auto whitespace-pre-wrap"></div>
          <div id="deploy-url" class="hidden">
            <a id="deploy-link" href="#" target="_blank" class="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 break-all">
              <svg class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              <span id="deploy-link-text"></span>
            </a>
          </div>
        </div>
      </div>

      <!-- Agent Network Graph -->
      <div>
        <div class="sec-label">Agent Network</div>
        <div class="glass rounded-xl overflow-hidden" style="height:200px">
          <div id="graph-net" style="height:100%;background:rgba(2,6,23,0.5)"></div>
        </div>
        <div class="flex justify-between mt-1 text-[10px] font-mono text-slate-600">
          <span id="graph-nodes">0 nodes</span>
          <span id="graph-edges">0 edges</span>
        </div>
      </div>

      <!-- Message Bus -->
      <div class="flex-1">
        <div class="sec-label flex justify-between">
          <span>Message Bus</span>
          <button onclick="clearMessages()" class="text-[9px] text-slate-600 hover:text-slate-400">clear</button>
        </div>
        <div id="msg-bus" class="flex flex-col gap-2 overflow-y-auto" style="max-height:300px">
          <div class="text-[11px] text-slate-600 italic text-center py-3">No messages yet</div>
        </div>
      </div>

    </div>
  </aside>

</div><!-- /main layout -->

<!-- Toast container -->
<div id="toast"></div>

<!-- ═══════════════════════════════════════ SCRIPTS -->
<script>
// ─── State ───────────────────────────────────────────────────────
const S = {
  agents: [], activeTab: null, logs: {}, tabPanes: {},
  phases: [], phaseStatuses: {},
  cliConfig: {}, cliStatus: {}, mcpStatus: {},
  projects: [], msgCount: 0,
  budget: { used: 0, max: 0 },
  startTime: null, elapsed: 0,
  inThink: {},
};

const PHASE_ORDER = ['coordinator','po','dev','reviewer','release','archivist'];

// ─── Boot ─────────────────────────────────────────────────────────
async function boot() {
  startClock();
  await Promise.all([loadCLIStatus(), loadMCPStatus(), loadCLIConfig(), loadProjects()]);
  buildRoleForm();
  connectSSE();
}

// ─── Clock ────────────────────────────────────────────────────────
function startClock() {
  setInterval(() => {
    document.getElementById('clock').textContent = new Date().toLocaleTimeString();
    if (S.startTime) {
      const s = Math.floor((Date.now() - S.startTime) / 1000);
      const h = String(Math.floor(s/3600)).padStart(2,'0');
      const m = String(Math.floor((s%3600)/60)).padStart(2,'0');
      const sc = String(s%60).padStart(2,'0');
      document.getElementById('elapsed').textContent = \`Elapsed \${h}:\${m}:\${sc}\`;
    }
  }, 1000);
}

// ─── SSE ──────────────────────────────────────────────────────────
function connectSSE() {
  const es = new EventSource('/events');
  es.onopen = () => setConn(true);
  es.onerror = () => { setConn(false); setTimeout(connectSSE, 3000); es.close(); };
  es.onmessage = (e) => handleEvent(JSON.parse(e.data));
}

function setConn(ok) {
  const el = document.getElementById('hdr-conn');
  el.innerHTML = ok
    ? '<span class="dot dot-green dot-pulse"></span>Live'
    : '<span class="dot dot-red dot-pulse"></span>Reconnecting...';
}

function handleEvent(d) {
  if (d.type === 'init')           onInit(d);
  else if (d.type === 'status')    onStatus(d.status);
  else if (d.type === 'log')       onLog(d.phaseId, d.text);
  else if (d.type === 'budget')    onBudget(d.usedUsd, d.maxBudgetUsd);
  else if (d.type === 'phase_update') onPhaseUpdate(d.phaseId, d.status, d.elapsed);
  else if (d.type === 'graph_message')  onGraphMsg(d);
  else if (d.type === 'devops_result')  onDevopsResult(d);
  else if (d.type === 'agents_updated') onAgentsUpdated(d.agents);
}

// ─── Init ─────────────────────────────────────────────────────────
function onInit(d) {
  document.getElementById('hdr-project').textContent = d.projectName;
  S.startTime = Date.now();
  S.budget.max = d.maxBudgetUsd || 0;
  S.agents = d.agents || [];
  S.phaseStatuses = d.phaseStatuses || {};

  // Build pipeline strip
  buildPipelineStrip(S.agents);

  // Build agent tabs + log panes
  buildAgentLogs(S.agents);

  // Build graph
  buildGraph(S.agents);

  onStatus(d.status || 'Pipeline initialised');
}

// ─── Pipeline strip ───────────────────────────────────────────────
function buildPipelineStrip(agents) {
  const strip = document.getElementById('pipe-strip');
  if (!agents.length) return;

  // Group parallel agents
  const groups = [];
  const seen = new Set();
  for (const a of agents) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    if (a.parallel) {
      let g = groups.find(x => x.parallel === a.parallel);
      if (!g) { g = { parallel: a.parallel, members: [] }; groups.push(g); }
      g.members.push(a);
    } else {
      groups.push({ single: a });
    }
  }

  strip.innerHTML = '';
  groups.forEach((g, i) => {
    if (i > 0) {
      const arr = document.createElement('span');
      arr.className = 'pipe-arrow';
      arr.textContent = '→';
      strip.appendChild(arr);
    }
    if (g.single) {
      strip.appendChild(makePhaseNode(g.single));
    } else {
      const wrap = document.createElement('div');
      wrap.className = 'flex flex-col gap-1 items-center';
      g.members.forEach(a => wrap.appendChild(makePhaseNode(a)));
      const badge = document.createElement('div');
      badge.className = 'text-[9px] text-slate-600 font-mono';
      badge.textContent = '‖ parallel';
      wrap.appendChild(badge);
      strip.appendChild(wrap);
    }
  });
}

function makePhaseNode(agent) {
  const st = (S.phaseStatuses[agent.id] || {}).status || 'idle';
  const el = document.createElement('div');
  el.id = 'pipe-' + agent.id;
  el.className = 'pipe-node ' + st;
  el.innerHTML = \`
    <span class="text-base">\${agent.emoji || '🤖'}</span>
    <span class="text-[10px] font-semibold text-slate-300">\${(agent.name||agent.id).split(' ')[0]}</span>
    <span class="text-[9px] font-mono text-slate-500 pipe-status-\${agent.id}">\${st}</span>
  \`;
  el.title = agent.cli ? \`CLI: \${agent.cli}\` : '';
  return el;
}

function onPhaseUpdate(phaseId, status, elapsed) {
  S.phaseStatuses[phaseId] = { status, elapsed };
  const el = document.getElementById('pipe-' + phaseId);
  if (el) {
    el.className = 'pipe-node ' + status;
    const st = el.querySelector('.pipe-status-' + phaseId);
    if (st) st.textContent = elapsed ? \`\${status} \${elapsed}\` : status;
  }
  // Highlight tab
  const tab = document.querySelector('[data-tab="' + phaseId + '"]');
  if (tab) {
    tab.className = 'tab-btn ' + (S.activeTab === phaseId ? 'active' : 'inactive');
    const dot = tab.querySelector('.tab-dot');
    if (dot) dot.className = 'dot ' + statusDotClass(status) + ' tab-dot';
  }
}

function statusDotClass(s) {
  return s==='running'?'dot-blue dot-pulse':s==='passed'?'dot-green':s==='failed'?'dot-red':'dot-gray';
}

// ─── Agent Logs ───────────────────────────────────────────────────
function buildAgentLogs(agents) {
  const tabsEl = document.getElementById('log-tabs');
  const paneEl = document.getElementById('log-pane');
  tabsEl.innerHTML = '';
  paneEl.innerHTML = '';
  S.logs = {}; S.tabPanes = {}; S.inThink = {};

  if (!agents.length) return;

  agents.forEach((agent, i) => {
    S.logs[agent.id] = '';
    S.inThink[agent.id] = false;

    // Tab button
    const btn = document.createElement('button');
    btn.className = 'tab-btn ' + (i === 0 ? 'active' : 'inactive');
    btn.setAttribute('data-tab', agent.id);
    btn.onclick = () => switchTab(agent.id);
    btn.innerHTML = \`<span class="dot dot-gray tab-dot mr-1.5"></span>\${agent.emoji || ''} \${agent.name || agent.id}\`;
    tabsEl.appendChild(btn);

    // Log pane
    const pane = document.createElement('div');
    pane.id = 'pane-' + agent.id;
    pane.className = 'absolute inset-0 overflow-hidden ' + (i === 0 ? '' : 'hidden');
    pane.innerHTML = \`
      <div class="flex items-center justify-between px-4 py-2 border-b border-white/[0.05] bg-slate-900/60 shrink-0">
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span class="text-lg">\${agent.emoji||'🤖'}</span>
          <span class="font-semibold">\${agent.name||agent.id}</span>
          <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-blue-400">\${agent.id}</span>
          <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-violet-400 agent-cli-\${agent.id}">\${agent.cli||'?'}</span>
        </div>
        <button onclick="clearLog('\${agent.id}')" class="text-[10px] text-slate-600 hover:text-slate-400">clear</button>
      </div>
      <div class="terminal" id="log-\${agent.id}"><span class="text-slate-600 italic">// Waiting for agent output...</span></div>
    \`;
    paneEl.appendChild(pane);
    S.tabPanes[agent.id] = pane;
  });

  if (agents.length) switchTab(agents[0].id);
}

function switchTab(id) {
  S.activeTab = id;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.className = 'tab-btn ' + (b.getAttribute('data-tab') === id ? 'active' : 'inactive');
  });
  Object.entries(S.tabPanes).forEach(([k, el]) => {
    el.classList.toggle('hidden', k !== id);
  });
}

function clearLog(id) {
  const el = document.getElementById('log-' + id);
  if (el) el.innerHTML = '<span class="text-slate-600 italic">// Log cleared</span>';
}

// ─── Log rendering ────────────────────────────────────────────────
function onLog(phaseId, text) {
  const el = document.getElementById('log-' + phaseId);
  if (!el) return;

  if (text.includes('<think>')) { S.inThink[phaseId] = true; appendLog(el, '<div class="log-think flex items-center gap-2"><svg class="w-3 h-3 spin" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 010 16z" opacity=".25"/><path d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>Thinking...</div>'); return; }
  if (text.includes('</think>')) { S.inThink[phaseId] = false; appendLog(el, '<div class="log-success">✓ Ready</div>'); return; }
  if (S.inThink[phaseId]) return;

  let html = escHtml(text);

  // Code blocks
  html = html.replace(/\`\`\`([\s\S]*?)\`\`\`/g, '<pre class="log-code">$1</pre>');
  // Inline code
  html = html.replace(/\`([^\`]+)\`/g, '<code style="color:#38bdf8;background:rgba(56,189,248,0.1);padding:1px 5px;border-radius:3px">$1</code>');
  // Success markers
  html = html.replace(/(✅|PASSED|SUCCESS|Deployed|Done)/gi, '<span class="log-success">$1</span>');
  // Error markers
  html = html.replace(/(❌|FAILED|ERROR|error:)/gi, '<span class="log-error">$1</span>');
  // Warnings
  html = html.replace(/(⚠️|WARNING|WARN)/gi, '<span class="log-warn">$1</span>');
  // Section headers (## or ###)
  html = html.replace(/^(#{1,3} .+)$/gm, '<span class="log-section">$1</span>');
  // URLs
  html = html.replace(/(https?:\\/\\/[^\\s<>"]+)/g, '<a href="$1" target="_blank" class="text-blue-400 hover:underline">$1</a>');

  appendLog(el, '<div style="margin-bottom:1px">' + html + '</div>');
}

function appendLog(el, html) {
  const frag = document.createElement('div');
  frag.style.display = 'contents';
  frag.innerHTML = html;
  el.appendChild(frag);
  if (el.scrollHeight - el.scrollTop < el.clientHeight + 120)
    el.scrollTop = el.scrollHeight;
}

function escHtml(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── Budget ───────────────────────────────────────────────────────
function onBudget(used, max) {
  S.budget = { used, max };
  const t = document.getElementById('budget-text');
  const b = document.getElementById('budget-bar');
  if (max > 0) {
    t.textContent = \`\$\${used.toFixed(3)} / \$\${max.toFixed(2)}\`;
    const pct = Math.min((used/max)*100, 100);
    b.style.width = pct + '%';
    if (pct > 85) { b.style.background = 'linear-gradient(90deg,#ef4444,#f97316)'; b.style.boxShadow='0 0 6px #ef4444'; t.style.color='#f87171'; }
    else if (pct > 60) { b.style.background = 'linear-gradient(90deg,#f59e0b,#f97316)'; t.style.color='#fde68a'; }
  } else {
    t.textContent = \`\$\${used.toFixed(3)} used\`;
    b.style.width = '100%';
    b.style.background = 'linear-gradient(90deg,#3b82f6,#8b5cf6)';
  }
}

// ─── Status ───────────────────────────────────────────────────────
function onStatus(status) {
  document.getElementById('status-line').textContent = status;
}

// ─── Graph ────────────────────────────────────────────────────────
let graphNet, graphNodes, graphEdges;
function buildGraph(agents) {
  graphNodes = new vis.DataSet([{
    id: 'orch', label: 'Orchestrator', shape: 'hexagon',
    color: { background:'#4c1d95', border:'#a78bfa' },
    font: { color:'#e2e8f0', face:'JetBrains Mono', size:10 }
  }]);
  graphEdges = new vis.DataSet([]);

  agents.forEach(a => {
    graphNodes.add({ id: a.id, label: (a.emoji||'') + ' ' + (a.name||a.id),
      shape:'box', color:{ background:'#0f172a', border:'#38bdf8' },
      font:{ color:'#38bdf8', face:'JetBrains Mono', size:9 } });
    graphEdges.add({ from:'orch', to:a.id, dashes:true, color:'#1e293b', arrows:{to:{scaleFactor:0.5}} });
  });

  const container = document.getElementById('graph-net');
  graphNet = new vis.Network(container, { nodes: graphNodes, edges: graphEdges }, {
    nodes:{ shadow:{ enabled:true, color:'rgba(56,189,248,0.3)', size:8 } },
    edges:{ width:1.5, smooth:{ type:'curvedCW', roundness:0.25 } },
    physics:{ solver:'forceAtlas2Based', forceAtlas2Based:{ gravitationalConstant:-40, centralGravity:0.01, springLength:80 } },
    interaction:{ hover:true }
  });
  document.getElementById('graph-nodes').textContent = (agents.length+1) + ' nodes';
  document.getElementById('graph-edges').textContent = agents.length + ' edges';
}

// ─── Message Bus ──────────────────────────────────────────────────
let msgHasItems = false;
function onGraphMsg(d) {
  const el = document.getElementById('msg-bus');
  if (!msgHasItems) { el.innerHTML = ''; msgHasItems = true; }
  S.msgCount++;

  // Flash graph edge
  if (graphEdges && d.from && d.to) {
    try {
      const eid = d.from + '->' + d.to;
      if (!graphEdges.get(eid)) graphEdges.add({ id:eid, from:d.from, to:d.to, color:'#8b5cf6', width:2, arrows:{to:{scaleFactor:0.5}} });
      if (graphNodes.get(d.to)) {
        graphNodes.update({ id:d.to, color:{ border:'#e879f9' }, shadow:{ color:'rgba(232,121,249,0.8)', size:12 } });
        setTimeout(() => graphNodes.update({ id:d.to, color:{ border:'#38bdf8' }, shadow:{ color:'rgba(56,189,248,0.3)', size:8 } }), 1200);
      }
    } catch {}
  }

  const t = d.time ? new Date(d.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'}) : '';
  const card = document.createElement('div');
  card.className = 'glass rounded-lg p-2.5 text-[11px] fade-in border-l-2 border-violet-500';
  card.innerHTML = \`
    <div class="flex justify-between items-center mb-1">
      <span class="font-mono text-violet-400 text-[10px] font-semibold">\${escHtml(d.from||'')} → \${escHtml(d.to||'')}</span>
      <span class="text-slate-600 text-[9px] font-mono">\${t}</span>
    </div>
    <div class="text-slate-400 leading-relaxed">\${escHtml(d.message||'')}</div>
  \`;
  el.prepend(card);
  if (el.children.length > 50) el.lastChild.remove();
}

function clearMessages() {
  document.getElementById('msg-bus').innerHTML = '<div class="text-[11px] text-slate-600 italic text-center py-3">Cleared</div>';
  msgHasItems = false;
}

// ─── CLI Status ───────────────────────────────────────────────────
async function loadCLIStatus() {
  try {
    const d = await fetch('/api/cli-status').then(r=>r.json());
    S.cliStatus = d;
    renderCLI(d);
  } catch {}
}

function refreshCLI() { loadCLIStatus(); }

function renderCLI(d) {
  const el = document.getElementById('cli-list');
  el.innerHTML = '';
  Object.values(d).forEach(tool => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between gap-2 text-[11px] py-1 px-2 rounded-lg ' + (tool.available ? 'bg-emerald-900/10 border border-emerald-900/30' : 'bg-red-900/10 border border-red-900/20');
    row.innerHTML = \`
      <div class="flex items-center gap-2">
        <span class="dot \${tool.available?'dot-green':'dot-red'}"></span>
        <span class="font-medium text-slate-300">\${tool.label}</span>
      </div>
      <span class="font-mono text-[9px] \${tool.available?'text-emerald-400':'text-red-400'} truncate max-w-20">\${tool.available ? (tool.version||'OK') : 'offline'}</span>
    \`;
    el.appendChild(row);
  });
  // Refresh role selects with available CLIs
  updateRoleSelectOptions(d);
}

// ─── MCP Status ───────────────────────────────────────────────────
async function loadMCPStatus() {
  try {
    const d = await fetch('/api/mcp-status').then(r=>r.json());
    S.mcpStatus = d;
    renderMCP(d);
  } catch {}
}

function renderMCP(d) {
  const el = document.getElementById('mcp-list');
  const items = [
    { label: 'dev-tools MCP', ok: d?.devTools?.available, note: 'mcp-server/dist/index.js' },
    { label: 'Stitch MCP',    ok: d?.stitch?.available,   note: '.claude/mcp.json' },
  ];
  el.innerHTML = items.map(i => \`
    <div class="flex items-center justify-between gap-2 text-[11px] py-1 px-2 rounded-lg \${i.ok?'bg-emerald-900/10 border border-emerald-900/30':'bg-amber-900/10 border border-amber-900/20'}">
      <div class="flex items-center gap-2">
        <span class="dot \${i.ok?'dot-green':'dot-yellow'}"></span>
        <span class="text-slate-300">\${i.label}</span>
      </div>
      <span class="font-mono text-[9px] \${i.ok?'text-emerald-400':'text-amber-400'}">\${i.ok?'running':'not found'}</span>
    </div>
  \`).join('');
}

// ─── Role Assignment ──────────────────────────────────────────────
const ROLES = {
  po:       { label: 'Product Owner', emoji: '🧠' },
  frontend: { label: 'Frontend Dev',  emoji: '🎨' },
  backend:  { label: 'Backend Dev',   emoji: '⚙️'  },
  reviewer: { label: 'Reviewer',      emoji: '🔍' },
  release:  { label: 'Release Mgr',   emoji: '🚀' },
};
const CLI_OPTIONS = ['claude','gemini','copilot','qwen'];

async function loadCLIConfig() {
  try {
    const d = await fetch('/api/cli-config').then(r=>r.json());
    S.cliConfig = d;
    updateRoleSelectValues(d);
  } catch {}
}

function buildRoleForm() {
  const form = document.getElementById('role-form');
  form.innerHTML = '';
  Object.entries(ROLES).forEach(([key, r]) => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between gap-2';
    row.innerHTML = \`
      <div class="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0" style="width:90px">
        <span>\${r.emoji}</span><span class="truncate">\${r.label}</span>
      </div>
      <select id="role-\${key}" class="sel flex-1">
        \${CLI_OPTIONS.map(c=>\`<option value="\${c}" \${S.cliConfig[key]===c?'selected':''}>\${c}</option>\`).join('')}
      </select>
    \`;
    form.appendChild(row);
  });
}

function updateRoleSelectValues(cfg) {
  Object.entries(cfg).forEach(([k,v]) => {
    const sel = document.getElementById('role-'+k);
    if (sel) sel.value = v;
  });
}

function updateRoleSelectOptions(cliStatus) {
  // Disable options for unavailable CLIs
  CLI_OPTIONS.forEach(cli => {
    document.querySelectorAll(\`option[value="\${cli}"]\`).forEach(opt => {
      opt.disabled = cliStatus[cli] && !cliStatus[cli].available;
    });
  });
}

async function saveRoles() {
  const cfg = {};
  Object.keys(ROLES).forEach(k => {
    const el = document.getElementById('role-'+k);
    if (el) cfg[k] = el.value;
  });
  try {
    await fetch('/api/cli-config', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(cfg) });
    S.cliConfig = cfg;
    toast('Role config saved!', 'ok');
  } catch (e) { toast('Save failed: '+e.message, 'err'); }
}

// ─── Projects ─────────────────────────────────────────────────────
async function loadProjects() {
  try {
    const projects = await fetch('/api/projects').then(r=>r.json());
    S.projects = projects;
    renderProjects(projects);
    // Populate devops select
    const sel = document.getElementById('devops-project');
    sel.innerHTML = '<option value="">Current project</option>' +
      projects.map(p=>\`<option value="\${p.name}">\${p.name}</option>\`).join('');
  } catch {}
}

function renderProjects(projects) {
  const el = document.getElementById('projects-list');
  if (!projects.length) { el.innerHTML = '<div class="text-xs text-slate-600 italic">No projects</div>'; return; }
  el.innerHTML = projects.slice(0,10).map(p => {
    const status = p.report?.status || (p.deployUrl ? '✅' : '⏸');
    return \`
      <div class="text-[10px] py-1.5 px-2 rounded-lg glass hover:border-slate-600 cursor-default flex items-center justify-between gap-2">
        <span class="text-slate-300 truncate">\${p.name}</span>
        <div class="flex items-center gap-1 shrink-0">
          \${p.deployUrl?\`<a href="\${p.deployUrl}" target="_blank" class="text-blue-400 hover:underline" title="\${p.deployUrl}"><svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></a>\`:''}
          <span class="text-[9px]">\${status}</span>
        </div>
      </div>
    \`;
  }).join('');
}

// ─── Launch Project ───────────────────────────────────────────────
async function launchProject() {
  const name = document.getElementById('launch-name').value.trim();
  const req  = document.getElementById('launch-req').value.trim();
  const mode = document.getElementById('launch-mode').value;
  if (!name || !req) { toast('Project name and requirement required', 'err'); return; }
  const st = document.getElementById('launch-status');
  st.textContent = 'Sending to daemon...';
  st.classList.remove('hidden');
  try {
    const r = await fetch('/api/launch', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ project: name, requirement: req, flash: mode==='--flash'||undefined, update: mode==='--update'||undefined, fix: mode==='--fix'||undefined }) });
    const d = await r.json();
    if (d.error) { st.textContent = d.error; toast(d.error,'err'); }
    else { st.textContent = 'Queued! Queue: '+d.queueLength; toast('Project queued: '+name,'ok'); }
  } catch(e) { st.textContent = e.message; toast(e.message,'err'); }
}

// ─── Agents Updated ───────────────────────────────────────────────
function onAgentsUpdated(agents) {
  if (!agents || !agents.length) return;
  S.agents = agents;
  buildPipelineStrip(agents);
  buildAgentLogs(agents);
  buildGraph(agents);
}

// ─── DevOps ───────────────────────────────────────────────────────
async function devops(action) {
  const pName = document.getElementById('devops-project').value;
  const out   = document.getElementById('devops-out');
  const url   = document.getElementById('deploy-url');
  out.textContent = action + ' running...';
  out.classList.remove('hidden');
  try {
    const r = await fetch('/api/devops', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action, projectName: pName||undefined }) });
    const d = await r.json();
    out.textContent = (d.stdout || '') + (d.stderr ? '\\nSTDERR: ' + d.stderr : '');
    if (d.ok) {
      toast(action + ' completed', 'ok');
      // Extract deploy URL
      const m = (d.stdout||'').match(/https?:\\/\\/[^\\s\\n]+/);
      if (m && action==='deploy') {
        document.getElementById('deploy-link').href = m[0];
        document.getElementById('deploy-link-text').textContent = m[0];
        url.classList.remove('hidden');
      }
    } else { toast(action + ' failed', 'err'); }
  } catch(e) { out.textContent = 'Error: '+e.message; toast(e.message,'err'); }
}

function onDevopsResult(d) {
  const out = document.getElementById('devops-out');
  out.textContent = (d.stdout||'') + (d.stderr?'\\nSTDERR: '+d.stderr:'');
  out.classList.remove('hidden');
}

// ─── Toast ────────────────────────────────────────────────────────
function toast(msg, type='info') {
  const c = document.getElementById('toast');
  const el = document.createElement('div');
  el.className = 'toast-item toast-' + type;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ─── Kickoff ──────────────────────────────────────────────────────
boot();
</script>
</body>
</html>`;

export { DevTeamDashboard };
