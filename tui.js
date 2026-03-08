import blessed from 'blessed';
import contrib from 'blessed-contrib';

const AGENT_COLORS = ['cyan', 'yellow', 'magenta', 'green', 'blue', 'red'];

export class DevTeamTUI {
    constructor(projectName, activeAgents = []) {
        this.screen = blessed.screen({
            smartCSR: true,
            title: `AI Dev Team - ${projectName}`,
            fullUnicode: true,
            dockBorders: true,
        });

        this.screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

        this.grid = new contrib.grid({ rows: 12, cols: 12, screen: this.screen });

        this.headerBox = this.grid.set(0, 0, 1, 12, blessed.box, {
            content: `{center}{bold}GEMINI-STYLE MULTI-AGENT TUI · ${projectName}{/bold}{/center}`,
            tags: true,
            style: { fg: 'white', bg: 'blue' },
            border: { type: 'line', fg: 'cyan' },
        });

        this.agentLogs = {};
        this.agentStates = {};
        this.notifications = [];

        const numAgents = activeAgents.length;
        if (numAgents > 0) {
            const layouts = this.buildLayouts(numAgents);

            for (let i = 0; i < numAgents; i++) {
                const agent = activeAgents[i];
                const layout = layouts[i];
                const color = AGENT_COLORS[i % AGENT_COLORS.length];

                this.agentStates[agent.id] = {
                    inThinkBlock: false,
                    color,
                    name: agent.name,
                    status: 'idle',
                };

                this.agentLogs[agent.id] = this.grid.set(layout.r, layout.c, layout.rSpan, layout.cSpan, contrib.log, {
                    fg: 'white',
                    selectedFg: 'white',
                    label: ` ● ${agent.name} · idle `,
                    tags: true,
                    border: { type: 'line', fg: color },
                });
            }
        }

        this.notificationBox = this.grid.set(10, 0, 1, 12, blessed.box, {
            content: '{center}{gray-fg}No attachments{/gray-fg}{/center}',
            tags: true,
            style: { fg: 'yellow', bg: 'black' },
            border: { type: 'line', fg: 'yellow' },
            label: ' Attachments ',
        });

        this.footerBox = this.grid.set(11, 0, 1, 12, blessed.box, {
            content: '{center}{bold}Gemini-style{/bold}: live logs · status labels · think blocks | Press Q / Ctrl+C to exit{/center}',
            tags: true,
            style: { fg: 'gray', bg: 'black' },
            border: { type: 'line', fg: 'gray' },
        });

        this.screen.render();
    }

    buildLayouts(numAgents) {
        if (numAgents === 1) return [{ r: 1, c: 0, rSpan: 9, cSpan: 12 }];
        if (numAgents === 2) return [
            { r: 1, c: 0, rSpan: 9, cSpan: 6 },
            { r: 1, c: 6, rSpan: 9, cSpan: 6 },
        ];
        if (numAgents === 3) return [
            { r: 1, c: 0, rSpan: 5, cSpan: 6 },
            { r: 1, c: 6, rSpan: 5, cSpan: 6 },
            { r: 6, c: 0, rSpan: 4, cSpan: 12 },
        ];

        const layouts = [];
        const totalRows = 9;
        const rowsPerAgent = Math.floor(totalRows / Math.ceil(numAgents / 2));
        for (let i = 0; i < numAgents; i++) {
            const rowInd = Math.floor(i / 2);
            const isLastOdd = i === numAgents - 1 && numAgents % 2 !== 0;
            layouts.push({
                r: 1 + (rowInd * rowsPerAgent),
                c: (i % 2 === 0 && isLastOdd) ? 0 : (i % 2 === 0 ? 0 : 6),
                rSpan: rowsPerAgent,
                cSpan: isLastOdd ? 12 : 6,
            });
        }
        return layouts;
    }

