import path from 'path';
import { buildAttachmentText, getDaemonStatus, saveCliConfig } from '../../../lib/dashboard-runtime';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isTextLike(fileName, mimeType) {
  const textExt = /\.(md|markdown|txt|csv|json|yml|yaml|xml|html|htm|js|ts|jsx|tsx|css|scss|sql|env|ini|toml)$/i;
  return textExt.test(fileName || '') || String(mimeType || '').startsWith('text/') || String(mimeType || '').includes('json');
}

function parseJsonField(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function POST(request) {
  try {
    const form = await request.formData();
    const projectName = String(form.get('projectName') || '').trim();
    const requirementText = String(form.get('requirementText') || '').trim();
    const linksText = String(form.get('linksText') || '').trim();
    const modes = parseJsonField(String(form.get('modes') || '{}'), {});
    const cliOverrides = parseJsonField(String(form.get('cliOverrides') || '{}'), {});
    const attachments = form.getAll('attachments');

    if (!projectName) {
      return Response.json({ error: 'projectName is required' }, { status: 400 });
    }

    const parts = [];
    if (requirementText) parts.push(requirementText);

    const links = linksText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (links.length) {
      parts.push(`[REFERENCE LINKS]\n${links.join('\n')}`);
    }

    for (const item of attachments) {
      if (!item || typeof item === 'string') continue;
      const file = item;
      if (!file.name || file.size <= 0) continue;
      const ext = path.extname(file.name).toLowerCase();
      if (isTextLike(file.name, file.type)) {
        const raw = await file.text();
        const clipped = raw.slice(0, 15000);
        parts.push(buildAttachmentText(file.name, file.type || ext || 'text/plain', clipped));
      } else {
        parts.push(buildAttachmentText(file.name, file.type || ext || 'application/octet-stream'));
      }
    }

    const requirement = parts.join('\n\n').trim();
    if (!requirement) {
      return Response.json({ error: 'Requirement is empty after parsing input.' }, { status: 400 });
    }

    if (cliOverrides && Object.keys(cliOverrides).length) {
      saveCliConfig(cliOverrides);
    }

    const daemonPayload = {
      project: projectName,
      requirement,
      quick: !!modes.quick,
      auto: !!modes.auto,
      fix: !!modes.fix,
      update: !!modes.update,
      flash: !!modes.flash,
      cliOverrides,
    };

    const status = await getDaemonStatus();
    if (status.daemon !== 'ok') {
      return Response.json({ error: 'Daemon is offline. Start with: npm run dashboard' }, { status: 503 });
    }
    const daemonPort = status.port || process.env.DAEMON_PORT || process.env.PORT || 8080;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    const enqueueRes = await fetch(`http://localhost:${daemonPort}/enqueue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(daemonPayload),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!enqueueRes.ok) {
      const text = await enqueueRes.text();
      throw new Error(text || `enqueue failed with status ${enqueueRes.status}`);
    }
    const data = await enqueueRes.json();
    return Response.json({ ...data, parsedAttachments: attachments.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
