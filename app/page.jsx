'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileItem, Files, FolderContent, FolderItem, FolderTrigger, SubFiles } from '../components/animate-ui/files';

const ROLE_KEYS = ['po', 'frontend', 'backend', 'reviewer', 'release', 'coder'];
const CLI_OPTIONS = ['codex', 'copilot', 'gemini', 'qwen'];
const MODE_OPTIONS = [
  { key: 'quick', label: 'Quick', hint: '1 retry · timeout ngắn' },
  { key: 'auto', label: 'Auto', hint: 'Không hỏi giữa phase' },
  { key: 'fix', label: 'Fix Bug', hint: 'Đi thẳng vào fix flow' },
  { key: 'update', label: 'Update', hint: 'Cập nhật project hiện có' },
  { key: 'flash', label: 'Flash', hint: 'Tối ưu tốc độ build MVP' },
];

const NODE_LAYOUT = {
  po: { x: 10, y: 50 },
  frontend: { x: 32, y: 26 },
  backend: { x: 32, y: 74 },
  reviewer: { x: 58, y: 50 },
  release: { x: 80, y: 50 },
  archivist: { x: 93, y: 50 },
};

function roleLabel(key) {
  if (key === 'po') return 'Product Owner';
  if (key === 'frontend') return 'Frontend';
  if (key === 'backend') return 'Backend';
  if (key === 'reviewer') return 'Reviewer';
  if (key === 'release') return 'Release';
  return 'Coder';
}