    setAgentStatus(agentId, status, tone = null) {
        const state = this.agentStates[agentId];
        const panel = this.agentLogs[agentId];
        if (!state || !panel) return;

        state.status = status;
        const icon = status === 'running' ? '▶'
            : status === 'thinking' ? '…'
                : status === 'error' ? '✖'
                    : status === 'ready' ? '✓'
                        : '●';
        const label = ` ${icon} ${state.name} · ${status} `;
        panel.setLabel(label);
        if (tone) panel.style.border.fg = tone;
    }

    logToAgent(agentId, text) {
        const panel = this.agentLogs[agentId];
        const state = this.agentStates[agentId];
        if (!panel || !state) return;

        const lines = String(text).split('\n');

        for (let rawLine of lines) {
            if (rawLine.trim().length === 0 && rawLine.length > 0) continue;
            let line = rawLine;
            const trimmed = line.trim();

            if (line.includes('<think>')) {
                state.inThinkBlock = true;
                this.setAgentStatus(agentId, 'thinking', 'yellow');
                panel.log('{yellow-fg}… thinking{/yellow-fg}');
                continue;
            }
            if (line.includes('</think>')) {
                state.inThinkBlock = false;
                this.setAgentStatus(agentId, 'running', state.color);
                panel.log('{green-fg}✓ thought complete{/green-fg}');
                continue;
            }

            if (/Run\s+\d+\s*-\s*Attempt/i.test(trimmed)) {
                this.setAgentStatus(agentId, 'running', state.color);
                panel.log(`{cyan-fg}▶ ${trimmed}{/cyan-fg}`);
                continue;
            }

            if (/Output saved|APPROVED|PASSED|completed/i.test(trimmed)) {
                this.setAgentStatus(agentId, 'ready', 'green');
            }

            if (/Error:|FAILED|❌|Pipeline FAILED/i.test(trimmed)) {
                this.setAgentStatus(agentId, 'error', 'red');
            }

            if (/MCP issues detected|Connection closed|token/i.test(trimmed)) {
                panel.log(`{yellow-fg}⚠ ${line}{/yellow-fg}`);
                continue;
            }

            if (state.inThinkBlock) {
                line = `{gray-fg}${line}{/gray-fg}`;
            } else if (line.startsWith('```') || line.startsWith('>')) {
                line = `{white-fg}${line}{/white-fg}`;
            } else if (/Error:|FAILED|❌/i.test(trimmed)) {
                line = `{red-fg}${line}{/red-fg}`;
            } else if (/APPROVED|PASSED|SUCCESS|✓/i.test(trimmed)) {
                line = `{green-fg}${line}{/green-fg}`;
            } else {
                line = `{${state.color}-fg}${line}{/${state.color}-fg}`;
            }

            panel.log(line);
        }

        this.screen.render();
    }

    showAttachmentNotification(attachment) {
        const icon = {
            image: '📷',
            markdown: '📄',
            pdf: '📕',
            file: '📎',
            link: '🔗',
            voice: '🎤',
            audio: '🎵',
            video: '🎬',
        }[attachment.type] || '📎';

        const sizeStr = attachment.size ? ` (${this.formatSize(attachment.size)})` : '';
        const note = `{yellow-fg}${icon} ${attachment.name}${sizeStr}{/yellow-fg}`;

        this.notifications.unshift(note);
        if (this.notifications.length > 3) this.notifications.pop();
        this.updateNotificationBox();
    }

    updateNotificationBox() {
        if (this.notifications.length === 0) {
            this.notificationBox.setContent('{center}{gray-fg}No attachments{/gray-fg}{/center}');
        } else {
            this.notificationBox.setContent(this.notifications.join('  |  '));
        }
        this.screen.render();
    }

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    updateStatus(text) {
        this.headerBox.setContent(`{center}{bold}${text}{/bold}{/center}`);
        this.screen.render();
    }

    destroy() {
        this.screen.destroy();
    }
}
