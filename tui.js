import blessed from 'blessed';
import contrib from 'blessed-contrib';

export class DevTeamTUI {
    constructor(projectName, activeAgents = []) {
        this.screen = blessed.screen({
            smartCSR: true,
            title: `AI Dev Team - ${projectName}`,
            fullUnicode: true,
        });

        // Allow quitting the TUI manually with Ctrl+C, q, or Esc
        this.screen.key(['escape', 'q', 'C-c'], () => {
            return process.exit(0);
        });

        // Create a grid layout: 12 rows, 12 columns
        this.grid = new contrib.grid({ rows: 12, cols: 12, screen: this.screen });

        // Header: Title and Status (Row 0, Col 0, span 1 row, 12 cols)
        this.headerBox = this.grid.set(0, 0, 1, 12, blessed.box, {
            content: `{center}{bold}🚀 AI DEV TEAM PIPELINE - ${projectName}{/bold}{/center}`,
            tags: true,
            style: {
                fg: 'cyan',
                bg: 'black',
            },
        });

        this.agentLogs = {};
        this.agentStates = {}; // Track if an agent is currently "thinking"

        // Dynamic Panes based on number of active sub-agents
        const totalCols = 12;
        const totalRows = 10;
        const numAgents = activeAgents.length;

        if (numAgents > 0) {
            const colors = ['cyan', 'yellow', 'magenta', 'green', 'blue', 'red'];

            // Mathematical 2D Bounding Boxes
            let layouts = [];
            if (numAgents === 1) {
                layouts = [{ r: 1, c: 0, rSpan: 10, cSpan: 12 }]; // 1x1 Full Screen
            } else if (numAgents === 2) {
                layouts = [
                    { r: 1, c: 0, rSpan: 10, cSpan: 6 }, // Left
                    { r: 1, c: 6, rSpan: 10, cSpan: 6 }  // Right
                ];
            } else if (numAgents === 3) {
                layouts = [
                    { r: 1, c: 0, rSpan: 5, cSpan: 6 },  // Top Left
                    { r: 1, c: 6, rSpan: 5, cSpan: 6 },  // Top Right
                    { r: 6, c: 0, rSpan: 5, cSpan: 12 }  // Bottom Full Width
                ];
            } else {
                // 4 or more agents -> Wrap into a 2-col grid
                const rowsPerAgent = Math.floor(totalRows / Math.ceil(numAgents / 2));
                for (let i = 0; i < numAgents; i++) {
                    const rowInd = Math.floor(i / 2);
                    const isLastOdd = (i === numAgents - 1 && numAgents % 2 !== 0);
                    layouts.push({
                        r: 1 + (rowInd * rowsPerAgent),
                        c: (i % 2 === 0 && isLastOdd) ? 0 : (i % 2 === 0 ? 0 : 6),
                        rSpan: rowsPerAgent,
                        cSpan: isLastOdd ? 12 : 6
                    });
                }
            }

            for (let i = 0; i < numAgents; i++) {
                const agent = activeAgents[i];
                const layout = layouts[i];
                const color = colors[i % colors.length];

                this.agentStates[agent.id] = { inThinkBlock: false, color };

                this.agentLogs[agent.id] = this.grid.set(layout.r, layout.c, layout.rSpan, layout.cSpan, contrib.log, {
                    fg: color,
                    selectedFg: 'white',
                    label: ` 💻 ${agent.name} `,
                    tags: true,
                    border: { type: 'line', fg: color },
                });
            }
        }

        // Footer: General System Messages (Row 11, Col 0, span 1 row, 12 cols)
        this.footerBox = this.grid.set(11, 0, 1, 12, blessed.box, {
            content: '{center}Press {bold}Q{/bold} or {bold}Ctrl+C{/bold} to exit. Rendering logs in real-time...{/center}',
            tags: true,
            style: {
                fg: 'gray',
            },
        });

        this.screen.render();
    }

    /**
     * Log a message to a specific agent's pane
     * @param {string} agentId 
     * @param {string} text 
     */
    logToAgent(agentId, text) {
        // Handle multiline output sent by the streaming
        const lines = text.split('\n');

        if (!this.agentLogs[agentId]) return;
        const state = this.agentStates[agentId];

        for (let line of lines) {
            // Trim to avoid empty spam lines, but keep pure whitespace if it's structural
            if (line.trim().length === 0 && line.length > 0) continue;

            // Simple Log Filtering & Parsing
            if (line.includes('<think>')) {
                state.inThinkBlock = true;
                this.agentLogs[agentId].log(`{gray-fg}🤔 Thinking...{/gray-fg}`);
                continue;
            }
            if (line.includes('</think>')) {
                state.inThinkBlock = false;
                this.agentLogs[agentId].log(`{gray-fg}💡 Thought complete.{/gray-fg}`);
                continue;
            }

            if (state.inThinkBlock) {
                // Fade out thought process to reduce UI clutter
                line = `{gray-fg}${line}{/gray-fg}`;
            } else if (line.startsWith('```') || line.startsWith('>')) {
                // Highlight action blocks
                line = `{white-fg}${line}{/white-fg}`;
            } else {
                // Default agent color
                line = `{${state.color}-fg}${line}{/${state.color}-fg}`;
            }

            this.agentLogs[agentId].log(line);
        }
    }

    /**
     * Set a top level status or update title
     * @param {string} text 
     */
    updateStatus(text) {
        this.headerBox.setContent(`{center}{bold}🚀 ${text}{/bold}{/center}`);
        this.screen.render();
    }

    /**
     * Destroy the TUI to return control to standard stdout
     */
    destroy() {
        this.screen.destroy();
    }
}