function formatBytes(size) {
  if (!size || size <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  const rounded = value >= 10 || idx === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded} ${units[idx]}`;
}

async function getJson(url, init) {
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (!res.ok) {
    throw new Error(`${url} -> ${res.status}`);
  }
  return await res.json();
}

export default function DashboardPage() {
  const [workflow, setWorkflow] = useState(null);
  const [cliStatus, setCliStatus] = useState({});
  const [mcpStatus, setMcpStatus] = useState({});
  const [cliConfig, setCliConfig] = useState({});
  const [projects, setProjects] = useState([]);
  const [daemonStatus, setDaemonStatus] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState('po');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const [projectName, setProjectName] = useState('');
  const [requirementText, setRequirementText] = useState('');
  const [linksText, setLinksText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [modes, setModes] = useState({
    quick: false,
    auto: true,
    fix: false,
    update: false,
    flash: false,
  });

  const selectedNode = useMemo(() => {
    if (!workflow?.nodes?.length) return null;
    return workflow.nodes.find((n) => n.id === selectedNodeId) || workflow.nodes[0];
  }, [workflow, selectedNodeId]);

  const linkCount = useMemo(() => {
    return linksText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean).length;
  }, [linksText]);

  const loadCore = async () => {
    const [w, c, m, cfg, p, d] = await Promise.allSettled([
      getJson('/api/workflow-state'),
      getJson('/api/cli-status'),
      getJson('/api/mcp-status'),
      getJson('/api/cli-config'),
      getJson('/api/projects'),
      getJson('/api/daemon-status'),
    ]);
    if (w.status === 'fulfilled') {
      setWorkflow(w.value);
      if (!projectName && w.value?.project && !String(w.value.project).startsWith('No active')) {
        setProjectName(w.value.project);
      }
    }
    if (c.status === 'fulfilled') setCliStatus(c.value);
    if (m.status === 'fulfilled') setMcpStatus(m.value);
    if (cfg.status === 'fulfilled') setCliConfig(cfg.value);
    if (p.status === 'fulfilled') setProjects(p.value?.projects || []);
    if (d.status === 'fulfilled') setDaemonStatus(d.value);

    const failed = [w, c, m, cfg, p, d].filter((x) => x.status === 'rejected');
    if (failed.length === 6) {
      throw new Error('All dashboard endpoints failed');
    }
  };

  useEffect(() => {
    loadCore().catch((e) => setMessage(`Load failed: ${e.message}`));
    const timer = setInterval(() => {
      loadCore().catch(() => {});
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const onToggleMode = (key) => {
    setModes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onAttachmentChange = (event) => {
    const files = Array.from(event.target.files || []);
    setAttachments(files);
  };

  const saveRoleRouter = async () => {
    setBusy(true);
    try {
      const next = await getJson('/api/cli-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliConfig),
      });
      setCliConfig(next.config || next);
      setMessage('Role-CLI router saved.');
    } catch (e) {
      setMessage(`Save router failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const launchPipeline = async () => {
    setBusy(true);
    setMessage('');
    try {
      if (!projectName.trim()) throw new Error('Project name is required.');
      if (!requirementText.trim() && attachments.length === 0 && !linksText.trim()) {
        throw new Error('Please provide requirement text, links, or attachments.');
      }

      const fd = new FormData();
      fd.set('projectName', projectName.trim());
      fd.set('requirementText', requirementText.trim());
      fd.set('linksText', linksText.trim());
      fd.set('modes', JSON.stringify(modes));
      fd.set('cliOverrides', JSON.stringify(cliConfig));
      for (const file of attachments) {
        fd.append('attachments', file);
      }

      const result = await getJson('/api/launch', { method: 'POST', body: fd });
      setMessage(`Queued: ${result.project} (queue: ${result.queueLength})`);
      await loadCore();
    } catch (e) {
      setMessage(`Launch failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page">
      <header className="topbar panel">
        <div>
          <h1>AI Dev Team Command Canvas</h1>
          <p>Workflow-first dashboard · n8n-style flow · role to CLI routing</p>
        </div>
        <div className="daemon-pill">
          <span className={`dot ${daemonStatus?.daemon === 'ok' ? 'ok' : 'err'}`} />
          <span>
            {daemonStatus?.daemon === 'ok'
              ? `Daemon live · queue ${daemonStatus?.queueLength ?? 0}`
              : 'Daemon offline'}
          </span>
        </div>
      </header>

      <section className="layout">
        <aside className="panel left">
          <h2>Project Composer</h2>
          <label>Project Name</label>
          <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="my-awesome-project" />

          <label>Requirement (Text)</label>
          <textarea
            rows={8}
            value={requirementText}
            onChange={(e) => setRequirementText(e.target.value)}
            placeholder="Mô tả yêu cầu dự án..."
          />

          <label>Links (1 dòng 1 link)</label>
          <textarea
            rows={3}
            value={linksText}
            onChange={(e) => setLinksText(e.target.value)}
            placeholder="https://..."
          />

          <label>Attachments (file/ảnh/pdf)</label>
          <input type="file" multiple onChange={onAttachmentChange} />
          <Files className="section-files">
            <FolderItem defaultOpen>
              <FolderTrigger>Input Bundle</FolderTrigger>
              <FolderContent>
                <SubFiles>
                  <FileItem>
                    <span>requirement.txt</span>
                    <small>{requirementText.trim().length} chars</small>
                  </FileItem>
                  <FileItem>
                    <span>links.list</span>
                    <small>{linkCount} links</small>
                  </FileItem>
                  <FolderItem defaultOpen={attachments.length > 0}>
                    <FolderTrigger>attachments ({attachments.length})</FolderTrigger>
                    <FolderContent>
                      <SubFiles>
                        {attachments.length ? attachments.map((f) => (
                          <FileItem key={`${f.name}-${f.size}`}>
                            <span>{f.name}</span>
                            <small>{formatBytes(f.size)}</small>
                          </FileItem>
                        )) : (
                          <FileItem className="muted">
                            <span>No attachments yet</span>
                          </FileItem>
                        )}
                      </SubFiles>
                    </FolderContent>
                  </FolderItem>
                </SubFiles>
              </FolderContent>
            </FolderItem>
          </Files>

          <label>Pipeline Modes</label>
          <div className="mode-grid">
            {MODE_OPTIONS.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`mode-btn ${modes[m.key] ? 'active' : ''}`}
                onClick={() => onToggleMode(m.key)}
              >
                <strong>{m.label}</strong>
                <small>{m.hint}</small>
              </button>
            ))}
          </div>

          <button className="launch-btn" onClick={launchPipeline} disabled={busy}>
            {busy ? 'Launching...' : 'Launch Workflow'}
          </button>
          {message && <p className="message">{message}</p>}
        </aside>

        <section className="panel center">
          <h2>Workflow Canvas</h2>
          <div className="canvas">
            <svg className="edges" viewBox="0 0 100 100" preserveAspectRatio="none">
              {(workflow?.edges || []).map((edge) => {
                const from = NODE_LAYOUT[edge.from];
                const to = NODE_LAYOUT[edge.to];
                if (!from || !to) return null;
                const fromNode = workflow?.nodes?.find((n) => n.id === edge.from);
                const toNode = workflow?.nodes?.find((n) => n.id === edge.to);
                const running = fromNode?.status === 'running' || toNode?.status === 'running';
                const failed = fromNode?.status === 'failed' || toNode?.status === 'failed';
                return (
                  <line
                    key={`${edge.from}-${edge.to}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    className={`edge ${running ? 'running' : ''} ${failed ? 'failed' : ''}`}
                  />
                );
              })}
            </svg>

            {(workflow?.nodes || []).map((node) => {
              const pos = NODE_LAYOUT[node.id] || { x: 50, y: 50 };
              return (
                <button
                  key={node.id}
                  className={`node ${node.status} ${selectedNodeId === node.id ? 'selected' : ''}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  <div className="emoji">{node.emoji}</div>
                  <div className="label">{node.label}</div>
                  <div className="meta">{node.cli}</div>
                  <div className="state">{node.status}</div>
                </button>
              );
            })}
          </div>
          <div className="canvas-footer">
            <span>Project: <strong>{workflow?.project || 'N/A'}</strong></span>
            <span>Updated: {workflow?.timestamp ? new Date(workflow.timestamp).toLocaleTimeString() : '--'}</span>
          </div>
        </section>

        <aside className="panel right">
          <h2>Role Router</h2>
          <Files className="section-files">
            <FolderItem defaultOpen>
              <FolderTrigger>role-cli-map.json</FolderTrigger>
              <FolderContent>
                <SubFiles>
                  {ROLE_KEYS.map((role) => (
                    <FileItem key={role} className="router-file-item">
                      <span>{roleLabel(role)}</span>
                      <select
                        value={cliConfig[role] || ''}
                        onChange={(e) => setCliConfig((prev) => ({ ...prev, [role]: e.target.value }))}
                      >
                        {CLI_OPTIONS.map((cli) => (
                          <option key={cli} value={cli}>{cli}</option>
                        ))}
                      </select>
                    </FileItem>
                  ))}
                </SubFiles>
              </FolderContent>
            </FolderItem>
          </Files>
          <button className="save-btn" onClick={saveRoleRouter} disabled={busy}>Save Router</button>

          <h2>System Health</h2>
          <Files className="section-files">
            <FolderItem defaultOpen>
              <FolderTrigger>mcp-health</FolderTrigger>
              <FolderContent>
                <SubFiles>
                  <FileItem>
                    <span>dev-tools.mcp</span>
                    <strong className={mcpStatus?.devTools?.available ? 'ok' : 'err'}>
                      {mcpStatus?.devTools?.available ? 'online' : 'offline'}
                    </strong>
                  </FileItem>
                  <FileItem>
                    <span>stitch.mcp</span>
                    <strong className={(mcpStatus?.stitch?.configured && mcpStatus?.stitch?.credentials) ? 'ok' : 'warn'}>
                      {(mcpStatus?.stitch?.configured && mcpStatus?.stitch?.credentials) ? 'ready' : 'bypassed'}
                    </strong>
                  </FileItem>
                </SubFiles>
              </FolderContent>
            </FolderItem>
            <FolderItem defaultOpen>
              <FolderTrigger>cli-health</FolderTrigger>
              <FolderContent>
                <SubFiles>
                  {Object.values(cliStatus || {}).map((cli) => (
                    <FileItem key={cli.id}>
                      <span>{cli.label}</span>
                      <strong className={cli.available ? 'ok' : 'err'}>
                        {cli.available ? 'ok' : 'missing'}
                      </strong>
                    </FileItem>
                  ))}
                </SubFiles>
              </FolderContent>
            </FolderItem>
          </Files>

          <h2>Node Inspector</h2>
          {selectedNode ? (
            <Files className="section-files">
              <FolderItem defaultOpen>
                <FolderTrigger>{selectedNode.label}</FolderTrigger>
                <FolderContent>
                  <SubFiles>
                    <FileItem>
                      <span>cli</span>
                      <strong>{selectedNode.cli}</strong>
                    </FileItem>
                    <FileItem>
                      <span>status</span>
                      <strong className={selectedNode.status}>{selectedNode.status}</strong>
                    </FileItem>
                  </SubFiles>
                </FolderContent>
              </FolderItem>
            </Files>
          ) : (
            <p className="hint">Select node to inspect.</p>
          )}

          <h2>Recent Projects</h2>
          <Files className="section-files">
            <FolderItem defaultOpen>
              <FolderTrigger>projects</FolderTrigger>
              <FolderContent>
                <SubFiles>
                  {projects.slice(0, 8).map((p) => (
                    <FileItem
                      key={p.name}
                      as="button"
                      type="button"
                      className="project-file-item"
                      onClick={() => setProjectName(p.name)}
                    >
                      <span>{p.name}</span>
                      <small>{new Date(p.mtime).toLocaleDateString()}</small>
                    </FileItem>
                  ))}
                </SubFiles>
              </FolderContent>
            </FolderItem>
          </Files>
        </aside>
      </section>
    </main>
  );
}
